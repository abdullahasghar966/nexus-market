/**
 * Client-side order persistence (localStorage) so the checkout → order-tracking
 * flow works end-to-end even without a backend. When the user is signed in and
 * Firebase is configured, orders are *also* mirrored to Firestore for realtime
 * status (see `lib/firestore-orders.ts`); localStorage remains the offline /
 * guest fallback.
 */
import type { Address, OrderStatus } from "@/types";

export interface TrackedOrderItem {
  productId?: string;
  slug?: string;
  name: string;
  image: string;
  vendorId?: string;
  vendorName: string;
  quantity: number;
  price: number;
}

export interface TrackedOrder {
  orderNumber: string;
  /** Firebase uid when the order was placed signed-in; omitted for guests. */
  userId?: string;
  email: string;
  placedAt: string; // ISO
  status: OrderStatus;
  items: TrackedOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress?: Address;
  paymentIntentId?: string;
}

const KEY = "nexus-orders";

function readAll(): TrackedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as TrackedOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: TrackedOrder): void {
  if (typeof window === "undefined") return;
  try {
    const list = readAll().filter((o) => o.orderNumber !== order.orderNumber);
    list.unshift(order);
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function loadOrder(orderNumber: string): TrackedOrder | null {
  return readAll().find((o) => o.orderNumber === orderNumber) ?? null;
}

export function loadLatestOrder(): TrackedOrder | null {
  return readAll()[0] ?? null;
}

/** Patch the status of a locally-stored order (e.g. from a realtime update). */
export function patchOrderStatus(
  orderNumber: string,
  status: OrderStatus,
): void {
  if (typeof window === "undefined") return;
  const existing = loadOrder(orderNumber);
  if (existing) saveOrder({ ...existing, status });
}

/** Human-friendly, reasonably-unique order number (NX-XXXXXX). */
export function generateOrderNumber(): string {
  return "NX-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}
