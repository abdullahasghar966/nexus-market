"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  loadOrder,
  loadLatestOrder,
  patchOrderStatus,
  type TrackedOrder,
} from "@/lib/orders";
import { subscribeToOrder } from "@/lib/firestore-orders";
import { PRODUCTS } from "@/lib/data/sample";
import type { MaterialIcon } from "@/lib/icons";
import type { OrderStatus } from "@/types";

const STEPS: { key: OrderStatus; label: string; icon: MaterialIcon }[] = [
  { key: "placed", label: "Placed", icon: "check" },
  { key: "processing", label: "Processing", icon: "inventory_2" },
  { key: "shipped", label: "Shipped", icon: "local_shipping" },
  { key: "delivered", label: "Delivered", icon: "home" },
];

const STATUS_PILL: Record<OrderStatus, string> = {
  placed: "bg-surface-container-high text-on-surface-variant",
  processing: "bg-primary-fixed text-on-primary-fixed-variant",
  shipped: "bg-secondary-container text-on-secondary-container",
  delivered: "bg-success-container text-on-success-container",
  cancelled: "bg-error-container text-on-error-container",
};

const STATUS_MESSAGE: Record<OrderStatus, string> = {
  placed: "We’ve received your order and it’s being prepared.",
  processing: "Your order is being packed and will ship shortly.",
  shipped: "Your package is on its way and will arrive soon.",
  delivered: "Your order has been delivered. Enjoy!",
  cancelled: "This order was cancelled.",
};

const STATUS_ICON: Record<OrderStatus, MaterialIcon> = {
  placed: "check",
  processing: "inventory_2",
  shipped: "local_shipping",
  delivered: "home",
  cancelled: "cancel",
};

/** Demo order shown when /track is opened without a real (stored) order. */
function demoOrder(): TrackedOrder {
  const pick = [PRODUCTS[1], PRODUCTS[2]]; // smartwatch + earbuds
  const items = pick.map((p, idx) => ({
    name: p.name,
    image: p.images[0],
    vendorName: p.vendor.name,
    quantity: idx === 1 ? 2 : 1,
    price: p.price,
  }));
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  return {
    orderNumber: "NX-DEMO24",
    email: "you@example.com",
    placedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: "shipped",
    items,
    subtotal,
    shipping: 0,
    tax,
    total: subtotal + tax,
  };
}

export function OrderTracker() {
  const params = useSearchParams();
  const requested = params.get("order") ?? "";
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Resolve immediately from localStorage (guest + offline copy).
    const local =
      (requested && loadOrder(requested)) || loadLatestOrder() || null;
    if (local) {
      setOrder(local);
      setIsDemo(false);
    } else {
      setOrder(demoOrder());
      setIsDemo(true);
    }
    setReady(true);

    // 2. Subscribe to Firestore for live status (signed-in owner only; denied
    //    reads / unconfigured Firebase resolve to null and we keep the local copy).
    const num = requested || local?.orderNumber;
    if (!num) return;
    const unsub = subscribeToOrder(num, (live) => {
      if (live) {
        setOrder(live);
        setIsDemo(false);
        setIsLive(true);
        patchOrderStatus(live.orderNumber, live.status);
      }
    });
    return () => unsub();
  }, [requested]);

  if (!ready || !order) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-surface-container" />
      </div>
    );
  }

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((s) => s.key === order.status),
  );
  const cancelled = order.status === "cancelled";
  const progress = cancelled
    ? 0
    : (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="container-page py-12">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card md:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-secondary-container opacity-20 blur-3xl" />

        {isDemo && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-label-sm text-on-surface-variant">
            <Icon name="bolt" size={16} className="text-accent" />
            Demo order — place an order at checkout to track a real one here.
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-headline-lg-mobile text-on-surface md:text-headline-lg">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 flex items-center gap-2 text-body-md text-on-surface-variant">
              Placed on {formatDate(order.placedAt)}
              {isLive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-container px-2 py-0.5 text-label-sm font-bold uppercase tracking-wide text-on-success-container">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                  </span>
                  Live
                </span>
              )}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-label-sm font-bold uppercase tracking-wider ${STATUS_PILL[order.status]}`}
          >
            <Icon name={STATUS_ICON[order.status]} size={16} />
            {order.status}
          </span>
        </div>

        {/* Status message */}
        <div
          className={`mb-10 rounded-lg border-l-4 bg-surface-container-low p-4 ${cancelled ? "border-error" : "border-secondary"}`}
        >
          <p className="text-body-md font-medium text-on-surface">
            {STATUS_MESSAGE[order.status]}
          </p>
          {!cancelled && (
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Tracking via Nexus Express · ID {order.orderNumber}-EL
            </p>
          )}
        </div>

        {/* Stepper */}
        {!cancelled && (
          <div className="relative mb-12">
            <div className="absolute left-0 top-5 h-1 w-full -translate-y-1/2 rounded-full bg-surface-container-high" />
            <div
              className="absolute left-0 top-5 h-1 -translate-y-1/2 rounded-full bg-secondary transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            <ol className="relative z-10 flex justify-between">
              {STEPS.map((step, i) => {
                const done = i < activeIndex;
                const active = i === activeIndex;
                return (
                  <li
                    key={step.key}
                    className="flex w-24 flex-col items-center gap-2"
                  >
                    <span
                      className={
                        "flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-colors " +
                        (done
                          ? "bg-secondary text-on-secondary"
                          : active
                            ? "border-2 border-secondary bg-surface-container-lowest text-secondary ring-4 ring-secondary-container/30"
                            : "bg-surface-container-high text-outline")
                      }
                    >
                      <Icon
                        name={done ? "check" : step.icon}
                        size={20}
                        filled={active}
                      />
                    </span>
                    <span
                      className={
                        "text-center text-label-md " +
                        (active
                          ? "font-bold text-secondary"
                          : done
                            ? "text-on-surface"
                            : "text-outline")
                      }
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Items */}
        <div className="mb-8">
          <h2 className="mb-4 text-headline-md font-semibold text-on-surface">
            Order Summary
          </h2>
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-4 rounded-lg border border-line bg-surface-container p-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-surface-variant">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-1 text-label-md font-semibold text-on-surface">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    Qty: {item.quantity} · {item.vendorName}
                  </p>
                </div>
                <span className="text-body-md font-medium tabular-nums text-on-surface">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-body-lg font-semibold text-on-surface">Total</span>
            <span className="text-headline-md font-bold tabular-nums text-primary">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row">
          <Button variant="secondary" className="flex-1">
            <Icon name="chat" size={18} /> Contact Vendor
          </Button>
          <Button variant="secondary" className="flex-1">
            <Icon name="receipt_long" size={18} /> Download Invoice
          </Button>
          <Button asChild variant="ghost" className="flex-1">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
