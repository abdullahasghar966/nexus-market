"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import {
  staggerContainer,
  staggerItem,
  tableRow,
} from "@/components/animations/variants";
import {
  INVENTORY_ALERTS,
  ORDER_STATUS_PILL,
  VENDOR_METRICS,
  VENDOR_ORDERS,
  VENDOR_PROFILE,
  VENDOR_SALES_WEEK,
  type Metric,
} from "@/lib/data/dashboard";
import { ProductManager } from "@/components/vendor/ProductManager";
import { VendorOrdersPanel } from "@/components/vendor/VendorOrdersPanel";
import type { MaterialIcon } from "@/lib/icons";

type VendorView = "dashboard" | "products" | "orders" | "analytics";

const NAV: { label: string; icon: MaterialIcon; view: VendorView }[] = [
  { label: "Dashboard", icon: "dashboard", view: "dashboard" },
  { label: "Products", icon: "inventory_2", view: "products" },
  { label: "Orders", icon: "shopping_bag", view: "orders" },
  { label: "Analytics", icon: "analytics", view: "analytics" },
];

/* ─────────────────────────── Sidebar ─────────────────────────── */

function SidebarContent({
  view,
  onSelect,
}: {
  view: VendorView;
  onSelect: (view: VendorView) => void;
}) {
  return (
    <div className="flex h-full flex-col py-2">
      <div className="mb-8 mt-4 flex items-center gap-3 px-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary-fixed text-label-md font-bold",
            VENDOR_PROFILE.avatarClass,
          )}
        >
          {VENDOR_PROFILE.initials}
        </span>
        <div>
          <h2 className="text-headline-md text-primary-fixed">Vendor Portal</h2>
          <p className="text-label-sm text-surface-variant">
            {VENDOR_PROFILE.portal}
          </p>
        </div>
      </div>

      <ul className="flex-grow space-y-1 px-2">
        {NAV.map((item) => {
          const active = item.view === view;
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => onSelect(item.view)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-label-md transition-colors",
                  active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-surface-variant hover:bg-primary-fixed-variant/20",
                )}
              >
                <Icon name={item.icon} size={20} filled={active} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mb-6 mt-auto px-4">
        <Button
          variant="accent"
          className="w-full"
          onClick={() => onSelect("products")}
        >
          <Icon name="add" size={20} filled /> Add New Product
        </Button>
      </div>

      <div className="border-t border-outline/20 px-2 pt-4">
        <button
          type="button"
          onClick={() => onSelect("dashboard")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-label-md text-surface-variant transition-colors hover:bg-primary-fixed-variant/20"
        >
          <Icon name="settings" size={20} /> Settings
        </button>
        <Link
          href="/"
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-label-md text-surface-variant transition-colors hover:bg-primary-fixed-variant/20"
        >
          <Icon name="logout" size={20} /> Logout
        </Link>
      </div>
    </div>
  );
}

/* ──────────────────────── Metric card ────────────────────────── */

