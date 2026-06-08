"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useUIStore } from "@/lib/zustand/ui-store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPrice } from "@/lib/utils";
import { COMMERCE } from "@/lib/constants";

/**
 * Slide-in cart drawer. Opened from the header cart button and after "Add to
 * cart"; gives a quick line-item view with qty controls and a checkout CTA
 * without leaving the current page. The full /cart page remains available.
 */
export function CartDrawer() {
  const { items, updateQuantity, removeItem, subtotal, totalItems, hydrated } =
    useCart();
  const { cartOpen, closeCart } = useUIStore();
  const pathname = usePathname();

  // Close on route change.
  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [cartOpen, closeCart]);

  const count = hydrated ? totalItems : 0;
  const shipping =
    subtotal >= COMMERCE.freeShippingThreshold ? 0 : COMMERCE.flatShipping;
  const remaining = Math.max(0, COMMERCE.freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/40"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col bg-surface shadow-floating"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-headline-md font-semibold text-on-surface">
                <Icon name="shopping_cart" size={22} className="text-primary" />
                Your Cart{" "}
                <span className="text-on-surface-variant">({count})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-surface-variant hover:text-primary"
              >
                <Icon name="close" size={22} />
              </button>
            </div>

            {/* Body */}
            {!hydrated ? (
              <div className="flex-1 p-5">
                <div className="h-24 animate-pulse rounded-xl bg-surface-container" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
                  <Icon name="shopping_bag" size={30} />
                </span>
                <div>
                  <p className="text-body-lg font-semibold text-on-surface">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    Add items to see them here.
                  </p>
                </div>
                <Button asChild onClick={closeCart}>
                  <Link href="/products">
                    <Icon name="shopping_bag" size={18} /> Start shopping
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 py-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={closeCart}
                            className="line-clamp-1 text-label-md font-semibold text-on-surface hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name}`}
                            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                        <span className="text-label-sm text-on-surface-variant">
                          {item.vendorName}
                        </span>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-outline-variant">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                              className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                            >
                              <Icon name="remove" size={16} />
                            </button>
                            <span className="w-7 text-center text-label-md font-semibold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              aria-label="Increase quantity"
                              className="flex h-7 w-7 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:text-primary disabled:opacity-40"
                            >
                              <Icon name="add" size={16} />
                            </button>
                          </div>
                          <span className="text-label-md font-bold tabular-nums text-on-surface">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}

            {/* Footer */}
            {hydrated && items.length > 0 && (
              <div className="border-t border-line bg-surface-container-lowest px-5 py-4">
                {shipping > 0 ? (
                  <p className="mb-3 text-label-sm text-on-surface-variant">
                    Add{" "}
                    <span className="font-semibold text-on-surface">
                      {formatPrice(remaining)}
                    </span>{" "}
                    more for free shipping.
                  </p>
                ) : (
                  <p className="mb-3 flex items-center gap-1 text-label-sm text-success">
                    <Icon name="check_circle" size={16} filled /> You&apos;ve unlocked free shipping!
                  </p>
                )}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-body-md text-on-surface-variant">Subtotal</span>
                  <span className="text-headline-md font-bold tabular-nums text-on-surface">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Button asChild size="lg" className="w-full" onClick={closeCart}>
                  <Link href="/checkout">
                    <Icon name="lock" size={18} /> Checkout
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="mt-2 w-full" onClick={closeCart}>
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
