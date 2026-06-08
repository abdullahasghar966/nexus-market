"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

/**
 * Live stock count for a product, backed by a Firestore `stock/{productId}`
 * document. Falls back to the server-rendered initial value when Firestore
 * is unavailable, so product pages never break.
 */
export function useRealtimeStock(
  productId: string,
  initialStock: number,
): number {
  const [stock, setStock] = useState(initialStock);

  useEffect(() => {
    setStock(initialStock);
    if (!isFirebaseConfigured || !productId) return;

    const ref = doc(db, "stock", productId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data();
        if (data && typeof data.stockCount === "number") {
          setStock(data.stockCount);
        }
      },
      () => {
        // network/permission error — retain last known value
      },
    );
    return () => unsub();
  }, [productId, initialStock]);

  return stock;
}
