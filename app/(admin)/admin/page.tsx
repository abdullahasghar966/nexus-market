import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin Panel",
  description:
    "Platform overview: GMV, vendors, users, system health, and flagged-item moderation for Nexus Market.",
};

export default function AdminPage() {
  return <AdminPanel />;
}
