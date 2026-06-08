import type { Metadata } from "next";
import { VendorDashboard } from "@/components/vendor/VendorDashboard";

export const metadata: Metadata = {
  title: "Vendor Dashboard",
  description:
    "Revenue, active orders, inventory alerts, and sales analytics for your Nexus Market store.",
};

export default function VendorDashboardPage() {
  return <VendorDashboard />;
}
