import { describe, it, expect, beforeEach } from "vitest";
import {
  useCartStore,
  selectSubtotal,
  selectTotalItems,
} from "./cart-store";

const base = {
  productId: "p1",
  slug: "p1",
  name: "Test Product",
  price: 10,
  image: "",
  vendorId: "v1",
  vendorName: "Vendor",
  maxStock: 5,
};

describe("cart store", () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it("adds an item with quantity", () => {
    useCartStore.getState().addItem(base, 2);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(selectTotalItems(state)).toBe(2);
    expect(selectSubtotal(state)).toBe(20);
  });

  it("merges duplicates and caps at maxStock", () => {
    useCartStore.getState().addItem(base, 3);
    useCartStore.getState().addItem(base, 10);
    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(5); // capped at maxStock
  });

  it("updates and clamps quantity", () => {
    useCartStore.getState().addItem(base, 1);
    useCartStore.getState().updateQuantity("p1", 99);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity("p1", 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it("removes an item", () => {
    useCartStore.getState().addItem(base, 1);
    useCartStore.getState().removeItem("p1");
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
