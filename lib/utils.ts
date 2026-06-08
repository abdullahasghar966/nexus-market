import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge configured with the project's custom typography scale.
 * Without this, tailwind-merge treats `text-body-md`/`text-label-md`/etc. as
 * text *colors* (its `isAny` fallback) and lets a size class clobber a color
 * class — e.g. `size="lg"` (which adds `text-body-md`) was silently dropping
 * `text-on-primary`, rendering button labels in the inherited near-black
 * `on-surface` (the "Start Shopping" contrast bug). Registering the tokens in
 * the `font-size` group keeps size and color as separate, non-conflicting groups.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-lg",
            "headline-lg",
            "headline-lg-mobile",
            "headline-md",
            "body-lg",
            "body-md",
            "label-md",
            "label-sm",
          ],
        },
      ],
    },
  },
});

/** Merge Tailwind class names with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a localized currency string. */
export function formatPrice(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact number, e.g. 1.2k. */
export function formatCompact(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, { notation: "compact" }).format(value);
}

/** Format an ISO date / Date as a readable string. */
export function formatDate(
  date: string | number | Date,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
): string {
  return new Intl.DateTimeFormat("en-US", opts).format(new Date(date));
}

/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/** Percentage discount between a compareAt price and the current price. */
export function discountPercent(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}

/** Average of a numeric array (0 when empty). */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** Pluralize a noun based on count. */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
