"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import { COMMERCE } from "@/lib/constants";

export function CartView() {
  const { items, updateQuantity, removeItem, subtotal, totalItems, hydrated } =
    useCart();

  if (!hydrated) {
    return (
      <div className="container-page py-20">
        <div className="h-48 animate-pulse rounded-xl bg-surface-container" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[55vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
          <Icon name="shopping_cart" size={32} />
        </span>
        <h1 className="mt-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          Your cart is empty
        </h1>
        <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
          Browse the marketplace and add the items you love.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">
            <Icon name="shopping_bag" size={20} /> Start shopping
          </Link>
        </Button>
      </div>
    );
  }

  const shipping =
    subtotal >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.flatShipping;
  const tax = Math.round(subtotal * COMMERCE.taxRate * 100) / 100;
  const total = subtotal + shipping + tax;

  return (
    <div className="container-page py-10">
      <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
        Your Cart <span className="text-on-surface-variant">({totalItems})</span>
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-container-lowest">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.productId}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 p-4"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-label-sm normal-case tracking-normal text-on-surface-variant">
                      No image
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="line-clamp-1 text-body-md font-semibold text-on-surface hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <div className="text-label-sm text-primary-container">
                        {item.vendorName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name}`}
                      className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                    >
                      <Icon name="delete" size={20} />
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center rounded-full border border-outline-variant">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                      >
                        <Icon name="remove" size={18} />
                      </button>
                      <span className="w-8 text-center text-label-md font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.maxStock}
                        aria-label="Increase quantity"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                      >
                        <Icon name="add" size={18} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-body-md font-bold text-on-surface tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-label-sm normal-case tracking-normal text-on-surface-variant">
                          {formatPrice(item.price)}/ea
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <aside className="h-fit rounded-xl border border-line bg-surface-container-lowest p-6 lg:sticky lg:top-24">
          <h2 className="text-headline-md font-semibold text-on-surface">
            Order Summary
          </h2>
          <dl className="mt-4 space-y-3 text-body-md">
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Shipping</dt>
              <dd className="font-medium tabular-nums">
                {shipping === 0 ? (
                  <span className="text-success">Free</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Tax (est.)</dt>
              <dd className="font-medium tabular-nums">{formatPrice(tax)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-body-lg font-semibold text-on-surface">Total</span>
            <span className="text-headline-md font-bold text-primary tabular-nums">
              {formatPrice(total)}
            </span>
          </div>
          {shipping > 0 && (
            <p className="mt-2 text-label-sm normal-case tracking-normal text-on-surface-variant">
              Add {formatPrice(COMMERCE.freeShippingThreshold - subtotal)} more for
              free shipping.
            </p>
          )}
          <Button asChild className="mt-5 w-full">
            <Link href="/checkout">
              <Icon name="lock" size={18} /> Proceed to Checkout
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
