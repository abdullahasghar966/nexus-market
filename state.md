# state.md — Nexus Market

Data models, store shapes, env vars, Firestore collections, and API contracts.

---

## ✅ Reported issues (2026-06-03) — all fixed 2026-06-04

Full detail in `progress.md`. Summary: (1) products-page typography corrected to
the scale tokens; (2) catalogue now uses the kit's `lh3` images, Unsplash gone,
`/_next/image` 500 bypassed via `images.unoptimized: true`; (3) button-contrast
bug fixed in `cn()` (`extendTailwindMerge` registers the custom font sizes so
`tailwind-merge` stops dropping text-colors on `size="lg"`); (4) solid sticky
header + `prefers-reduced-motion` (CSS + `MotionConfig`); (5) all routes verified.

---

## Environment variables

Documented in `.env.example` (present at the repo root). Copy to `.env.local`
for live features. The app builds and runs **without** these
(graceful/unconfigured mode).

> **`.env.local` status (2026-06-05):** Firebase (6 client + 2 admin) **SET**,
> `MONGODB_URI` **SET**, `NEXT_PUBLIC_APP_URL` SET. **Stripe ×3 and
> `RESEND_API_KEY` EMPTY** — these are now *optional*: checkout auto-switches to
> the mock path without Stripe keys, and email no-ops without `RESEND_API_KEY`.
> Add them to activate the live paths. **⚠️ Re-publish `firestore.rules`** — new
> collections (orders/reviews/products/vendors) are denied client-side until you
> do. **TLS note:** the `dev` script runs `cross-env NODE_OPTIONS=--use-system-ca
> next dev` so Node trusts the OS cert store — required for any server-side call
> to Google/Stripe/Mongo on this TLS-intercepting machine (see CLAUDE.md gotcha).

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | client | Firebase Web API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | client | Firebase auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | client+admin | Firebase/GCP project id. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | client | Firebase Storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | client | FCM sender id. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | client | Firebase app id. |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | server | Service-account email (Admin SDK). |
| `FIREBASE_ADMIN_PRIVATE_KEY` | server | Service-account private key (escaped `\n`). |
| `MONGODB_URI` | server | MongoDB connection string. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | client | Stripe publishable key (Elements). |
| `STRIPE_SECRET_KEY` | server | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | server | Stripe webhook signing secret. |
| `RESEND_API_KEY` | server | Resend API key (transactional email). |
| `RESEND_FROM` | server | Optional sender identity (default Resend test sender). |
| `SESSION_SECRET` | server | HMAC key for signing the `nexus_session` cookie (dev default if unset). |
| `NEXT_PUBLIC_APP_URL` | client+server | Base URL for metadata/links (default `http://localhost:3000`). |

## TypeScript domain types (`types/index.ts`)

- `UserRole` = `customer | vendor | admin`
- `VendorStatus` = `pending | approved | rejected | suspended`
- `OrderStatus` = `placed | processing | shipped | delivered | cancelled`
- `Rating { average; count }`
- `Address { fullName, line1, line2?, city, state, postalCode, country, phone? }`
- `UserProfile { uid, email, displayName?, photoURL?, role, addresses?, createdAt }`
- `VendorRef { id, name, slug }`
- `Vendor { id, slug, name, tagline?, bio?, logo?, banner?, location?, ownerId, status, rating, productCount?, createdAt }`
- `Product { id, slug, name, description, images[], price, compareAtPrice?, category, tags[], vendor: VendorRef, stockCount, rating, isActive, isFeatured?, createdAt, updatedAt? }`
- `Review { id, productId, orderId, userId, userName, userAvatar?, rating, title?, body, isFlagged?, createdAt }`
- `CartItem { productId, slug, name, price, image, vendorId, vendorName, quantity, maxStock }`
- `OrderItem { productId, name, slug, image, price, quantity, vendorId, vendorName }`
- `Order { id, orderNumber, userId, email, items[], shippingAddress, subtotal, shipping, tax, total, currency, status, paymentIntentId?, createdAt, updatedAt? }`
- `Category { slug, name, blurb?, image? }`; `Testimonial { id, quote, author, role?, rating? }`

