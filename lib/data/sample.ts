/**
 * Demo seed data for the storefront before MongoDB/Firestore are connected.
 * Product imagery is sourced from the provided Stitch design kit
 * (the `lh3.googleusercontent.com` assets embedded in each screen's
 * `code.html`), allow-listed in next.config.mjs. The catalogue is aligned to
 * the kit's products so every card shows a real kit image — no placeholders.
 * Replace with real DB queries as each backend feature is wired up.
 */
import type { Product, Testimonial } from "@/types";

export interface SampleReview {
  id: string;
  name: string;
  initials: string;
  /** Tailwind classes for the avatar tile. */
  avatarClass: string;
  date: string;
  rating: number;
  title: string;
  body: string;
}

/** Product photography lifted from the Stitch kit screens (source of truth). */
const KIT_IMG = {
  headphones:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAcvcjQBPaiw0oqvK2K33dlvHYh24GhrsgcXOoVPqQoFwRhEqqg4SohlxRviHmaeZgk1zgQ0L0YRapDScGuZXTXHM1DDg4PYJzKSYzo2lNgh6gf2F0A4Ze66MvYgedN12pKZLVNNOanVAdXADiCEiDhvHipE3fX9AvqeLpcdpn9aOmYiSBGfu2tutQBxdbh51TEp6XNNvzamaxSzxn1Ic9CY8zIFjwRIr3i--3pwOk1DVobyP64FtoVT9OGK4LDioUnWcCdXzE",
  smartwatch:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDgqhwr7wbE2NAnjTgFuAwGWgomfLPKSZbxY7ZO6EH3tXX5WuM6uKg1i_21u1q0ziog7UfM0oaMYLZwKZ55B3M-ZfDXpEL-WxC4qSrsARPUfdW3FocRaub3GS1uVXFUecHYPj1WBK0ostHAtqYqO2oVobn5Fcn83q7PT1w3FaYIuo5yXE8nFURrIpvagbRC-eUVfn8dXFk4_t_be8hbas_P0WejfYZXmQieDm4RCVo329Wt4Z7jpOD9iFFTThupD8RfWYH2GdY",
  hub:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWUigikaRlHKXW0zbn2oWarjZmegO0HTb6vKzhpJ6osO-z-LGk1Plzu_sPne42est3yb3HA31ezaapUCTgLUQ0x1ufj_DxxcnsmXvs8W3oHB1IlDTTMOV4ZW7YZlRK8Yakxh4_5LTwNHwn1-xKfezm8XEEewBAEQ-oOuhGChQTFQXqGNwdMIVRXYEAVnnuZiWvgmfUjT1bOi9ovp40bCiO5Q2PoRIXD44l7gmj5RGUdLoUDMMLDn7Q165cbsjQH8jzCUjnfjk",
  laptop:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBCY8RfE8nkqZPm1fGQPqxE9xwgkZMJFK-aPyfaFhnlgdS8pe9LKS0aKMBDQY0LmNW5l4bqZLZfN1JoY85bOYWJQi75_oALenlZchedVM14FCr-60sQYE0QF8gZfICKy9TuIPceHmQNdnJvVEh4U2Rmld84tb2jdfWgtdBa3HCxXLJURIVeSaDdg6ocDynyKPpbivnaagE2K-WHKVPEoMbq1PwdmyoVVKDSBJ9NgWY907UBK-55p6M4B5tYK6htpTEfnWpnO0Q",
  keyboard:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuASThw1gG42DIyPhmxAZFpfeZoWRYZPaclQdzMA0WVn0sPtPivWWeDwdPwjq_lJhy483S2PVynjyesiWrw-7ql1YyLQPgNEZvtGGiC9YgdfQNrirD7h8zowVlZhrJPCeCh5A-MNfvfhCyYuBp9zrfhkV01EXOCvjvc4sqWRWWEarHotrOzHyG6PGDKIWZP-fI0gbDYhkiJipNMh2ErB6N8st_BdIhHusgy1JpIDM2h68TWOkd9XA-vF1nKIt3lbqMGKPZHhyWY",
  lamp:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAlTGOjuEV7wekQ8zpehfEQpiF30FRP0vvWCK1jiLm_EcWLUorQ_5Dk3146ijyWQ9gxVryCc07WRfUCCLXMG1kyQ1IlS7mVPKGcW0MogPMxjpxCfCiHKK0KLfVBcoWfxKJwdHaqZA_TyBcsbPT0SpOG7ICG8MT0wldcxrp1aJfUZpce5FSDsyOUOmo9o_p5mDKhZMPpppCSy7_cEaMDxO2UVRmvI-B1vAGGX0FD3B-CqU9gn1smw7cvgKysTR-YnQw9L6GoFdU",
  earbuds:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBoQeXsFk5ujGZqE3DPXRUsx9iLCSjdiYIhsEqOBbNcbOPwSsLDkwjDjaDOaGRhhH816CdaVVMFNCVU05OUIS3NONcqCdavO9QC7laGk6JOc-Y6uh-rF6mav9VY8g3TFLKIQgLcZXAzDk9Wf83yrk8kLZ4WnoF2LIWiOI8Pw-IOqYLHzhFUAnH4fOO_Op1S9le_pHGSXwtSsdJufuZ5dhSbyyPrtKQNXokg_MvH__9YKYgiPOrAP6eIbu-zO_xUgGC-ONSE29o",
  ultrabook:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC_LBRaHRjFD6-0Nfqk1xnNtCyUHvKkPvNbvpQeXNvJywZpZ3TGwVbUEvbgdrfOQRTaAMq-o6L7sqxtR_gGoosDf_4EjsxRIaiF6PHYWUpCaGDQ8K5NoZ8LBfir5N1-o6bQERN8YdNhber8OJb5N0xdGWJZyF6WsCCWYJuWB8-G2mcv0Wt8J6tCIlXNmMwTFzonABz0lAmEFmXoJvmO5o6FUtSJ4QWTAmDOs7ldbZTfEVfoxNJn6GSnIBtdfdrKZv6MjKa2qj0",
} as const;

