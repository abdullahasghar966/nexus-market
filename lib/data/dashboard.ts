/**
 * Demo seed data for the vendor + admin dashboards (credential-free UI).
 * Numbers mirror the Stitch kit screens (vendor_dashboard / admin_panel) and,
 * where it keeps the demo internally consistent, derive from the storefront
 * catalogue in `sample.ts` (e.g. inventory alerts reflect real low-stock SKUs).
 * Replace with MongoDB aggregations / Firestore reads as each backend lands.
 */
import type { MaterialIcon } from "@/lib/icons";
import type { OrderStatus } from "@/types";
import { PRODUCTS } from "./sample";

export type TrendDirection = "up" | "down" | "flat";

export interface Metric {
  key: string;
  label: string;
  value: string;
  icon: MaterialIcon;
  /** Icon tint — primary (blue) for most, accent (orange) for ratings. */
  iconTint: "primary" | "accent";
  delta: string;
  direction: TrendDirection;
}

/* ───────────────────────── Vendor dashboard ───────────────────────── */

/** The vendor whose store this dashboard represents (one of our catalogue vendors). */
export const VENDOR_PROFILE = {
  name: "Pulse Audio",
  portal: "Nexus Market Management",
  vendorId: "#8492",
  initials: "PA",
  avatarClass: "bg-secondary-fixed text-on-secondary-fixed-variant",
} as const;

export const VENDOR_METRICS: Metric[] = [
  {
    key: "revenue",
    label: "Total Revenue",
    value: "$24,592.00",
    icon: "payments",
    iconTint: "primary",
    delta: "+12.5% vs last month",
    direction: "up",
  },
  {
    key: "orders",
    label: "Active Orders",
    value: "142",
    icon: "local_shipping",
    iconTint: "primary",
    delta: "-3.2% vs last month",
    direction: "down",
  },
  {
    key: "products",
    label: "Total Products",
    value: "856",
    icon: "inventory_2",
    iconTint: "primary",
    delta: "+24 new this week",
    direction: "up",
  },
  {
    key: "rating",
    label: "Store Rating",
    value: "4.9",
    icon: "star",
    iconTint: "accent",
    delta: "Based on 1,240 reviews",
    direction: "flat",
  },
];

export interface SalesPoint {
  day: string;
  sales: number;
}

/** Weekly sales — proportions match the kit's CSS bar heights. */
export const VENDOR_SALES_WEEK: SalesPoint[] = [
  { day: "Mon", sales: 1840 },
  { day: "Tue", sales: 2760 },
  { day: "Wed", sales: 1610 },
  { day: "Thu", sales: 3680 },
  { day: "Fri", sales: 2530 },
  { day: "Sat", sales: 4140 },
  { day: "Sun", sales: 3220 },
];

export interface InventoryAlert {
  name: string;
  level: "low" | "out";
  stockCount: number;
}

/** Inventory alerts derived from the real catalogue (stockCount < 10), worst first. */
export const INVENTORY_ALERTS: InventoryAlert[] = PRODUCTS.filter(
  (p) => p.stockCount < 10,
)
  .sort((a, b) => a.stockCount - b.stockCount)
  .map((p) => ({
    name: p.name,
    level: p.stockCount === 0 ? "out" : "low",
    stockCount: p.stockCount,
  }));

export interface VendorOrder {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: OrderStatus;
}

export const VENDOR_ORDERS: VendorOrder[] = [
  {
    id: "ORD-9482",
    customer: "Eleanor Richards",
    date: "2026-06-03",
    amount: 1249.0,
    status: "processing",
  },
  {
    id: "ORD-9481",
    customer: "Marcus Thorne",
    date: "2026-06-03",
    amount: 345.5,
    status: "shipped",
  },
  {
    id: "ORD-9480",
    customer: "Sophia Chen",
    date: "2026-06-02",
    amount: 89.99,
    status: "delivered",
  },
  {
    id: "ORD-9479",
    customer: "James Wilson",
    date: "2026-06-02",
    amount: 2100.0,
    status: "placed",
  },
  {
    id: "ORD-9478",
    customer: "Priya Nair",
    date: "2026-06-01",
    amount: 129.0,
    status: "delivered",
  },
];

/* ────────────────────────── Admin panel ───────────────────────────── */

