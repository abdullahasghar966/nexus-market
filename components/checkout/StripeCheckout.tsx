"use client";

import { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripeCardElementOptions } from "@stripe/stripe-js";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import { getStripeClient } from "@/lib/stripe-client";
import {
  CheckoutSkeleton,
  Confirmation,
  EmptyCart,
  EMPTY_SHIPPING,
  OrderSummary,
  ShippingSection,
  computeTotals,
  finalizeOrder,
  validateShipping,
  type Placed,
  type ShippingField,
  type ShippingForm,
} from "./shared";

const CARD_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: "#0f172a",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      "::placeholder": { color: "rgba(71,85,105,0.55)" },
    },
    invalid: { color: "#b91c1c", iconColor: "#b91c1c" },
  },
};

/** Inner form — must be a descendant of <Elements> to use the Stripe hooks. */
function StripeForm() {
  const { items, subtotal, totalItems, hydrated, clearCart } = useCart();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();

  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [shipErr, setShipErr] = useState<Partial<Record<ShippingField, string>>>({});
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const { shipping: shipCost, tax, total } = computeTotals(subtotal);

  const setShip = (key: ShippingField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((f) => ({ ...f, [key]: e.target.value }));
    if (shipErr[key]) setShipErr((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sErr = validateShipping(shipping);
    setShipErr(sErr);
    if (Object.keys(sErr).length > 0) {
      toast.error("Please fix the highlighted fields");
      document
        .querySelector<HTMLElement>("[data-invalid='true']")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!stripe || !elements) {
      toast.error("Payment form is still loading — try again in a moment.");
      return;
    }
    const card = elements.getElement(CardElement);
    if (!card) return;
    if (!cardComplete) {
      setCardError("Enter your full card details.");
      return;
    }

    setSubmitting(true);
    const snapshot = items;
    try {
      // 1. Create the PaymentIntent on the server.
      const res = await fetch("/api/checkout/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, currency: "usd", email: shipping.email }),
      });
      if (!res.ok) {
        toast.error("Payments are unavailable right now. Please try again later.");
        setSubmitting(false);
        return;
      }
      const { clientSecret } = (await res.json()) as { clientSecret: string };

      // 2. Confirm the card payment in the browser.
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: `${shipping.firstName} ${shipping.lastName}`.trim(),
            email: shipping.email,
          },
        },
      });
      if (error) {
        setCardError(error.message ?? "Payment failed.");
        toast.error(error.message ?? "Payment failed.");
        setSubmitting(false);
        return;
      }

      // 3. Persist the order on success.
      if (paymentIntent?.status === "succeeded") {
        const result = await finalizeOrder({
          shipping,
          items: snapshot,
          subtotal,
          shippingCost: shipCost,
          tax,
          total,
          userId: user?.uid,
          paymentIntentId: paymentIntent.id,
        });
        setPlaced(result);
        clearCart();
        toast.success("Payment successful", {
          description: `Confirmation ${result.orderNumber}`,
        });
      } else {
        toast.message("Payment is processing", {
          description: "We'll confirm your order shortly.",
        });
      }
    } catch {
      toast.error("Something went wrong processing your payment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated) return <CheckoutSkeleton />;
  if (placed) return <Confirmation placed={placed} />;
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Secure Checkout
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Provide your details below to complete your order.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-8">
          <ShippingSection form={shipping} errors={shipErr} set={setShip} />

          <section className="rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-headline-md font-semibold text-on-surface">
                <Icon name="credit_card" size={24} className="text-primary" />
                Payment Method
              </h2>
              <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                <Icon name="lock" size={16} /> Powered by Stripe
              </span>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-label-md text-on-surface">
                  Card details
                </span>
                <div
                  className="flex h-11 items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3.5 shadow-sm transition-colors focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary"
                  data-invalid={!!cardError}
                >
                  <CardElement
                    options={CARD_OPTIONS}
                    className="w-full"
                    onChange={(ev) => {
                      setCardComplete(ev.complete);
                      setCardError(ev.error?.message ?? null);
                    }}
                  />
                </div>
                {cardError && (
                  <span className="mt-1 block text-label-sm normal-case tracking-normal text-error">
                    {cardError}
                  </span>
                )}
              </label>
              <p className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                <Icon name="bolt" size={16} className="text-accent" />
                Test mode — use card 4242 4242 4242 4242, any future date, any CVC
                &amp; ZIP.
              </p>
            </div>
          </section>
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          totalItems={totalItems}
          shipping={shipCost}
          tax={tax}
          total={total}
          submitting={submitting}
          disabled={!stripe}
          submitLabel={
            submitting ? "Processing…" : `Pay ${formatPrice(total)}`
          }
        />
      </form>
    </div>
  );
}

/**
 * Live Stripe Elements checkout. Mounted by `CheckoutView` only when
 * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is configured.
 */
export function StripeCheckout() {
  return (
    <Elements
      stripe={getStripeClient()}
      options={{
        appearance: {
          variables: {
            colorPrimary: "#12284c",
            fontFamily: "Inter, system-ui, sans-serif",
            borderRadius: "8px",
          },
        },
      }}
    >
      <StripeForm />
    </Elements>
  );
}
