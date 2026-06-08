/**
 * Firestore order mirror for realtime tracking — CLIENT ONLY.
 *
 * Browser Firestore works on this network (the browser trusts the intercepting
 * CA), so signed-in orders are written here for live status updates on /track.
 * Every function is a no-op / graceful fallback when Firebase is unconfigured,
 * so the checkout flow never breaks (localStorage remains the source of truth
 * for guests and offline).
 */
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { TrackedOrder } from "@/lib/orders";
import type { OrderStatus } from "@/types";

const COLLECTION = "orders";

/** Strip `undefined` values — Firestore rejects them. */
function clean<T extends Record<string, unknown>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/** Mirror a placed order to Firestore (best-effort). Returns true on success. */
export async function saveOrderToFirestore(
  order: TrackedOrder,
): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !order.userId) return false;
  try {
    await setDoc(doc(db, COLLECTION, order.orderNumber), {
      ...clean(order as unknown as Record<string, unknown>),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}

/** Fetch a single order once (used as a non-realtime fallback). */
export async function fetchOrder(
  orderNumber: string,
): Promise<TrackedOrder | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const snap = await getDoc(doc(db, COLLECTION, orderNumber));
    return snap.exists() ? (snap.data() as TrackedOrder) : null;
  } catch {
    return null;
  }
}

/**
 * Subscribe to live updates for one order. Returns an unsubscribe function
 * (a no-op when Firebase is unavailable). `cb` fires with null if the order
 * isn't in Firestore (caller should fall back to localStorage).
 */
export function subscribeToOrder(
  orderNumber: string,
  cb: (order: TrackedOrder | null) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb(null);
    return () => {};
  }
  const unsub = onSnapshot(
    doc(db, COLLECTION, orderNumber),
    (snap) => cb(snap.exists() ? (snap.data() as TrackedOrder) : null),
    () => cb(null),
  );
  return unsub;
}

/** Subscribe to all of a user's orders, newest first (for an order history). */
export function subscribeToUserOrders(
  userId: string,
  cb: (orders: TrackedOrder[]) => void,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("placedAt", "desc"),
  );
  const unsub = onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as TrackedOrder)),
    () => cb([]),
  );
  return unsub;
}

/** One-shot fetch of a user's orders (newest first). */
export async function fetchUserOrders(userId: string): Promise<TrackedOrder[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("placedAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TrackedOrder);
  } catch {
    return [];
  }
}

/**
 * Subscribe to the most recent orders across the platform (vendor/admin views).
 * Readable by vendors/admins per security rules; resolves empty otherwise.
 */
export function subscribeToRecentOrders(
  cb: (orders: TrackedOrder[]) => void,
  max = 20,
): () => void {
  if (!isFirebaseConfigured || !db) {
    cb([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTION),
    orderBy("placedAt", "desc"),
    limit(max),
  );
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => d.data() as TrackedOrder)),
    () => cb([]),
  );
}

/**
 * Update an order's status (vendor/admin action). The customer's /track page,
 * subscribed via `subscribeToOrder`, reflects the change live.
 */
export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus,
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await updateDoc(doc(db, COLLECTION, orderNumber), {
      status,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
}