export interface SampleVendor {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  location: string;
  initials: string;
  /** Tailwind classes for the avatar tile. */
  avatarClass: string;
  rating: { average: number; count: number };
  productCount: number;
  verified: boolean;
}

export const VENDORS: SampleVendor[] = [
  {
    id: "v_ecotech",
    slug: "ecotech-solutions",
    name: "EcoTech Solutions",
    tagline: "Sustainable consumer electronics",
    location: "San Francisco, USA",
    initials: "ET",
    avatarClass: "bg-primary-fixed text-on-primary-fixed-variant",
    rating: { average: 4.7, count: 1240 },
    productCount: 84,
    verified: true,
  },
  {
    id: "v_technova",
    slug: "technova-systems",
    name: "TechNova Systems",
    tagline: "Pro computing & workstations",
    location: "Austin, USA",
    initials: "TN",
    avatarClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    rating: { average: 4.8, count: 640 },
    productCount: 56,
    verified: true,
  },
  {
    id: "v_pulse",
    slug: "pulse-audio",
    name: "Pulse Audio",
    tagline: "Immersive sound, engineered",
    location: "Berlin, Germany",
    initials: "PA",
    avatarClass: "bg-secondary-fixed text-on-secondary-fixed-variant",
    rating: { average: 4.9, count: 980 },
    productCount: 38,
    verified: true,
  },
  {
    id: "v_nordic",
    slug: "nordic-forms",
    name: "Nordic Forms",
    tagline: "Considered lighting for modern homes",
    location: "Copenhagen, Denmark",
    initials: "NF",
    avatarClass: "bg-accent-container text-on-accent-container",
    rating: { average: 4.6, count: 410 },
    productCount: 27,
    verified: true,
  },
];

const vendorRef = (v: SampleVendor) => ({ id: v.id, name: v.name, slug: v.slug });

