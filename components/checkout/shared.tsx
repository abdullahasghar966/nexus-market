"use client";

/**
 * Shared checkout building blocks used by both the Stripe path (StripeCheckout)
 * and the credential-free fallback (MockCheckout): the shipping form section,
 * the order-summary aside, validation, totals math, the confirmation screen,
 * and the `finalizeOrder` seam that persists a placed order everywhere
 * (localStorage + Firestore realtime + Mongo/email via the API).
 */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import { COMMERCE } from "@/lib/constants";
import { fadeInUp } from "@/components/animations/variants";
import {
  saveOrder,
  generateOrderNumber,
  type TrackedOrder,
} from "@/lib/orders";
import { saveOrderToFirestore } from "@/lib/firestore-orders";
import type { CartItem } from "@/types";

/* ───────────────────────────── Shipping form ───────────────────────────── */

export type ShippingField =
  | "firstName"
  | "lastName"
  | "email"
  | "line1"
  | "city"
  | "state"
  | "postalCode"
  | "country";

export type ShippingForm = Record<ShippingField, string>;

export const EMPTY_SHIPPING: ShippingForm = {
  firstName: "",
  lastName: "",
  email: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "United States",
};

export function validateShipping(
  form: ShippingForm,
): Partial<Record<ShippingField, string>> {
  const errors: Partial<Record<ShippingField, string>> = {};
  const required: ShippingField[] = [
    "firstName",
    "lastName",
    "email",
    "line1",
    "city",
    "state",
    "postalCode",
    "country",
  ];
  for (const key of required) {
    if (!form[key].trim()) errors[key] = "Required";
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email";
  return errors;
}

export function computeTotals(subtotal: number) {
  const shipping =
    subtotal >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.flatShipping;
  const tax = Math.round(subtotal * COMMERCE.taxRate * 100) / 100;
  const total = subtotal + shipping + tax;
  return { shipping, tax, total };
}

/* ───────────────────────────── Field wrapper ───────────────────────────── */

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-label-md text-on-surface">{label}</span>
      {children}
      {error && (
        <span className="mt-1 block text-label-sm normal-case tracking-normal text-error">
          {error}
        </span>
      )}
    </label>
  );
}

/* ─────────────────────────── Shipping section ───────────────────────────── */

export function ShippingSection({
  form,
  errors,
  set,
}: {
  form: ShippingForm;
  errors: Partial<Record<ShippingField, string>>;
  set: (key: ShippingField) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
      <h2 className="mb-6 flex items-center gap-2 text-headline-md font-semibold text-on-surface">
        <Icon name="local_shipping" size={24} className="text-primary" />
        Shipping Information
      </h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="First name" error={errors.firstName}>
            <Input value={form.firstName} onChange={set("firstName")} placeholder="Jane" data-invalid={!!errors.firstName} />
          </Field>
          <Field label="Last name" error={errors.lastName}>
            <Input value={form.lastName} onChange={set("lastName")} placeholder="Doe" data-invalid={!!errors.lastName} />
          </Field>
        </div>
        <Field label="Email address" error={errors.email}>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="jane.doe@example.com" data-invalid={!!errors.email} />
        </Field>
        <Field label="Street address" error={errors.line1}>
          <Input value={form.line1} onChange={set("line1")} placeholder="123 Market St" data-invalid={!!errors.line1} />
        </Field>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="City" error={errors.city}>
            <Input value={form.city} onChange={set("city")} placeholder="San Francisco" data-invalid={!!errors.city} />
          </Field>
          <Field label="State / Province" error={errors.state}>
            <Input value={form.state} onChange={set("state")} placeholder="CA" data-invalid={!!errors.state} />
          </Field>
          <Field label="ZIP / Postal code" error={errors.postalCode}>
            <Input value={form.postalCode} onChange={set("postalCode")} placeholder="94105" data-invalid={!!errors.postalCode} />
          </Field>
        </div>
        <Field label="Country" error={errors.country}>
          <Input value={form.country} onChange={set("country")} placeholder="United States" data-invalid={!!errors.country} />
        </Field>
      </div>
    </section>
  );
}

/* ──────────────────────────── Order summary ─────────────────────────────── */

