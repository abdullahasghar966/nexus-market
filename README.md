# Nexus Market

A **production-grade, multi-vendor e-commerce marketplace** built with Next.js 14 (App Router), Firebase, MongoDB, and Stripe. Three roles — **customer, vendor, admin** — with realtime stock, realtime order tracking, reviews + moderation, and full vendor/admin dashboards.

> Built from the provided Stitch "Nexus Market" design kit. Aesthetic: "Modern Corporate" — Material Design 3 tokens, Inter typeface, deep-blue primary / teal secondary / warm-orange accent.

---

## ✨ Features

### Customer
- **Storefront** — home, catalogue with URL-driven filter/sort/search, product detail with **image-zoom lightbox**
- **Realtime stock** — live "in stock / low / out" counts via Firestore `onSnapshot` that update as inventory changes
- **Animated cart drawer** — slides in on add-to-cart; full `/cart` page too
- **Checkout** — live **Stripe Elements** when keys are present, auto-falling back to a mock checkout otherwise
- **Realtime order tracking** — `/track` status stepper updates live (no refresh) when a vendor changes status
- **Reviews** — auth-gated post-purchase submission with star rating

### Vendor (`/vendor/dashboard`)
- Metrics, Recharts sales chart, low-stock alerts
- **Product CRUD** (Firestore) — products appear on the public storefront live
- **Orders** with a status control that updates the customer's tracking page in realtime

### Admin (`/admin`)
- Platform overview (GMV chart, metrics) + **seed/reset realtime stock** tool
- **User & vendor management** (role changes, suspend/reinstate)
- **Product moderation** (approve/remove/delete across vendors)
- **Review moderation** (approve/flag/hide/delete)

### Platform
- Firebase Auth (Google + email/password), role-based **Edge middleware** route guards
- **HMAC-signed session cookie** — a forged `role` cookie can't reach gated UIs
- **Dual database:** Firestore (realtime) + MongoDB (system of record), joined at one `finalizeOrder()` seam
- Resend transactional email, build-safe lazy initialization (the app boots with zero credentials)

---

## 🧱 Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 14.2 (App Router) + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS v3.4 + custom Material Design 3 tokens |
| State | Zustand (cart persisted to localStorage, UI store) |
| Animation | Framer Motion |
| Realtime DB | Firebase / Firestore (client) + Firebase Admin (server) |
| System of record | MongoDB + Mongoose |
| Payments | Stripe (`@stripe/react-stripe-js`, webhooks) |
| Email | Resend |
| Charts | Recharts |
| Tests | Vitest + Testing Library; Playwright (e2e) |

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev                  # http://localhost:3000
```

The app **builds and runs with no credentials** (graceful demo mode on sample data). Add keys to enable live features.

### Scripts
```bash
npm run dev     # dev server (Node --use-system-ca for TLS-intercepting networks)
npm run build   # production build
npm run start   # serve the production build
npm test        # Vitest unit tests
npm run test:e2e # Playwright (run `npx playwright install` first)
```

---

## 🔐 Environment variables

See [`.env.example`](./.env.example). Summary:

| Group | Vars |
|---|---|
| Firebase client | `NEXT_PUBLIC_FIREBASE_*` (×6) |
| Firebase Admin | `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` |
| MongoDB | `MONGODB_URI` |
| Stripe | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Email | `RESEND_API_KEY`, `RESEND_FROM` (optional) |
| App | `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET` |

`.env.local` is git-ignored — never commit real secrets.

### Firebase setup
1. Create a Firebase project; enable **Authentication** (Email/Password + Google).
2. Create a **Firestore** database.
3. Publish the rules in [`firestore.rules`](./firestore.rules) (Console → Firestore → Rules).
4. To grant an admin: register in the app, then set that user's `users/{uid}.role` to `admin` in the Firestore console (or via the Admin → Users tab once one admin exists).

---

## ☁️ Deploy on Vercel

1. Push to GitHub (this repo).
2. [vercel.com/new](https://vercel.com/new) → **Import** this repo → framework auto-detected as Next.js.
3. Add every env var from `.env.local` (for `FIREBASE_ADMIN_PRIVATE_KEY`, paste the value **without** the surrounding quotes, keeping the `\n` escapes).
4. Deploy. Then:
   - Add your `*.vercel.app` domain to **Firebase → Authentication → Authorized domains**.
   - Allow Vercel in **MongoDB Atlas → Network Access** (`0.0.0.0/0` for simplicity).
   - For production Stripe webhooks, add an endpoint in the Stripe dashboard → `https://<app>.vercel.app/api/webhooks/stripe` and use its signing secret.
   - Set `NEXT_PUBLIC_APP_URL` to your deployed URL and redeploy.

---

## 📁 Project structure

```
app/              # App Router routes + API routes (auth/session, checkout, orders, webhooks)
components/       # ui, product, cart, checkout, order, vendor, admin, home, layout
lib/              # firebase(+admin), mongodb, stripe, reviews, firestore-*, cookie-sign, email
models/           # Mongoose: User, Vendor, Product, Review, Order
hooks/            # useCart, useAuth, useRealtimeStock
firestore.rules   # Firestore security rules
```

Architecture, decisions, and gotchas: [`CLAUDE.md`](./CLAUDE.md) · build log: [`progress.md`](./progress.md) · data contracts: [`state.md`](./state.md).
