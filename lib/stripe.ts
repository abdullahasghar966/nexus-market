/** Stripe server SDK singleton — SERVER ONLY. Lazily constructed. */
import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set. See .env.example.");
  }

  // apiVersion omitted on purpose — the installed SDK's pinned default is used,
  // avoiding TS literal-mismatch friction across Stripe versions.
  stripeSingleton = new Stripe(secretKey, { typescript: true });
  return stripeSingleton;
}
