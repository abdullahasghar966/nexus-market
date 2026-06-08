/**
 * Realtime stock helpers (Firestore `stock/{productId}`) — CLIENT ONLY.
 *
 * The `stock` collection is the realtime source read by `useRealtimeStock` on
 * product cards + the detail page. Writes are admin-only (security rules), so
 * these are used by the admin "seed/reset demo stock" control. Purchases
 * decrement the same docs server-side via the Admin SDK in /api/orders.
 */
import { doc, setDoc, writeBatch } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { PRODUCTS } from "@/lib/data/sample";

/**
 * Seed (or reset) the realtime stock docs for the sample catalogue to their
 * baseline counts. Returns the number of products seeded. Admin-only.
 */
export async function seedStockFromCatalogue(): Promise<number> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firestore is not configured.");
  }
  const batch = writeBatch(db);
  for (const p of PRODUCTS) {
    batch.set(doc(db, "stock", p.id), {
      stockCount: p.stockCount,
      name: p.name,
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
  return PRODUCTS.length;
}

/** Set an exact stock count for one product (admin-only). */
export async function setStock(
  productId: string,
  stockCount: number,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  await setDoc(
    doc(db, "stock", productId),
    { stockCount: Math.max(0, stockCount), updatedAt: new Date().toISOString() },
    { merge: true },
  );
}
