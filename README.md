<h1 align="center">Nexus Market</h1>

<p align="center">
  A multi-vendor e-commerce marketplace with <strong>real-time inventory and order tracking</strong>,
  three first-class roles (customer · vendor · admin), and a dual-database architecture
  that separates realtime sync from durable source-of-truth.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Firebase" src="https://img.shields.io/badge/Firestore-realtime-FFCA28?logo=firebase&logoColor=black">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-system_of_record-47A248?logo=mongodb&logoColor=white">
  <img alt="Stripe" src="https://img.shields.io/badge/Stripe-payments-635BFF?logo=stripe&logoColor=white">
  <img alt="Tests" src="https://img.shields.io/badge/tests-18_passing-success">
</p>

<p align="center">
  <strong>🔗 Live demo:</strong> <em>coming soon</em> &nbsp;·&nbsp;
  <strong>💻 Source:</strong> <a href="https://github.com/abdullahasghar966/nexus-market">github.com/abdullahasghar966/nexus-market</a>
</p>

---

## The interesting problem

> Real-time inventory sounds trivial — until two customers buy the last unit at the same second, a vendor needs to see it instantly, and an admin needs an auditable record of what actually happened.

Keeping **stock and order status consistent across three roles in real time** was the core engineering challenge. The solution is a deliberate **dual-database design**:

- **Firestore** is the *realtime projection* — clients subscribe with `onSnapshot`, so a stock change or an order-status update reflects on every open screen in under a second, with no polling.
- **MongoDB** is the *system of record* — the durable, queryable source of truth for orders.

They meet at **one** order-placement seam (`finalizeOrder()`), so there is exactly one path that writes an order → decrements stock → notifies subscribers. One seam means one place to reason about correctness.

```
 Customer places order
          │
          ▼
   finalizeOrder()  ──────────────┬───────────────────────┐
          │                       │                        │
          ▼                       ▼                        ▼
  Firestore (realtime)     MongoDB (durable)          Stripe
  onSnapshot ▶ live UI     orders + stock           payment intent
          │
  Vendor flips status ─▶ Firestore ─▶ customer's /track updates live (no refresh)
  Order placed       ─▶ stock/{id} decremented ─▶ every product card updates live
```

**A trade-off I made consciously:** Firestore gives realtime + trivial client reads, but I don't treat it as the source of truth — it's a fast projection, while MongoDB owns durability. Every external dependency (DB, payments, email, auth verification) is **best-effort and isolated**, so one failing service degrades gracefully instead of breaking checkout.

---

## Features

**Customer**
- Storefront with URL-driven filter / sort / search, product detail with an **image-zoom lightbox**
- **Real-time stock** — live in-stock / low / out counts that update as orders come in
- **Animated cart drawer** + full cart page; **Stripe** checkout that auto-falls back to a mock flow when keys aren't present
- **Real-time order tracking** — the status stepper advances live the moment a vendor updates it
- Auth-gated post-purchase **reviews**

**Vendor** (`/vendor/dashboard`)
- Metrics, sales chart, low-stock alerts
- **Product CRUD** — listings appear on the public storefront instantly
- Live orders with a status control that drives the customer's tracking page in realtime

**Admin** (`/admin`)
- Platform overview + a seed/reset control for realtime inventory
- **User & vendor management** (roles, suspend/reinstate)
- **Product & review moderation** (approve / flag / hide / delete)

---

## Engineering highlights

- **Realtime architecture** — Firestore `onSnapshot` subscriptions for stock, orders, reviews, and vendor catalogue; MongoDB for durability.
- **Security in depth** — Firebase Auth + **role-based Edge middleware**, with an **HMAC-signed session cookie** so a forged `role` can't reach a gated route. Firestore security rules are the real data boundary, not just UI checks.
- **Resilience** — build-safe lazy initialization: the app boots and renders with **zero credentials**; every integration no-ops or degrades gracefully when unconfigured.
- **Type safety** — TypeScript in `strict` mode end to end.
- **Tested & green** — 18 unit tests (Vitest + Testing Library), a Playwright e2e harness, and a clean production build across 24 routes.
- **Design system** — Material Design 3 tokens, custom typography scale, Framer Motion with `prefers-reduced-motion` honored.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) · React 18 · TypeScript (strict) |
| Styling | Tailwind CSS + Material Design 3 tokens |
| State | Zustand |
| Realtime | Firebase / Firestore (client) · Firebase Admin (server) |
| System of record | MongoDB + Mongoose |
| Payments | Stripe (Elements + webhooks) |
| Email | Resend |
| Charts / motion | Recharts · Framer Motion |
| Testing | Vitest · Testing Library · Playwright |

---

## Run locally

```bash
git clone https://github.com/abdullahasghar966/nexus-market.git
cd nexus-market
npm install
cp .env.example .env.local   # fill in keys to enable live features
npm run dev                  # http://localhost:3000
```

The app runs with **no credentials** (graceful demo mode on bundled sample data). Add keys from `.env.example` to enable Firebase, MongoDB, Stripe, and email.

```bash
npm run build   # production build
npm test        # unit tests
```

---

## Project structure

```
app/          App Router pages + API routes (auth/session, checkout, orders, webhooks)
components/   ui · product · cart · checkout · order · vendor · admin · home · layout
lib/          firebase(+admin) · mongodb · stripe · reviews · firestore-* · cookie-sign · email
models/       Mongoose: User · Vendor · Product · Review · Order
hooks/        useCart · useAuth · useRealtimeStock
```

Deep-dive on architecture and decisions lives in [`CLAUDE.md`](./CLAUDE.md).
