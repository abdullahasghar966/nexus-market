import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { connectToDatabase } from "@/lib/mongodb";
import { adminDb } from "@/lib/firebase-admin";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { sendOrderConfirmation } from "@/lib/email";
import type { Address, OrderStatus } from "@/types";

export const runtime = "nodejs";

/**
 * Persist a placed order to MongoDB (system of record), decrement stock, and
 * send a confirmation email. Called by the checkout after a successful payment
 * (Stripe) or a simulated order (mock).
 *
 * Every external step is best-effort and isolated: a missing MONGODB_URI /
 * RESEND_API_KEY (or a transient failure) degrades to `{ persisted: false }`
 * rather than failing the order — Firestore + localStorage already hold the
 * customer-facing copy. So the route never 500s on an unconfigured backend.
 */

interface IncomingItem {
  productId?: string;
  slug?: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  vendorId?: string;
  vendorName?: string;
}

interface IncomingOrder {
  orderNumber: string;
  userId?: string;
  email: string;
  items: IncomingItem[];
  shippingAddress?: Partial<Address>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
  status?: OrderStatus;
  paymentIntentId?: string;
}

export async function POST(req: NextRequest) {
  let body: IncomingOrder;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.orderNumber || !body.email || !Array.isArray(body.items)) {
    return NextResponse.json(
      { error: "Missing orderNumber, email, or items" },
      { status: 400 },
    );
  }

  const result = {
    persisted: false,
    stockUpdated: false,
    realtimeStockUpdated: false,
    emailed: false,
  };

  // ── MongoDB (system of record) ──────────────────────────────────────────
  try {
    await connectToDatabase();
    const addr = body.shippingAddress ?? {};
    await Order.updateOne(
      { orderNumber: body.orderNumber },
      {
        $setOnInsert: {
          orderNumber: body.orderNumber,
          userId: body.userId ?? "guest",
          email: body.email,
          items: body.items.map((i) => ({
            productId: i.productId ?? i.slug ?? "unknown",
            name: i.name,
            slug: i.slug ?? "",
            image: i.image ?? "",
            price: i.price,
            quantity: i.quantity,
            vendorId: i.vendorId ?? "unknown",
            vendorName: i.vendorName ?? "Nexus Market",
          })),
          shippingAddress: {
            fullName: addr.fullName ?? body.email,
            line1: addr.line1 ?? "",
            line2: addr.line2,
            city: addr.city ?? "",
            state: addr.state ?? "",
            postalCode: addr.postalCode ?? "",
            country: addr.country ?? "",
            phone: addr.phone,
          },
          subtotal: body.subtotal,
          shipping: body.shipping,
          tax: body.tax,
          total: body.total,
          currency: body.currency ?? "USD",
          status: body.status ?? "processing",
          paymentIntentId: body.paymentIntentId,
        },
      },
      { upsert: true },
    );
    result.persisted = true;

    // Decrement stock for each line (best-effort, by slug).
    try {
      await Promise.all(
        body.items
          .filter((i) => i.slug)
          .map((i) =>
            Product.updateOne(
              { slug: i.slug },
              { $inc: { stockCount: -Math.abs(i.quantity) } },
            ),
          ),
      );
      result.stockUpdated = true;
    } catch (err) {
      console.error("[orders] stock decrement failed", err);
    }
  } catch (err) {
    console.error("[orders] Mongo persist skipped/failed", err);
  }

  // ── Realtime stock — Firestore `stock/{productId}` (best-effort) ─────────
  // Drives `useRealtimeStock` on product cards/detail. Admin SDK bypasses the
  // (admin-only) stock write rule. Keyed by productId so it matches the hook.
  try {
    const fdb = adminDb();
    await Promise.all(
      body.items
        .filter((i) => i.productId)
        .map((i) =>
          fdb
            .collection("stock")
            .doc(i.productId as string)
            .set(
              {
                stockCount: FieldValue.increment(-Math.abs(i.quantity)),
                name: i.name,
                updatedAt: new Date().toISOString(),
              },
              { merge: true },
            ),
        ),
    );
    result.realtimeStockUpdated = true;
  } catch (err) {
    console.error("[orders] realtime stock decrement skipped/failed", err);
  }

  // ── Confirmation email (best-effort) ────────────────────────────────────
  try {
    const email = await sendOrderConfirmation({
      to: body.email,
      orderNumber: body.orderNumber,
      items: body.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total: body.total,
    });
    result.emailed = email.sent;
  } catch (err) {
    console.error("[orders] email failed", err);
  }

  return NextResponse.json({ ok: true, orderNumber: body.orderNumber, ...result });
}
