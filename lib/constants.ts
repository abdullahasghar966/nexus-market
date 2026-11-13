/** Global, non-secret brand + navigation constants for Nexus Market. */
import type { MaterialIcon } from "@/lib/icons";

export const SITE = {
  name: "Nexus Market",
  shortName: "Nexus",
  tagline: "The Global Marketplace for Quality Goods",
  description:
    "Nexus Market connects buyers with verified vendors worldwide. Discover unique products, reliable suppliers, and seamless cross-border transactions built for modern commerce.",
  url:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
} as const;

export const NAV_LINKS = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/#categories" },
  { label: "Vendors", href: "/#vendors" },
  { label: "About", href: "/#about" },
] as const;

export interface CategoryDef {
  slug: string;
  name: string;
  icon: MaterialIcon;
  blurb: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "electronics", name: "Electronics", icon: "devices", blurb: "Gadgets & devices" },
  { slug: "fashion", name: "Fashion", icon: "apparel", blurb: "Apparel & accessories" },
  { slug: "home", name: "Home", icon: "chair", blurb: "Living & décor" },
  { slug: "beauty", name: "Beauty", icon: "spa", blurb: "Skincare & wellness" },
  { slug: "sports", name: "Sports", icon: "sports_basketball", blurb: "Fitness & outdoors" },
  { slug: "books", name: "Books", icon: "menu_book", blurb: "Reading & media" },
];

export const STATS = [
  { value: "50k+", label: "Products" },
  { value: "1.2k", label: "Vendors" },
  { value: "100k+", label: "Orders" },
  { value: "4.9/5", label: "Avg Rating" },
] as const;

export const FOOTER_NAV = [
  {
    title: "Marketplace",
    links: [
      { label: "Shop", href: "/products" },
      { label: "Vendors", href: "/#vendors" },
      { label: "Categories", href: "/#categories" },
      { label: "New arrivals", href: "/products?sort=newest" },
      { label: "Track order", href: "/track" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Become a Vendor", href: "/register?role=vendor" },
      { label: "Careers", href: "/#about" },
      { label: "Contact", href: "/#newsletter" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/#" },
      { label: "Terms of Service", href: "/#" },
      { label: "Vendor Agreement", href: "/#" },
      { label: "Cookie Policy", href: "/#" },
    ],
  },
] as const;

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Twitter", href: "https://twitter.com" },
] as const;

/** Flat shipping + tax assumptions used across the demo (USD). */
export const COMMERCE = {
  currency: "USD",
  freeShippingThreshold: 150,
  flatShipping: 15,
  taxRate: 0.08,
} as const;

export const USER_ROLES = ["customer", "vendor", "admin"] as const;
export const ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;
