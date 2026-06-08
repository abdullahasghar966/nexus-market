import { describe, it, expect, beforeEach } from "vitest";
import {
  saveOrder,
  loadOrder,
  loadLatestOrder,
  patchOrderStatus,
  generateOrderNumber,
  type TrackedOrder,
} from "./orders";

function makeOrder(orderNumber: string, status: TrackedOrder["status"] = "processing"): TrackedOrder {
  return {
    orderNumber,
    email: "shopper@example.com",
    placedAt: new Date().toISOString(),
    status,
    items: [
      { name: "Headphones", image: "", vendorName: "Pulse Audio", quantity: 1, price: 89.99 },
    ],
    subtotal: 89.99,
    shipping: 15,
    tax: 7.2,
    total: 112.19,
  };
}

describe("orders persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("generates order numbers in the NX- format", () => {
    expect(generateOrderNumber()).toMatch(/^NX-[0-9A-Z]+$/);
  });

  it("saves and loads an order by number", () => {
    saveOrder(makeOrder("NX-AAA111"));
    expect(loadOrder("NX-AAA111")?.email).toBe("shopper@example.com");
    expect(loadOrder("NX-MISSING")).toBeNull();
  });

  it("returns the most recently saved order as latest", () => {
    saveOrder(makeOrder("NX-OLD"));
    saveOrder(makeOrder("NX-NEW"));
    expect(loadLatestOrder()?.orderNumber).toBe("NX-NEW");
  });

  it("dedupes by order number (re-saving replaces, not duplicates)", () => {
    saveOrder(makeOrder("NX-DUP", "processing"));
    saveOrder(makeOrder("NX-DUP", "shipped"));
    expect(loadOrder("NX-DUP")?.status).toBe("shipped");
  });

  it("patches the status of an existing order", () => {
    saveOrder(makeOrder("NX-PATCH", "processing"));
    patchOrderStatus("NX-PATCH", "delivered");
    expect(loadOrder("NX-PATCH")?.status).toBe("delivered");
  });

  it("ignores a status patch for an unknown order", () => {
    patchOrderStatus("NX-NOPE", "delivered");
    expect(loadOrder("NX-NOPE")).toBeNull();
  });
});
