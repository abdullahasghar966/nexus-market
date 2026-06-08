import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderTracker } from "@/components/order/OrderTracker";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track the status of your Nexus Market order.",
};

export default function TrackPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page py-20">
          <div className="mx-auto h-96 max-w-3xl animate-pulse rounded-xl bg-surface-container" />
        </div>
      }
    >
      <OrderTracker />
    </Suspense>
  );
}
