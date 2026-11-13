"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  staggerContainer,
  staggerItem,
  tableRow,
} from "@/components/animations/variants";
import {
  ACTIVITY_STATUS_PILL,
  ADMIN_ACTIVITY,
  ADMIN_METRICS,
  PLATFORM_GMV,
  type Metric,
} from "@/lib/data/dashboard";
import { toast } from "sonner";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { UserManagement } from "@/components/admin/UserManagement";
import { ProductModeration } from "@/components/admin/ProductModeration";
import { seedStockFromCatalogue } from "@/lib/firestore-stock";
import type { MaterialIcon } from "@/lib/icons";

type AdminView = "overview" | "users" | "vendors" | "products" | "reviews";

const NAV: { label: string; view: AdminView }[] = [
  { label: "Overview", view: "overview" },
  { label: "Users", view: "users" },
  { label: "Vendors", view: "vendors" },
  { label: "Products", view: "products" },
  { label: "Reviews", view: "reviews" },
];

const VIEW_TITLE: Record<AdminView, string> = {
  overview: "Platform Overview",
  users: "User Management",
  vendors: "Vendor Management",
  products: "Product Moderation",
  reviews: "Review Moderation",
};

/* ───────────────────────── Top bar ───────────────────────── */

function AdminTopBar({
  view,
  onSelect,
}: {
  view: AdminView;
  onSelect: (view: AdminView) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface shadow-sm">
      <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <span className="text-headline-md font-bold text-primary">
            Nexus Market Admin
          </span>
          <div className="hidden items-center gap-2 rounded-full bg-surface-container-low px-3 py-1 sm:flex">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
            </span>
            <span className="text-label-sm text-on-surface-variant">
              Platform Live
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => {
            const active = item.view === view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onSelect(item.view)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 text-body-md transition-colors",
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-primary",
                )}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-primary">
          {(["search", "notifications", "account_circle"] as MaterialIcon[]).map(
            (icon) => (
              <button
                key={icon}
                type="button"
                aria-label={icon.replace("_", " ")}
                className="transition-opacity hover:opacity-80"
              >
                <Icon name={icon} />
              </button>
            ),
          )}
        </div>
      </div>
    </header>
  );
}

