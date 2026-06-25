# House of Chops — Online Ordering & Kitchen Dashboard

**Date:** 2026-06-25
**Status:** Design approved, pending spec review

## Goal

Add a full online ordering system to the existing House of Chops Next.js site. Customers
pick boxes, check out, and pay with Apple Pay / card via Ziina. Paid orders appear live on
a password-protected kitchen dashboard.

## Existing project (confirmed)

- **Next.js 14.2.5**, App Router, JavaScript (no TypeScript), framer-motion.
- Single marketing page (`app/page.js`) composed of section components.
- Ordering today is a **WhatsApp deep link** (`SITE.orderUrl` in `lib/data.js`), used by
  the Menu section's "Order" buttons and the "Order Now" CTA.
- Design tokens already defined in `app/globals.css` — we **match the live site**, not the
  brief's slightly different values:
  - Background `#000000`, accent "Flame Gold" `#C8873A`, white text.
  - Fonts: Bebas Neue (display), Bodoni Moda (serif headings), Jost (body).

## Products & pricing (server-authoritative)

| Box         | Contents          | Price   |
|-------------|-------------------|---------|
| Classic Box | 4 lamb chops      | 79 AED  |
| Large Box   | 6 lamb chops      | 99 AED  |

- Flat delivery fee: **15 AED** per order.
- Any quantity of either box.
- Prices live **only** on the server. The browser's totals are never trusted.

## Architecture

The browser never talks to Ziina or Supabase directly. All payment and database logic runs
in server-side Next.js API routes. Secrets live in server-only env vars.

```
Customer → /order                         pick boxes, cart, name/phone/address
         → POST /api/checkout             recalculates total server-side, creates Ziina
                                           intent (test mode), saves order "pending_payment",
                                           returns Ziina redirect_url
         → Ziina hosted page              Apple Pay / Google Pay / card
         → /order/success?pi={id}         calls POST /api/confirm
              POST /api/confirm           GET Ziina payment_intent/{id}; if completed,
                                           flip order → "new"; show order number
         → /order (cancel/failure)        nothing marked paid

Kitchen  → /kitchen                       password gate (cookie)
         → GET /api/kitchen/orders        polled every 5s; returns new/cooking/ready
         → POST /api/kitchen/update       advance status
```

### Routes & files (planned)

- `app/order/page.js` — storefront + cart (client component).
- `app/order/success/page.js` — thank-you / confirm.
- `app/kitchen/page.js` — dashboard (client component, polling).
- `app/kitchen/login/page.js` — password entry (or inline gate).
- `app/api/checkout/route.js` — create Ziina intent + pending order.
- `app/api/confirm/route.js` — verify payment, flip to "new".
- `app/api/kitchen/orders/route.js` — read orders for the board.
- `app/api/kitchen/update/route.js` — advance an order's status.
- `app/api/kitchen/login/route.js` — set the kitchen auth cookie.
- `lib/products.js` — server price list + total calculation (single source of truth).
- `lib/supabase.js` — server Supabase client (service-role key).
- `lib/ziina.js` — Ziina API wrapper (create intent, get intent).

## Database (Supabase)

One table, `orders`. All access via the server using the service-role key.
Row-level security: enabled, deny-all (no anon/public access).

| Column            | Type        | Notes                                              |
|-------------------|-------------|----------------------------------------------------|
| id                | uuid        | PK, default gen_random_uuid()                      |
| order_number      | text        | Human-readable, e.g. `HOC-1042`, server-generated  |
| created_at        | timestamptz | default now()                                      |
| customer_name     | text        | required                                           |
| customer_phone    | text        | required                                           |
| customer_address  | text        | required                                           |
| items             | jsonb       | `[{box, qty, unit_price}]`                          |
| subtotal          | numeric     | AED                                                |
| delivery_fee      | numeric     | AED (15)                                            |
| total             | numeric     | AED                                                |
| status            | text        | pending_payment / new / cooking / ready / delivered|
| ziina_payment_id  | text        | Ziina payment intent id                            |

