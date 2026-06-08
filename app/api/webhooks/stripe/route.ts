import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

/**
 * Stripe webhook receiver.
 *
 * Verifies the signature with STRIPE_WEBHOOK_SECRET, then reconciles payment
 * status onto the Mongo order (which the checkout already created). The customer
 * copy lives in Firestore/localStorage, so this is a server-side source-of-truth
 * reconciliation, not the primary order path.
 *
 * Local testing:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

// Stripe needs the raw, unparsed body to verify the signature.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    // Build-safe: unconfigured → acknowledge softly so Stripe stops retrying.
    return NextResponse.json({ received: true, skipped: "unconfigured" });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = getStripe().webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook] verify failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await reconcileOrder(pi.id, "processing");
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await reconcileOrder(pi.id, "cancelled");
        break;
      }
      default:
        // Unhandled event types are fine — just acknowledge.
        break;
    }
  } catch (err) {
    // Don't fail the webhook on a reconciliation hiccup — Stripe would retry
    // forever. Log and acknowledge.
    console.error("[stripe webhook] handler error:", err);
  }

  return NextResponse.json({ received: true });
}

async function reconcileOrder(
  paymentIntentId: string,
  status: "processing" | "cancelled",
): Promise<void> {
  try {
    await connectToDatabase();
    await Order.updateOne(
      { paymentIntentId },
      { $set: { status, paymentIntentId } },
    );
  } catch (err) {
    console.error("[stripe webhook] order reconcile skipped/failed:", err);
  }
}