export function OrderSummary({
  items,
  subtotal,
  totalItems,
  shipping,
  tax,
  total,
  submitLabel,
  submitting,
  disabled,
}: {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  shipping: number;
  tax: number;
  total: number;
  submitLabel: string;
  submitting: boolean;
  disabled?: boolean;
}) {
  return (
    <aside className="h-fit rounded-xl border border-line bg-surface-container-lowest p-6 shadow-floating lg:sticky lg:top-24">
      <h2 className="mb-4 border-b border-line pb-4 text-headline-md font-semibold text-on-surface">
        Order Summary
      </h2>
      <ul className="mb-5 space-y-4">
        {items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-container-high">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              )}
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold tabular-nums text-on-primary">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-label-md text-on-surface">{item.name}</p>
              <p className="text-label-sm text-on-surface-variant">{item.vendorName}</p>
            </div>
            <span className="text-label-md font-semibold tabular-nums text-on-surface">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="space-y-3 border-t border-line pt-4 text-body-md">
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Subtotal ({totalItems})</dt>
          <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Shipping</dt>
          <dd className="font-medium tabular-nums">
            {shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Estimated taxes</dt>
          <dd className="font-medium tabular-nums">{formatPrice(tax)}</dd>
        </div>
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <span className="text-body-lg font-semibold text-on-surface">Total</span>
        <span className="text-headline-md font-bold tabular-nums text-primary">
          {formatPrice(total)}
        </span>
      </div>

      <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting || disabled}>
        <Icon name="lock" size={18} />
        {submitLabel}
      </Button>

      <div className="mt-5 flex flex-col items-center gap-1 text-center">
        <span className="flex items-center gap-1 text-label-md text-secondary">
          <Icon name="verified_user" size={20} filled /> Secure 256-bit SSL checkout
        </span>
        <p className="text-label-sm text-on-surface-variant">
          Your information is encrypted and never shared.
        </p>
      </div>
    </aside>
  );
}

/* ──────────────────────────── Confirmation ──────────────────────────────── */

export interface Placed {
  orderNumber: string;
  email: string;
  items: CartItem[];
  total: number;
}

export function Confirmation({ placed }: { placed: Placed }) {
  const count = placed.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center"
    >
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-container text-success">
        <Icon name="check_circle" size={44} filled />
      </span>
      <h1 className="mt-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
        Thank you — your order is placed!
      </h1>
      <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
        We&apos;ve emailed a confirmation to{" "}
        <span className="font-medium text-on-surface">{placed.email}</span>. Your
        items will ship in 1–2 business days.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-xl border border-line bg-surface-container-lowest p-6 text-left shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Order number</span>
          <span className="text-label-md font-bold tabular-nums text-primary">
            {placed.orderNumber}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Items</span>
          <span className="text-label-md font-semibold tabular-nums text-on-surface">
            {count}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
          <span className="text-body-md font-semibold text-on-surface">Total paid</span>
          <span className="text-body-lg font-bold tabular-nums text-on-surface">
            {formatPrice(placed.total)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={`/track?order=${placed.orderNumber}`}>
            <Icon name="local_shipping" size={20} /> Track order
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Empty-cart / loading ─────────────────────────── */

export function CheckoutSkeleton() {
  return (
    <div className="container-page py-20">
      <div className="h-64 animate-pulse rounded-xl bg-surface-container" />
    </div>
  );
}

export function EmptyCart() {
  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Icon name="shopping_cart" size={32} />
      </span>
      <h1 className="mt-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
        Nothing to check out
      </h1>
      <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
        Your cart is empty — add a few items first.
      </p>
      <Button asChild className="mt-6">
        <Link href="/products">
          <Icon name="shopping_bag" size={20} /> Browse products
        </Link>
      </Button>
    </div>
  );
}

/* ──────────────────────── Order-finalization seam ───────────────────────── */

/**
 * Persist a placed order to every layer (best-effort):
 *  1. localStorage (always — guest + offline fallback)
 *  2. Firestore (signed-in only — realtime /track status)
 *  3. Mongo + confirmation email via POST /api/orders (system of record)
 * Returns the data the Confirmation screen needs.
 */
export async function finalizeOrder(args: {
  shipping: ShippingForm;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  userId?: string;
  paymentIntentId?: string;
}): Promise<Placed> {
  const orderNumber = generateOrderNumber();
  const record: TrackedOrder = {
    orderNumber,
    userId: args.userId,
    email: args.shipping.email,
    placedAt: new Date().toISOString(),
    status: "processing",
    items: args.items.map((i) => ({
      productId: i.productId,
      slug: i.slug,
      name: i.name,
      image: i.image,
      vendorId: i.vendorId,
      vendorName: i.vendorName,
      quantity: i.quantity,
      price: i.price,
    })),
    subtotal: args.subtotal,
    shipping: args.shippingCost,
    tax: args.tax,
    total: args.total,
    shippingAddress: {
      fullName: `${args.shipping.firstName} ${args.shipping.lastName}`.trim(),
      line1: args.shipping.line1,
      city: args.shipping.city,
      state: args.shipping.state,
      postalCode: args.shipping.postalCode,
      country: args.shipping.country,
    },
    paymentIntentId: args.paymentIntentId,
  };

  saveOrder(record);
  await saveOrderToFirestore(record);
  try {
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
  } catch {
    /* server persistence is best-effort; customer copy already saved */
  }

  return {
    orderNumber,
    email: record.email,
    items: args.items,
    total: args.total,
  };
}
