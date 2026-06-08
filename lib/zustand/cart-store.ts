import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

/** No-op storage on the server keeps persist SSR-safe. */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            const nextQty = Math.min(
              existing.quantity + quantity,
              item.maxStock,
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: nextQty }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, item.maxStock) },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "atelier-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
    },
  ),
);

/* Reactive selectors */
export const selectTotalItems = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (state: CartState): number =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