function MetricCard({ metric }: { metric: Metric }) {
  const trendColor =
    metric.direction === "up"
      ? "text-secondary"
      : metric.direction === "down"
        ? "text-error"
        : "text-on-surface-variant";
  const trendIcon: MaterialIcon | null =
    metric.direction === "up"
      ? "trending_up"
      : metric.direction === "down"
        ? "trending_down"
        : null;

  return (
    <motion.div
      variants={staggerItem}
      className="flex flex-col justify-between rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-floating"
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
          {metric.label}
        </p>
        <div
          className={cn(
            "rounded-lg bg-surface-container-low p-2",
            metric.iconTint === "accent" ? "text-accent" : "text-primary",
          )}
        >
          <Icon name={metric.icon} size={22} filled={metric.iconTint === "accent"} />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-headline-lg tabular-nums text-on-surface md:text-display-lg">
          {metric.value}
        </h3>
        <div className={cn("flex items-center gap-1", trendColor)}>
          {trendIcon && <Icon name={trendIcon} size={18} filled />}
          <span className="text-label-md">{metric.delta}</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── Sales chart ───────────────────────── */

function SalesChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-headline-md text-on-surface">Sales Overview</h3>
        <select
          aria-label="Sales period"
          className="rounded-lg border-none bg-surface-container-low py-1.5 pl-3 pr-8 text-label-md text-on-surface focus:ring-2 focus:ring-primary"
          defaultValue="This Week"
        >
          <option>This Week</option>
          <option>This Month</option>
          <option>This Year</option>
        </select>
      </div>
      <div className="min-h-0 flex-1">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={VENDOR_SALES_WEEK}
              margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#475569" }}
                dy={6}
              />
              <YAxis hide domain={[0, "dataMax + 600"]} />
              <Tooltip
                cursor={{ fill: "rgba(18,40,76,0.05)" }}
                formatter={(value: number) => [formatPrice(value), "Sales"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#475569", fontWeight: 600 }}
              />
              <Bar
                dataKey="sales"
                fill="#1e3a66"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
                activeBar={{ fill: "#12284c" }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-surface-container-low" />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Inventory alerts ─────────────────────── */

function InventoryAlerts() {
  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-line bg-surface-container-lowest p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-headline-md text-on-surface">Inventory Alerts</h3>
        <button
          type="button"
          className="text-label-md text-primary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="-mr-2 flex-1 space-y-4 overflow-y-auto pr-2">
        {INVENTORY_ALERTS.map((alert) => {
          const out = alert.level === "out";
          return (
            <div
              key={alert.name}
              className={cn(
                "flex items-center gap-4 rounded-lg border p-3 transition-colors",
                out
                  ? "border-error/30 bg-error-container/20 hover:bg-error-container/40"
                  : "border-outline-variant/50 hover:bg-surface-container-low",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded",
                  out ? "bg-error-container" : "bg-surface-container",
                )}
              >
                <Icon
                  name={out ? "error" : "warning"}
                  className={out ? "text-error" : "text-accent"}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-label-md text-on-surface">
                  {alert.name}
                </p>
                <p
                  className={cn(
                    "flex items-center gap-1 text-label-sm",
                    out ? "text-error" : "text-on-surface-variant",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      out ? "bg-error" : "bg-accent",
                    )}
                  />
                  {out ? "Out of Stock" : `Low Stock — ${alert.stockCount} left`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── Recent orders ──────────────────────── */

function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface-container-lowest shadow-card">
      <div className="flex items-center justify-between border-b border-outline-variant/50 bg-surface-bright p-6">
        <h3 className="text-headline-md text-on-surface">Recent Orders</h3>
        <Button variant="secondary" size="sm">
          View All Orders
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/50 bg-surface-container-low text-label-sm uppercase tracking-wider text-on-surface-variant">
              <th className="p-4 font-semibold">Order ID</th>
              <th className="p-4 font-semibold">Customer</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="divide-y divide-line text-body-md"
          >
            {VENDOR_ORDERS.map((order, i) => (
              <motion.tr
                key={order.id}
                variants={tableRow}
                className={cn(
                  "transition-colors hover:bg-surface-container-low",
                  i % 2 === 1 && "bg-surface-container-low/50",
                )}
              >
                <td className="p-4 font-medium text-on-surface">#{order.id}</td>
                <td className="p-4 text-on-surface">{order.customer}</td>
                <td className="p-4 text-on-surface-variant">
                  {formatDate(order.date)}
                </td>
                <td className="p-4 font-medium tabular-nums text-on-surface">
                  {formatPrice(order.amount)}
                </td>
                <td className="p-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-bold uppercase tracking-wide",
                      ORDER_STATUS_PILL[order.status],
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    aria-label={`Actions for order ${order.id}`}
                    className="rounded p-2 text-primary transition-colors hover:bg-surface-container"
                  >
                    <Icon name="more_vert" size={20} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────── Shell ──────────────────────────── */

export function VendorDashboard() {
  const [navOpen, setNavOpen] = useState(false);
  const [view, setView] = useState<VendorView>("dashboard");
  const close = () => setNavOpen(false);
  const select = (v: VendorView) => {
    setView(v);
    close();
  };

  return (
    <div className="flex min-h-screen bg-surface-container-low text-on-surface">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-inverse-surface shadow-floating md:flex">
        <SidebarContent view={view} onSelect={select} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-inverse-surface shadow-floating md:hidden"
            >
              <div className="flex justify-end px-4 pt-4">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className="text-surface-variant hover:text-primary-fixed"
                >
                  <Icon name="close" />
                </button>
              </div>
              <SidebarContent view={view} onSelect={select} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-surface px-margin-mobile shadow-sm md:px-margin-desktop">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              className="text-on-surface md:hidden"
            >
              <Icon name="menu" />
            </button>
            <div className="relative hidden sm:block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                <Icon name="search" size={20} />
              </span>
              <input
                type="text"
                placeholder="Search orders, products..."
                className="w-64 rounded-full border-none bg-surface-container-low py-2 pl-10 pr-4 text-body-md transition-all focus:w-80 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Notifications"
              className="relative text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon name="notifications" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-surface bg-error" />
            </button>
            <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
              <div className="hidden text-right sm:block">
                <p className="text-label-md text-on-surface">
                  {VENDOR_PROFILE.name}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  Vendor ID: {VENDOR_PROFILE.vendorId}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-label-sm font-bold",
                  VENDOR_PROFILE.avatarClass,
                )}
              >
                {VENDOR_PROFILE.initials}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-container-max flex-1 p-margin-mobile md:p-margin-desktop">
          {view === "dashboard" && <DashboardOverview />}
          {view === "products" && <ProductManager />}
          {view === "orders" && <VendorOrdersPanel />}
          {view === "analytics" && <AnalyticsView />}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────── Views: overview / analytics ──────────────────── */

function DashboardOverview() {
  return (
    <>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-1 text-headline-lg-mobile text-on-background md:text-headline-lg">
            Dashboard Overview
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Welcome back, here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-label-md text-on-surface-variant">
            Last updated: Just now
          </span>
          <button
            type="button"
            aria-label="Refresh"
            className="rounded-full p-1 text-primary transition-colors hover:bg-surface-container"
          >
            <Icon name="refresh" size={18} />
          </button>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-gutter grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4"
      >
        {VENDOR_METRICS.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </motion.div>

      <div className="mb-gutter grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SalesChart />
        </div>
        <div className="lg:col-span-4">
          <InventoryAlerts />
        </div>
      </div>

      <RecentOrders />
    </>
  );
}

function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-headline-lg-mobile text-on-background md:text-headline-lg">
          Analytics
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Sales performance and inventory health at a glance.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SalesChart />
        </div>
        <div className="lg:col-span-4">
          <InventoryAlerts />
        </div>
      </div>
    </div>
  );
}
