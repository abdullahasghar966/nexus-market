"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import {
  CheckoutSkeleton,
  Confirmation,
  EmptyCart,
  EMPTY_SHIPPING,
  Field,
  OrderSummary,
  ShippingSection,
  computeTotals,
  finalizeOrder,
  validateShipping,
  type Placed,
  type ShippingField,
  type ShippingForm,
} from "./shared";

/** Card fields are mock-only — Stripe Elements replaces them when configured. */
type CardField = "cardNumber" | "expiry" | "cvc" | "nameOnCard";
type CardForm = Record<CardField, string>;

const EMPTY_CARD: CardForm = {
  cardNumber: "",
  expiry: "",
  cvc: "",
  nameOnCard: "",
};

function validateCard(card: CardForm): Partial<Record<CardField, string>> {
  const errors: Partial<Record<CardField, string>> = {};
  for (const key of Object.keys(card) as CardField[]) {
    if (!card[key].trim()) errors[key] = "Required";
  }
  if (card.cardNumber && card.cardNumber.replace(/\s/g, "").length < 12)
    errors.cardNumber = "Enter a valid card number";
  if (card.expiry && !/^\d{2}\/\d{2}$/.test(card.expiry.trim()))
    errors.expiry = "Use MM/YY";
  if (card.cvc && !/^\d{3,4}$/.test(card.cvc.trim())) errors.cvc = "3–4 digits";
  return errors;
}

/**
 * The credential-free checkout: simulates payment and places the order. Used
 * automatically when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not configured.
 */
export function MockCheckout() {
  const { items, subtotal, totalItems, hydrated, clearCart } = useCart();
  const { user } = useAuth();
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [card, setCard] = useState<CardForm>(EMPTY_CARD);
  const [shipErr, setShipErr] = useState<Partial<Record<ShippingField, string>>>({});
  const [cardErr, setCardErr] = useState<Partial<Record<CardField, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const { shipping: shipCost, tax, total } = computeTotals(subtotal);

  const setShip = (key: ShippingField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setShipping((f) => ({ ...f, [key]: e.target.value }));
    if (shipErr[key]) setShipErr((er) => ({ ...er, [key]: undefined }));
  };
  const setCardField = (key: CardField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCard((f) => ({ ...f, [key]: e.target.value }));
    if (cardErr[key]) setCardErr((er) => ({ ...er, [key]: undefined }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sErr = validateShipping(shipping);
    const cErr = validateCard(card);
    setShipErr(sErr);
    setCardErr(cErr);
    if (Object.keys(sErr).length + Object.keys(cErr).length > 0) {
      toast.error("Please fix the highlighted fields");
      const first = document.querySelector<HTMLElement>("[data-invalid='true']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    const snapshot = items;
    try {
      // Simulate processing latency, then persist everywhere.
      await new Promise((r) => setTimeout(r, 650));
      const result = await finalizeOrder({
        shipping,
        items: snapshot,
        subtotal,
        shippingCost: shipCost,
        tax,
        total,
        userId: user?.uid,
      });
      setPlaced(result);
      clearCart();
      toast.success("Order placed", {
        description: `Confirmation ${result.orderNumber}`,
      });
    } catch {
      toast.error("Something went wrong placing your order");
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
            <div className="space-y-4">
              <Field label="Card number" error={cardErr.cardNumber}>
                <div className="relative">
                  <Icon name="credit_card" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                  <Input value={card.cardNumber} onChange={setCardField("cardNumber")} placeholder="4242 4242 4242 4242" inputMode="numeric" className="pl-10" data-invalid={!!cardErr.cardNumber} />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiration" error={cardErr.expiry}>
                  <Input value={card.expiry} onChange={setCardField("expiry")} placeholder="MM/YY" data-invalid={!!cardErr.expiry} />
                </Field>
                <Field label="CVC" error={cardErr.cvc}>
                  <Input value={card.cvc} onChange={setCardField("cvc")} placeholder="123" inputMode="numeric" data-invalid={!!cardErr.cvc} />
                </Field>
              </div>
              <Field label="Name on card" error={cardErr.nameOnCard}>
                <Input value={card.nameOnCard} onChange={setCardField("nameOnCard")} placeholder="Jane Doe" data-invalid={!!cardErr.nameOnCard} />
              </Field>
              <p className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
                <Icon name="bolt" size={16} className="text-accent" />
                Demo checkout — no real payment is processed. Live Stripe Elements
                arrive when credentials are configured.
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
          submitLabel={
            submitting ? "Placing order…" : `Complete Purchase · ${formatPrice(total)}`
          }
        />
      </form>
    </div>
  );
}
