import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

/**
 * Create a Stripe PaymentIntent for the checkout.
 *
 * POST { amount: number (dollars), currency?: string, email?: string }
 *   → { clientSecret }
 *
 * `getStripe()` is lazy and throws when STRIPE_SECRET_KEY is unset; we catch
 * that and return a 503 so the client can fall back to the mock checkout
 * instead of crashing.
 */
export async function POST(req: NextRequest) {
  let body: { amount?: unknown; currency?: unknown; email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const currency =
    typeof body.currency === "string" ? body.currency.toLowerCase() : "usd";
  const email = typeof body.email === "string" ? body.email : undefined;

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // dollars → cents
      currency,
      payment_method_types: ["card"],
      receipt_email: email,
      metadata: { source: "nexus-market" },
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    // Missing key (build-safe mode) or Stripe outage → 503, client falls back.
    const unconfigured = message.includes("STRIPE_SECRET_KEY");
    console.error("[POST /api/checkout/payment-intent]", message);
    return NextResponse.json(
      { error: unconfigured ? "Payments not configured" : "Could not start payment" },
      { status: unconfigured ? 503 : 500 },
    );
  }
}