## Mongoose models (`models/`)

- **User** — `uid` (unique), `email`, `displayName?`, `photoURL?`, `role`
  (enum, default customer), `addresses[]` (sub-schema), `isSuspended`, timestamps.
- **Vendor** — `slug` (unique), `name`, `tagline?`, `bio?`, `logo?`, `banner?`,
  `location?`, `ownerId`, `status` (enum), `rating{average,count}`,
  `productCount`, timestamps.
- **Product** — `slug` (unique), `name`, `description`, `images[]`, `price`,
  `compareAtPrice?`, `category`, `tags[]`, `vendor` (ObjectId→Vendor),
  `stockCount`, `rating{average,count}`, `isActive`, `isFeatured`, timestamps.
  Text index on name/description/tags.
- **Review** — `product`→Product, `order`→Order, `userId`, `userName`,
  `userAvatar?`, `rating` (1–5), `title?`, `body` (min 20), `isFlagged`,
  timestamps. Unique index `(product,userId,order)`.
- **Order** — `orderNumber` (unique), `userId`, `email`, `items[]` (sub-schema),
  `shippingAddress`, `subtotal/shipping/tax/total`, `currency`, `status` (enum),
  `paymentIntentId?`, timestamps.

## Zustand stores (`lib/zustand/`)

- **cart-store** — `{ items: CartItem[]; addItem(item, qty?); removeItem(id);
  updateQuantity(id, qty); clearCart() }`. Selectors: `selectTotalItems`,
  `selectSubtotal`. Persisted to `localStorage` under key **`atelier-cart`**
  (SSR-safe no-op storage on the server). Quantities clamp to `maxStock`.
- **ui-store** — `{ cartOpen, openCart, closeCart, setCartOpen, mobileNavOpen,
  toggleMobileNav, setMobileNavOpen }` (not persisted). `cartOpen` drives the
  slide-in `CartDrawer` (Header cart button + `AddToCartButton` call `openCart`).

## Firestore collections (realtime)

- `users/{uid}` → `UserProfile` (uid, email, displayName?, photoURL?, role,
  createdAt). Written client-side on sign-in/register (`saveUserProfile`); read
  by `auth-context` (client) and `/api/auth/session` (Admin SDK, for the role
  in the session cookie).
- `stock/{productId}` → `{ stockCount: number }` — read live by
  `useRealtimeStock(productId, initialStock)`. Public-read, admin-write.
- `orders/{orderNumber}` → a `TrackedOrder` — written by `finalizeOrder`
  (signed-in), read live by `subscribeToOrder` (`/track`) and
  `subscribeToRecentOrders` (vendor/admin). Owner-read; vendor/admin read+status-update.
  (`lib/firestore-orders.ts`)
- `reviews/{id}` → published/flagged/hidden customer reviews — `addReview` (auth,
  validated), `subscribeToProductReviews` (public, published-only),
  `subscribeToAllReviews` + `setReviewStatus`/`deleteReview` (admin moderation).
  (`lib/reviews.ts`)
- `products/{id}` → vendor-managed catalogue — `add/update/deleteProduct`,
  `subscribeToVendorProducts` (owner), `subscribeToAllProducts` (admin),
  `subscribeToActiveProducts` + `subscribeToProductBySlug` + `storedProductToProduct`
  (public storefront merge + live detail). Public read; vendor manages own (by
  `ownerId`); admin manages any. (`lib/firestore-products.ts`)
- `vendors/{id}` → vendor records/applications (public read, admin write). Rules
  in place; admin vendor management currently derives from `users` role=='vendor'.
- **Security rules:** `firestore.rules` at repo root — **must be re-published**
  (new collections + role helpers `isAdmin()`/`isVendor()` that read
  `users/{uid}.role`). Admin actions require `users/{uid}.role == 'admin'`,
  granted manually in the console.
