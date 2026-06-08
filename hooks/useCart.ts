"use client";

import { useEffect, useState } from "react";
import {
  useCartStore,
  selectTotalItems,
  selectSubtotal,
} from "@/lib/zustand/cart-store";

/** True once the persisted cart has rehydrated from localStorage. */
export function useCartHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    const unsub = useCartStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    return unsub;
  }, []);
  return hydrated;
}

/** Convenience facade over the cart store with derived totals. */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore(selectTotalItems);
  const subtotal = useCartStore(selectSubtotal);
  const hydrated = useCartHydrated();

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    hydrated,
  };
}
