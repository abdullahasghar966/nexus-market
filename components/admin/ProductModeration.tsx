"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { cn, formatPrice } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToAllProducts,
  updateProduct,
  deleteProduct,
  type StoredProduct,
} from "@/lib/firestore-products";
import { PRODUCTS } from "@/lib/data/sample";

export function ProductModeration() {
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToAllProducts((list) => {
      setProducts(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function toggleActive(p: StoredProduct) {
    try {
      await updateProduct(p.id, { isActive: !p.isActive });
      toast.success(p.isActive ? "Listing removed" : "Listing approved");
    } catch {
      toast.error("Action failed — admin access required.");
    }
  }
  async function remove(p: StoredProduct) {
    if (!window.confirm(`Delete "${p.name}" from the catalogue?`)) return;
    try {
      await deleteProduct(p.id);
      toast.success("Product deleted");
    } catch {
      toast.error("Could not delete product");
    }
  }

  const showDemo = !loading && products.length === 0;

  return (
    <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="px-6 py-3 font-semibold">Product</th>
              <th className="px-6 py-3 font-semibold">Vendor</th>
              <th className="px-6 py-3 font-semibold">Price</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-body-md">
            {loading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                  Loading catalogue…
                </td>
              </tr>
            )}

            {!loading &&
              products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container-high">
                        {p.image && <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />}
                      </div>
                      <span className="line-clamp-1 font-medium text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{p.vendorName}</td>
                  <td className="px-6 py-4 font-medium tabular-nums text-on-surface">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                        p.isActive
                          ? "bg-success-container text-on-success-container"
                          : "bg-surface-variant text-on-surface-variant",
                      )}
                    >
                      {p.isActive ? "Live" : "Removed"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(p)}
                        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
                      >
                        <Icon name={p.isActive ? "block" : "check_circle"} size={16} />
                        {p.isActive ? "Remove" : "Approve"}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${p.name}`}
                        onClick={() => remove(p)}
                        className="rounded-lg border border-error/40 p-2 text-error transition-colors hover:bg-error-container/30"
                      >
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {showDemo &&
              PRODUCTS.map((p) => (
                <tr key={p.id} className="text-on-surface-variant">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container-high">
                        <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <span className="line-clamp-1 font-medium text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.vendor.name}</td>
                  <td className="px-6 py-4 font-medium tabular-nums text-on-surface">{formatPrice(p.price)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide bg-success-container text-on-success-container">
                      Live
                    </span>
                  </td>
                  <td className="px-6 py-4" />
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {showDemo && (
        <p className="border-t border-outline-variant p-4 text-center text-label-sm text-on-surface-variant">
          Demo catalogue shown — vendor-listed products appear here for moderation.
        </p>
      )}
    </section>
  );
}
