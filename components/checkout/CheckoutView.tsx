"use client";

import { MockCheckout } from "./MockCheckout";
import { StripeCheckout } from "./StripeCheckout";

/**
 * Checkout entry point. Auto-switches to live Stripe Elements when a publishable
 * key is configured; otherwise falls back to the credential-free mock checkout
 * (proven, identical UX) so the storefront always has a working checkout.
 */
const stripeEnabled = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function CheckoutView() {
  return stripeEnabled ? <StripeCheckout /> : <MockCheckout />;
}