Order number: a Postgres sequence (e.g. start 1000) formatted as `HOC-{n}`, assigned on insert.

## Customer flow detail

1. `/order` shows both boxes with quantity steppers.
2. Add to cart → cart drawer shows line items, subtotal, 15 AED delivery, total.
3. Cart persists in `localStorage` (survives refresh).
4. Name, phone, address all required; "Pay" disabled until all filled.
5. "Pay" → `POST /api/checkout` → redirect to Ziina `redirect_url`.
6. Pay on Ziina → back to `/order/success?pi={id}`.
7. Success page calls `POST /api/confirm`; shows order number once confirmed `new`.
8. Cancel/failure → back to `/order`, no paid order created.

## Payment (Ziina)

- Base URL `https://api-v2.ziina.com`, auth header `Authorization: Bearer ${ZIINA_API_KEY}`.
- Create: `POST /api/payment_intent` with body `{ amount (fils), currency_code: "AED",
  message: "House of Chops order", success_url, cancel_url, failure_url, test: true }`.
  - `amount` = AED total × 100 (fils). Minimum 2 AED.
- Confirm: `GET /api/payment_intent/{id}`; only flip order to `new` when status is `completed`.
- Redirect URLs derived from request origin (works on localhost and production), with
  `NEXT_PUBLIC_SITE_URL` as fallback.
- `test: true` throughout build; flip to `false` for launch.

## Kitchen dashboard (`/kitchen`)

- **Auth:** single shared password in `KITCHEN_PASSWORD` env var. Login page posts to
  `/api/kitchen/login`, which sets an httpOnly signed cookie; middleware (or per-route check)
  guards `/kitchen` and the kitchen API routes. Not linked anywhere public.
- **Board:** three columns — New / Cooking / Ready. Card shows order #, time-since-arrival,
  boxes + quantities, customer name, phone, address, total.
- **Actions:** New → Start cooking → Mark ready → Delivered (delivered drops off the board).
- **Live:** polls `GET /api/kitchen/orders` every 5s. New orders highlight/flash on arrival.
- **Counts:** header shows new / cooking / ready / total-today.

## Security must-haves

- Ziina key and Supabase service-role key only in server env vars; never in browser, never
  committed (already in gitignored `.env.local`).
- Order total always recomputed server-side from `lib/products.js`.
- Order marked paid only after Ziina confirms `completed` (not on reaching success page).
- `/kitchen` and kitchen API routes behind the shared-password cookie.

## Environment variables

| Var                          | Where    | Purpose                                  |
|------------------------------|----------|------------------------------------------|
| ZIINA_API_KEY                | server   | Ziina bearer token (test key now)        |
| SUPABASE_URL                 | server   | Supabase project URL                     |
| SUPABASE_SERVICE_ROLE_KEY    | server   | Full DB access, server only              |
| KITCHEN_PASSWORD             | server   | Kitchen dashboard shared password        |
| NEXT_PUBLIC_SITE_URL         | both     | Fallback base URL for redirects          |

All set in `.env.local` for dev; must be mirrored into Vercel for production.

## Assets needed from owner

- Logo file → `public/images/` (header slot wired by us).
- (Optional) reference ordering HTML to match a specific cart layout.

## Out of scope (YAGNI for v1)

- Multiple products beyond the two boxes; promo codes; delivery zones/scheduling.
- Per-staff kitchen accounts (single shared password only).
- Order history / analytics UI (data is in Supabase).
- SMS/email notifications.

## Build order

1. Supabase `orders` table + sequence (SQL provided to owner).
2. `lib/products.js`, `lib/supabase.js`, `lib/ziina.js`.
3. Storefront + cart (`/order`), repoint homepage CTAs.
4. `/api/checkout` (create intent + pending order).
5. `/order/success` + `/api/confirm` (verify, flip to new).
6. `/kitchen` + auth + kitchen API routes (live board).
7. End-to-end test in Ziina test mode.
8. Flip `test` off, add production key, mirror env vars to Vercel.