export const ADMIN_METRICS: Metric[] = [
  {
    key: "gmv",
    label: "Total Platform GMV",
    value: "$4.2M",
    icon: "payments",
    iconTint: "primary",
    delta: "12.5% vs last month",
    direction: "up",
  },
  {
    key: "vendors",
    label: "Registered Vendors",
    value: "1,842",
    icon: "store",
    iconTint: "primary",
    delta: "3.2% vs last month",
    direction: "up",
  },
  {
    key: "users",
    label: "Total Users",
    value: "142.5K",
    icon: "group",
    iconTint: "primary",
    delta: "8.1% vs last month",
    direction: "up",
  },
  {
    key: "health",
    label: "Platform Health",
    value: "99.9%",
    icon: "monitor_heart",
    iconTint: "primary",
    delta: "All systems operational",
    direction: "flat",
  },
];

export interface GmvPoint {
  month: string;
  gmv: number;
}

/** Platform GMV over the last 6 months (millions USD), trending to $4.2M. */
export const PLATFORM_GMV: GmvPoint[] = [
  { month: "Jan", gmv: 2.8 },
  { month: "Feb", gmv: 3.1 },
  { month: "Mar", gmv: 3.0 },
  { month: "Apr", gmv: 3.6 },
  { month: "May", gmv: 3.9 },
  { month: "Jun", gmv: 4.2 },
];

export type ActivityStatus = "pending" | "flagged" | "normal" | "approved";

export interface ActivityAction {
  icon: MaterialIcon;
  label: string;
  tint?: "primary" | "error";
}

export interface AdminActivity {
  id: string;
  entity: string;
  subtitle: string;
  /** Avatar is either a colored initial tile or a neutral icon tile. */
  avatar:
    | { kind: "initial"; value: string; className: string }
    | { kind: "icon"; value: MaterialIcon };
  type: string;
  status: ActivityStatus;
  when: string;
  actions: ActivityAction[];
}

export const ADMIN_ACTIVITY: AdminActivity[] = [
  {
    id: "a1",
    entity: "TechHaven Electronics",
    subtitle: "Vendor ID: #V-8842",
    avatar: {
      kind: "initial",
      value: "T",
      className: "bg-primary-container text-on-primary-container",
    },
    type: "Vendor Onboarding",
    status: "pending",
    when: "2 mins ago",
    actions: [
      { icon: "visibility", label: "Review" },
      { icon: "check_circle", label: "Approve" },
    ],
  },
  {
    id: "a2",
    entity: "Bulk Order #9921",
    subtitle: "High Value Transaction",
    avatar: { kind: "icon", value: "inventory_2" },
    type: "Transaction",
    status: "flagged",
    when: "15 mins ago",
    actions: [
      { icon: "manage_search", label: "Inspect" },
      { icon: "block", label: "Block", tint: "error" },
    ],
  },
  {
    id: "a3",
    entity: "Mark J.",
    subtitle: "User ID: #U-1123",
    avatar: {
      kind: "initial",
      value: "M",
      className: "bg-secondary-container text-on-secondary-container",
    },
    type: "User Account",
    status: "normal",
    when: "1 hour ago",
    actions: [{ icon: "edit", label: "Edit" }],
  },
  {
    id: "a4",
    entity: "Nordic Forms",
    subtitle: "Vendor ID: #V-8839",
    avatar: {
      kind: "initial",
      value: "N",
      className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    },
    type: "Vendor Onboarding",
    status: "approved",
    when: "3 hours ago",
    actions: [{ icon: "visibility", label: "View" }],
  },
  {
    id: "a5",
    entity: "Counterfeit listing report",
    subtitle: "Product ID: #P-4471",
    avatar: { kind: "icon", value: "warning" },
    type: "Review Moderation",
    status: "flagged",
    when: "5 hours ago",
    actions: [
      { icon: "manage_search", label: "Inspect" },
      { icon: "block", label: "Remove", tint: "error" },
    ],
  },
];

/* ─────────────────────── Shared pill styling ──────────────────────── */

/** Order-status pill classes (vendor recent orders). */
export const ORDER_STATUS_PILL: Record<OrderStatus, string> = {
  placed: "bg-surface-container-high text-on-surface-variant",
  processing: "bg-primary-fixed text-on-primary-fixed-variant",
  shipped: "bg-secondary-container text-on-secondary-container",
  delivered: "bg-success-container text-on-success-container",
  cancelled: "bg-error-container text-on-error-container",
};

/** Activity-status pill classes (admin recent activity). */
export const ACTIVITY_STATUS_PILL: Record<
  ActivityStatus,
  { className: string; label: string }
> = {
  pending: {
    className: "bg-surface-variant text-on-surface-variant",
    label: "Pending Review",
  },
  flagged: { className: "bg-error-container text-on-error-container", label: "Flagged" },
  normal: {
    className: "bg-secondary-container text-on-secondary-container",
    label: "Normal",
  },
  approved: {
    className: "bg-success-container text-on-success-container",
    label: "Approved",
  },
};
