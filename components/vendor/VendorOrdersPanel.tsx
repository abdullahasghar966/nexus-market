"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/icon";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToRecentOrders,
  updateOrderStatus,
} from "@/lib/firestore-orders";
import type { TrackedOrder } from "@/lib/orders";
import { ORDER_STATUS_PILL, VENDOR_ORDERS } from "@/lib/data/dashboard";
import { ORDER_STATUSES } from "@/lib/constants";
import type { OrderStatus } from "@/types";

export function VendorOrdersPanel() {
  const [live, setLive] = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToRecentOrders((orders) => {
      setLive(orders);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function changeStatus(orderNumber: string, status: OrderStatus) {
    const ok = await updateOrderStatus(orderNumber, status);
    if (ok) toast.success(`Order ${orderNumber} → ${status}`);
    else toast.error("Could not update order status");
  }

  const showDemo = live.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-headline-lg-mobile text-on-background md:text-headline-lg">
          Orders
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {showDemo
            ? "Demo orders — real orders appear here as customers check out. Update a live order's status and the customer's tracking page updates instantly."
            : "Update an order's status and the customer's tracking page reflects it in real time."}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface-container-lowest shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-body-md">
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    Loading orders…
                  </td>
                </tr>
              )}

              {!loading && !showDemo &&
                live.map((o) => (
                  <tr key={o.orderNumber} className="transition-colors hover:bg-surface-container-low">
                    <td className="p-4 font-medium text-on-surface">{o.orderNumber}</td>
                    <td className="p-4 text-on-surface-variant">{o.email}</td>
                    <td className="p-4 text-on-surface-variant">{formatDate(o.placedAt)}</td>
                    <td className="p-4 font-medium tabular-nums text-on-surface">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <select
                        aria-label={`Status for ${o.orderNumber}`}
                        value={o.status}
                        onChange={(e) => changeStatus(o.orderNumber, e.target.value as OrderStatus)}
                        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-label-md capitalize text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}

              {!loading && showDemo &&
                VENDOR_ORDERS.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="p-4 font-medium text-on-surface">#{o.id}</td>
                    <td className="p-4 text-on-surface">{o.customer}</td>
                    <td className="p-4 text-on-surface-variant">{formatDate(o.date)}</td>
                    <td className="p-4 font-medium tabular-nums text-on-surface">{formatPrice(o.amount)}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                          ORDER_STATUS_PILL[o.status],
                        )}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDemo && !loading && (
        <p className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
          <Icon name="bolt" size={16} className="text-accent" />
          Place an order from the storefront while signed in to see it appear here live.
        </p>
      )}
    </div>
  );
}