- **Planned:** `carts/{uid}` (logged-in cart sync), `notifications/{uid}/items/{id}`.

## API routes / Server Actions (contracts)

**Implemented:**
- `POST /api/auth/session` — body `{ idToken, uid, email, displayName?, role }`.
  **Tries** Admin-SDK `verifyIdToken` + Firestore role read; **falls back** to
  offline decode on TLS/unconfigured failure. Validates role, sets an
  **HMAC-signed** (`lib/cookie-sign.ts`) HttpOnly `nexus_session` cookie (7d) →
  `{ ok, role, verified }`. `DELETE` clears it. Middleware HMAC-verifies the
  cookie before trusting `uid`/`role` (forged cookie → null → treated as guest).
- `POST /api/checkout/payment-intent` — body `{ amount(dollars), currency?,
  email? }` → `getStripe().paymentIntents.create({ amount: round(amount*100),
  payment_method_types:["card"], receipt_email, metadata })` → `{ clientSecret }`.
  Returns **503** (not 500) when `STRIPE_SECRET_KEY` is unset so the client falls
  back to the mock checkout.
- `POST /api/webhooks/stripe` — raw `req.text()` + `stripe-signature` →
  `constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`; on
  `payment_intent.succeeded`/`payment_failed` reconciles the Mongo order status by
  `paymentIntentId`. Soft-acks `{received:true}` when unconfigured.
- `POST /api/orders` — body = a `TrackedOrder` (orderNumber, email, userId?,
  items[], shippingAddress, totals, paymentIntentId?, status?). Best-effort,
  isolated: Mongo `Order` upsert (idempotent on orderNumber) → stock decrement →
  Resend confirmation email. Never 500s on an unconfigured backend → `{ ok,
  persisted, stockUpdated, emailed }`. Called by `finalizeOrder` (both checkout
  paths).

**Later (optional):** `/api/products` listing/detail helpers if the storefront
moves off the SSG sample catalogue.

## Demo data (`lib/data/sample.ts`)

- `PRODUCTS` (8, all featured), `FEATURED_PRODUCTS`, `VENDORS` (4 with
  initials-avatars), `TESTIMONIALS` (3), `SAMPLE_REVIEWS` (3 static reviews
  shown on every product detail page). Product images are the **Stitch kit's
  `lh3.googleusercontent.com` photos** (constant `KIT_IMG` in `sample.ts`);
  catalogue + vendors realigned so each product matches its kit image.

## Dashboard demo data (`lib/data/dashboard.ts`)

Seed data for the credential-free vendor + admin dashboards (numbers mirror the
Stitch kit screens). Vendor: `VENDOR_PROFILE`, `VENDOR_METRICS` (4),
`VENDOR_SALES_WEEK` (Recharts bar series), `INVENTORY_ALERTS` (**derived from
`PRODUCTS` where `stockCount < 10`**, worst-first), `VENDOR_ORDERS` (5). Admin:
`ADMIN_METRICS` (4), `PLATFORM_GMV` (6-month Recharts area series),
`ADMIN_ACTIVITY` (5 flagged/onboarding/user rows). Shared pill maps:
`ORDER_STATUS_PILL`, `ACTIVITY_STATUS_PILL`. `Metric` / `AdminActivity` types
exported for the components.
- `next.config.mjs` sets `images.unoptimized: true` (bypasses the broken Node 24
  optimizer); hosts still allow-listed: `lh3.googleusercontent.com`,
  `images.unsplash.com`, `picsum.photos`, `firebasestorage.googleapis.com`,
  `res.cloudinary.com`.

## Constants (`lib/constants.ts`)

`SITE` (name "Nexus Market", tagline, description, url), `NAV_LINKS`,
`CATEGORIES` (6, with Material icon names), `STATS`, `FOOTER_NAV`,
`SOCIAL_LINKS`, `COMMERCE` (currency USD, freeShippingThreshold 150,
flatShipping 15, taxRate 0.08), `USER_ROLES`, `ORDER_STATUSES`.