export const PRODUCTS: Product[] = [
  {
    id: "p_headphones",
    slug: "noise-canceling-wireless-headphones",
    name: "Noise-Canceling Wireless Headphones",
    description:
      "Studio-grade adaptive noise cancellation, 40-hour battery, and plush memory-foam ear cups for all-day comfort.",
    images: [KIT_IMG.headphones],
    price: 89.99,
    compareAtPrice: 120,
    category: "electronics",
    tags: ["audio", "wireless", "headphones"],
    vendor: vendorRef(VENDORS[2]),
    stockCount: 4,
    rating: { average: 4.5, count: 128 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-01T00:00:00.000Z",
  },
  {
    id: "p_smartwatch",
    slug: "minimalist-smartwatch-pro",
    name: "Minimalist Smartwatch Pro Series",
    description:
      "A featherweight titanium smartwatch with AMOLED display, multi-day battery, and precise health tracking.",
    images: [KIT_IMG.smartwatch],
    price: 199.99,
    compareAtPrice: null,
    category: "electronics",
    tags: ["wearable", "smartwatch"],
    vendor: vendorRef(VENDORS[0]),
    stockCount: 24,
    rating: { average: 4.0, count: 86 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-04T00:00:00.000Z",
  },
  {
    id: "p_earbuds",
    slug: "true-wireless-earbuds",
    name: "True Wireless Earbuds",
    description:
      "True wireless earbuds with active noise cancellation, a pocketable charging case, and 30 hours of total playback.",
    images: [KIT_IMG.earbuds],
    price: 129,
    compareAtPrice: 159,
    category: "electronics",
    tags: ["audio", "wireless", "earbuds"],
    vendor: vendorRef(VENDORS[2]),
    stockCount: 9,
    rating: { average: 4.8, count: 212 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-06T00:00:00.000Z",
  },
  {
    id: "p_keyboard",
    slug: "mechanical-keyboard-k1",
    name: "Mechanical Keyboard K1",
    description:
      "Hot-swappable switches, gasket-mounted plate, and a CNC aluminum frame for a premium typing feel.",
    images: [KIT_IMG.keyboard],
    price: 149,
    compareAtPrice: null,
    category: "electronics",
    tags: ["keyboard", "mechanical"],
    vendor: vendorRef(VENDORS[1]),
    stockCount: 0,
    rating: { average: 4.7, count: 340 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-08T00:00:00.000Z",
  },
  {
    id: "p_workstation",
    slug: "quantum-pro-workstation",
    name: "Quantum Pro 15-inch Workstation",
    description:
      "A 15-inch professional workstation with latest-generation architecture, a color-accurate display, and all-day battery for demanding creative work.",
    images: [KIT_IMG.laptop],
    price: 1899,
    compareAtPrice: 2199,
    category: "electronics",
    tags: ["laptop", "workstation", "computing"],
    vendor: vendorRef(VENDORS[1]),
    stockCount: 15,
    rating: { average: 4.8, count: 124 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-10T00:00:00.000Z",
  },
  {
    id: "p_hub",
    slug: "smart-home-automation-hub",
    name: "Smart Home Automation Hub",
    description:
      "A sleek smart-home hub that unifies lighting, climate, and security with voice control and Matter-ready connectivity.",
    images: [KIT_IMG.hub],
    price: 89,
    compareAtPrice: null,
    category: "electronics",
    tags: ["smart-home", "automation"],
    vendor: vendorRef(VENDORS[0]),
    stockCount: 7,
    rating: { average: 4.3, count: 97 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-12T00:00:00.000Z",
  },
  {
    id: "p_lamp",
    slug: "minimalist-desk-lamp",
    name: "Minimalist Desk Lamp",
    description:
      "A minimalist LED desk lamp with a natural-wood base, stepless dimming, and adjustable color temperature for focused work.",
    images: [KIT_IMG.lamp],
    price: 42,
    compareAtPrice: null,
    category: "home",
    tags: ["lighting", "desk", "home-office"],
    vendor: vendorRef(VENDORS[3]),
    stockCount: 60,
    rating: { average: 4.9, count: 158 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-14T00:00:00.000Z",
  },
  {
    id: "p_ultrabook",
    slug: "aluminum-ultrabook-14",
    name: "Aluminum Ultrabook 14-inch",
    description:
      "An ultraportable 14-inch aluminum laptop weighing under 1.2kg, with a bright display and 18-hour battery life.",
    images: [KIT_IMG.ultrabook],
    price: 1099,
    compareAtPrice: 1299,
    category: "electronics",
    tags: ["laptop", "ultrabook", "computing"],
    vendor: vendorRef(VENDORS[1]),
    stockCount: 5,
    rating: { average: 4.7, count: 41 },
    isActive: true,
    isFeatured: true,
    createdAt: "2026-05-16T00:00:00.000Z",
  },
];

export const FEATURED_PRODUCTS = PRODUCTS.filter((p) => p.isFeatured);

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Nexus Market completely changed how we source inventory. The vendor verification means I can buy with total confidence, and shipping has never been smoother.",
    author: "Amara Okafor",
    role: "Boutique Owner",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "I've discovered makers I'd never have found otherwise. Real-time stock and live order tracking make the whole experience feel effortless and trustworthy.",
    author: "Liam Chen",
    role: "Frequent Buyer",
    rating: 5,
  },
  {
    id: "t3",
    quote:
      "Listing my products took minutes and the dashboard analytics are genuinely useful. My sales doubled within the first quarter on the platform.",
    author: "Sofia Rossi",
    role: "Vendor · Pulse Audio",
    rating: 5,
  },
];

/**
 * Static customer reviews shown on product detail pages. Shared across products
 * for the credential-free preview; real per-product reviews land with the
 * Reviews & Ratings milestone (post-delivery, moderated).
 */
export const SAMPLE_REVIEWS: SampleReview[] = [
  {
    id: "r1",
    name: "Jordan Doyle",
    initials: "JD",
    avatarClass: "bg-primary-container text-on-primary-container",
    date: "May 18, 2026",
    rating: 5,
    title: "Exceptional quality",
    body: "Exceeded my expectations on every front. The build quality is phenomenal and it has held up beautifully to daily use. Shipping from the vendor was quick and well-packaged — highly recommend.",
  },
  {
    id: "r2",
    name: "Alice Sundqvist",
    initials: "AS",
    avatarClass: "bg-secondary-container text-on-secondary-container",
    date: "April 29, 2026",
    rating: 4,
    title: "Great value, minor nitpick",
    body: "Performance is undeniable and it looks even better in person. My only small complaint is that the setup instructions were a little sparse, but support from the vendor sorted it out quickly. Solid four stars.",
  },
  {
    id: "r3",
    name: "Marcus Reyes",
    initials: "MR",
    avatarClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
    date: "April 11, 2026",
    rating: 5,
    title: "Exactly as described",
    body: "Precisely what was advertised — no surprises. The verified-vendor badge gave me the confidence to buy and the experience matched the promise end to end. Will order from this store again.",
  },
];