/** Mobile-only scrollable tab strip (the top-bar nav is desktop-only). */
function MobileTabs({
  view,
  onSelect,
}: {
  view: AdminView;
  onSelect: (view: AdminView) => void;
}) {
  return (
    <div className="-mx-margin-mobile mb-6 flex gap-2 overflow-x-auto px-margin-mobile pb-2 md:hidden">
      {NAV.map((item) => {
        const active = item.view === view;
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onSelect(item.view)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-label-md transition-colors",
              active
                ? "bg-primary text-on-primary"
                : "bg-surface-container-low text-on-surface-variant",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ──────────────────────── Metric card ─────────────────────── */

function MetricCard({ metric }: { metric: Metric }) {
  const trendColor =
    metric.direction === "up"
      ? "text-secondary"
      : metric.direction === "down"
        ? "text-error"
        : "text-on-surface-variant";
  const trendIcon: MaterialIcon =
    metric.direction === "up"
      ? "arrow_upward"
      : metric.direction === "down"
        ? "arrow_downward"
        : "check_circle";

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-card transition-shadow hover:shadow-floating"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-label-md text-on-surface-variant">
          {metric.label}
        </span>
        <Icon name={metric.icon} className="text-primary" />
      </div>
      <div className="mb-2 text-headline-lg tabular-nums text-on-surface">
        {metric.value}
      </div>
      <div className={cn("flex items-center gap-1", trendColor)}>
        <Icon name={trendIcon} size={16} />
        <span className="text-label-sm">{metric.delta}</span>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── GMV chart ──────────────────────── */

function GmvChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="mb-12 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-headline-md text-on-surface">Platform GMV</h2>
          <p className="text-label-sm text-on-surface-variant">
            Gross merchandise value · last 6 months
          </p>
        </div>
        <span className="hidden items-center gap-1 text-secondary sm:flex">
          <Icon name="trending_up" size={18} filled />
          <span className="text-label-md">Trending up</span>
        </span>
      </div>
      <div className="h-64 w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={PLATFORM_GMV}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a66" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#1e3a66" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#475569" }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fontSize: 12, fill: "#475569" }}
                tickFormatter={(v: number) => `$${v}M`}
                domain={[0, "dataMax + 1"]}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(1)}M`, "GMV"]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                  boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                }}
                labelStyle={{ color: "#475569", fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#12284c"
                strokeWidth={2.5}
                fill="url(#gmvFill)"
                dot={{ r: 3, fill: "#12284c" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-surface-container-low" />
        )}
      </div>
    </section>
  );
}

/* ─────────────────────── Activity table ───────────────────── */

function ActivityTable() {
  return (
    <section className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant p-6">
        <h2 className="text-headline-md text-on-surface">
          Recent Activity &amp; Flagged Items
        </h2>
        <button
          type="button"
          className="rounded border border-outline-variant px-4 py-2 text-label-md text-primary transition-colors hover:bg-surface-container-low"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low text-label-md text-on-surface-variant">
              <th className="px-6 py-3 font-medium">Entity</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status/Risk</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="text-body-md"
          >
            {ADMIN_ACTIVITY.map((row) => {
              const pill = ACTIVITY_STATUS_PILL[row.status];
              return (
                <motion.tr
                  key={row.id}
                  variants={tableRow}
                  className="border-b border-outline-variant transition-colors last:border-0 hover:bg-surface-container-low"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {row.avatar.kind === "initial" ? (
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label-md font-bold",
                            row.avatar.className,
                          )}
                        >
                          {row.avatar.value}
                        </span>
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-variant text-on-surface-variant">
                          <Icon name={row.avatar.value} size={18} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-on-surface">
                          {row.entity}
                        </div>
                        <div className="truncate text-label-sm text-on-surface-variant">
                          {row.subtitle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {row.type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded px-2 py-1 text-label-sm font-bold uppercase tracking-wide",
                        pill.className,
                      )}
                    >
                      {pill.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {row.when}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {row.actions.map((action) => (
                        <button
                          key={action.label}
                          type="button"
                          aria-label={`${action.label} ${row.entity}`}
                          title={action.label}
                          className={cn(
                            "transition-colors",
                            action.tint === "error"
                              ? "text-error hover:opacity-80"
                              : "text-primary hover:text-primary-container",
                          )}
                        >
                          <Icon name={action.icon} size={20} />
                        </button>
                      ))}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </section>
  );
}

/* ───────────────────────── Overview view ──────────────────── */

function Overview() {
  const [seeding, setSeeding] = useState(false);

  async function seedStock() {
    setSeeding(true);
    try {
      const n = await seedStockFromCatalogue();
      toast.success(`Realtime stock seeded for ${n} products`, {
        description: "Open a product page in another tab and place an order to watch it drop live.",
      });
    } catch {
      toast.error("Could not seed stock — admin access + published rules required.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon name="inventory_2" size={20} className="text-primary" />
          <span className="text-label-md">
            Realtime stock — seed or reset the demo catalogue&apos;s live inventory.
          </span>
        </div>
        <button
          type="button"
          onClick={seedStock}
          disabled={seeding}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-label-md font-medium text-on-primary transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          <Icon name="refresh" size={18} />
          {seeding ? "Seeding…" : "Seed / reset stock"}
        </button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-12 grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4"
      >
        {ADMIN_METRICS.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </motion.div>

      <GmvChart />
      <ActivityTable />
    </>
  );
}

/* ──────────────────────────── Shell ───────────────────────── */

export function AdminPanel() {
  const [view, setView] = useState<AdminView>("overview");

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <AdminTopBar view={view} onSelect={setView} />
      <main className="mx-auto w-full max-w-container-max flex-grow px-margin-mobile py-8 md:px-margin-desktop">
        <h1 className="mb-6 text-headline-lg-mobile text-on-surface md:text-headline-lg">
          {VIEW_TITLE[view]}
        </h1>

        <MobileTabs view={view} onSelect={setView} />

        {view === "overview" && <Overview />}
        {view === "users" && <UserManagement mode="users" />}
        {view === "vendors" && <UserManagement mode="vendors" />}
        {view === "products" && <ProductModeration />}
        {view === "reviews" && <ReviewModeration />}

        <p className="mt-8 text-center text-label-sm text-on-surface-variant">
          <Link href="/" className="text-primary hover:underline">
            Back to storefront
          </Link>
        </p>
      </main>
    </div>
  );
}
