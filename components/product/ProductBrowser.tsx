"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { subscribeToActiveProducts } from "@/lib/firestore-products";
import { ProductGrid } from "./ProductGrid";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
] as const;

/**
 * Functional catalogue browser: filters by category / vendor / search query and
 * sorts, all driven through the URL (so the Header search, category tiles and
 * vendor links land here pre-filtered and every view is shareable). Runs
 * client-side over the sample data until the product API is wired up.
 */
export function ProductBrowser({
  products: sampleProducts,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Merge live vendor-listed products (Firestore) ahead of the seeded catalogue.
  const [live, setLive] = useState<Product[]>([]);
  useEffect(() => subscribeToActiveProducts(setLive), []);
  const products = useMemo(() => {
    const seen = new Set(sampleProducts.map((p) => p.slug));
    return [...live.filter((p) => !seen.has(p.slug)), ...sampleProducts];
  }, [sampleProducts, live]);

  const q = (params.get("q") ?? "").trim();
  const category = params.get("category") ?? "";
  const vendor = params.get("vendor") ?? "";
  const sort = params.get("sort") ?? "newest";

  // Only offer chips for categories that actually have products.
  const availableCategories = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return CATEGORIES.filter((c) => present.has(c.slug));
  }, [products]);

  const vendorName = useMemo(
    () => products.find((p) => p.vendor.slug === vendor)?.vendor.name ?? vendor,
    [products, vendor],
  );

  const results = useMemo(() => {
    let list = products.slice();
    if (q) {
      const needle = q.toLowerCase();
      list = list.filter((p) =>
        [p.name, p.description, p.vendor.name, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    if (category) list = list.filter((p) => p.category === category);
    if (vendor) list = list.filter((p) => p.vendor.slug === vendor);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating.average - a.rating.average);
        break;
      default:
        list.sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
        );
    }
    return list;
  }, [products, q, category, vendor, sort]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const activeFilters = Boolean(q || vendor || category || sort !== "newest");
  const gridKey = `${q}|${category}|${vendor}|${sort}`;

  return (
    <div className="mt-8">
      {/* Toolbar: category chips + sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          <Chip active={!category} onClick={() => setParam("category", "")}>
            All
          </Chip>
          {availableCategories.map((c) => (
            <Chip
              key={c.slug}
              active={category === c.slug}
              onClick={() => setParam("category", c.slug)}
            >
              {c.name}
            </Chip>
          ))}
        </div>

        <label className="relative inline-flex shrink-0 items-center">
          <span className="sr-only">Sort products</span>
          <Icon
            name="sort"
            size={18}
            className="pointer-events-none absolute left-3 text-on-surface-variant"
          />
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            className="appearance-none rounded-full border border-outline-variant bg-surface-container-lowest py-2 pl-10 pr-9 text-label-md text-on-surface focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <Icon
            name="expand_more"
            size={18}
            className="pointer-events-none absolute right-3 text-on-surface-variant"
          />
        </label>
      </div>

      {/* Active filter pills + result count */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-label-md text-on-surface-variant">
          {results.length} {results.length === 1 ? "product" : "products"}
        </span>

        {q && (
          <FilterPill
            label={`“${q}”`}
            onClear={() => setParam("q", "")}
          />
        )}
        {vendor && (
          <FilterPill
            label={`Vendor: ${vendorName}`}
            onClear={() => setParam("vendor", "")}
          />
        )}

        {activeFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="text-label-md font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-8">
          <ProductGrid key={gridKey} products={results} />
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
            <Icon name="search" size={28} />
          </span>
          <h2 className="text-headline-md text-on-surface">No products found</h2>
          <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
            We couldn&apos;t find anything matching your filters. Try a different
            search or clear the filters.
          </p>
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-label-md font-medium text-on-primary shadow-sm transition-colors hover:bg-primary-container"
          >
            <Icon name="close" size={18} /> Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "whitespace-nowrap rounded-full px-4 py-2 text-label-md transition-colors",
        active
          ? "bg-primary text-on-primary shadow-sm"
          : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low",
      )}
    >
      {children}
    </button>
  );
}

function FilterPill({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed py-1 pl-3 pr-1.5 text-label-md text-on-primary-fixed">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="flex items-center justify-center rounded-full p-0.5 text-on-primary-fixed/80 transition-colors hover:bg-on-primary-fixed/10 hover:text-on-primary-fixed"
      >
        <Icon name="close" size={16} />
      </button>
    </span>
  );
}
