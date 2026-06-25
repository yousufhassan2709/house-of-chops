# House of Chops Online Ordering — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Ziina-paid online ordering flow and a password-protected live kitchen dashboard to the existing House of Chops Next.js site.

**Architecture:** The browser never talks to Ziina or Supabase directly. A `/order` storefront posts the cart to Next.js API routes; the server recalculates the total from its own price list, creates a Ziina payment intent (test mode), and saves a `pending_payment` order to Supabase. On return, the server confirms the real Ziina status before flipping the order to `new`. A `/kitchen` page behind a shared-password cookie polls the order list every 5s.

**Tech Stack:** Next.js 14 (App Router, JS), `@supabase/supabase-js`, Ziina Payment Intent API, Supabase Postgres, `vitest` for unit tests.

**Spec:** `docs/superpowers/specs/2026-06-25-online-ordering-design.md`

---

## File structure

| File | Responsibility |
|------|----------------|
| `lib/products.js` | Server-authoritative price list + `calculateOrder()` total logic |
| `lib/products.test.js` | Unit tests for `calculateOrder()` |
| `lib/supabase.js` | Lazy server Supabase client (service-role key) |
| `lib/ziina.js` | Ziina API wrapper: create + get payment intent |
| `lib/kitchenAuth.js` | Kitchen cookie token + auth check |
| `app/api/checkout/route.js` | Validate, recompute total, create Ziina intent, save pending order, set `hoc_pi` cookie |
| `app/api/confirm/route.js` | Read `hoc_pi` cookie, confirm Ziina status, flip order to `new` |
| `app/api/kitchen/login/route.js` | Validate password, set kitchen cookie |
| `app/api/kitchen/orders/route.js` | Return active orders + today's counts (auth required) |
| `app/api/kitchen/update/route.js` | Advance an order's status (auth required) |
| `app/order/page.js` | Storefront + cart (client) |
| `app/order/success/page.js` | Thank-you page; calls `/api/confirm` (client) |
| `app/kitchen/page.js` | Server gate → renders board |
| `app/kitchen/login/page.js` | Password form (client) |
| `components/KitchenBoard.js` | Live board: columns, polling, status buttons (client) |
| `components/Menu.js`, `Hero.js`, `Navbar.js`, `Contact.js` | Repoint order CTAs to `/order` |

---

## Task 1: Dependencies and env var

**Files:**
- Modify: `package.json`
- Modify: `.env.local` (gitignored — already holds the secrets)

- [ ] **Step 1: Install runtime + test deps**

Run:
```bash
cd ~/Desktop/house-of-chops
npm install @supabase/supabase-js
npm install -D vitest
```
Expected: both added to `package.json`, no errors.

- [ ] **Step 2: Add a test script**

In `package.json` `"scripts"`, add:
```json
"test": "vitest run"
```

- [ ] **Step 3: Add the Ziina test-mode flag to `.env.local`**

Append this line to `.env.local`:
```
ZIINA_TEST_MODE=true
```
(We flip to `false` at launch in Task 14.)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add supabase client and vitest"
```
(`.env.local` is gitignored — it will not appear in the commit.)

---

## Task 2: Supabase `orders` table

**Files:**
- Create: `supabase/orders.sql` (kept in repo for reference; you run it in Supabase)

- [ ] **Step 1: Write the migration file**

Create `supabase/orders.sql`:
```sql
-- House of Chops orders table. Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create sequence if not exists hoc_order_seq start 1;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null
                      default 'HOC-' || lpad(nextval('hoc_order_seq')::text, 2, '0'),
  created_at        timestamptz not null default now(),
  customer_name     text not null,
  customer_phone    text not null,
  customer_address  text not null,
  items             jsonb not null,
  subtotal          numeric not null,
  delivery_fee      numeric not null,
  total             numeric not null,
  status            text not null default 'pending_payment',
  ziina_payment_id  text
);

-- Lock the table down. The server uses the service-role key, which bypasses RLS.
-- With RLS on and no policies, anon/public keys can read or write nothing.
alter table public.orders enable row level security;
```

- [ ] **Step 2: Run it in Supabase**

Owner action: open the Supabase project → SQL Editor → paste the contents of `supabase/orders.sql` → Run. Confirm the `orders` table appears in the Table Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/orders.sql
git commit -m "feat: orders table migration"
```

---

## Task 3: Server price list and total logic (TDD)

**Files:**
- Create: `lib/products.js`
- Test: `lib/products.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/products.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { calculateOrder, DELIVERY_FEE } from './products.js';

describe('calculateOrder', () => {
  it('totals one classic box plus delivery', () => {
    const r = calculateOrder([{ id: 'classic', qty: 1 }]);
    expect(r.subtotal).toBe(79);
    expect(r.delivery_fee).toBe(15);
    expect(r.total).toBe(94);
    expect(r.amountFils).toBe(9400);
  });

  it('totals a mixed cart and converts to fils', () => {
    // 2x classic (158) + 1x large (99) = 257 + 15 = 272
    const r = calculateOrder([{ id: 'classic', qty: 2 }, { id: 'large', qty: 1 }]);
    expect(r.subtotal).toBe(257);
    expect(r.total).toBe(272);
    expect(r.amountFils).toBe(27200);
    expect(r.lineItems).toHaveLength(2);
    expect(r.lineItems[0]).toMatchObject({ id: 'classic', qty: 2, unit_price: 79, line_total: 158 });
  });

  it('ignores any price sent by the caller (server is authoritative)', () => {
    const r = calculateOrder([{ id: 'classic', qty: 1, unit_price: 1, price: 1 }]);
    expect(r.total).toBe(94);
  });

  it('rejects an empty cart', () => {
    expect(() => calculateOrder([])).toThrow();
  });

  it('rejects an unknown product', () => {
    expect(() => calculateOrder([{ id: 'wagyu', qty: 1 }])).toThrow();
  });

  it('rejects a non-positive or non-integer quantity', () => {
    expect(() => calculateOrder([{ id: 'classic', qty: 0 }])).toThrow();
    expect(() => calculateOrder([{ id: 'classic', qty: 1.5 }])).toThrow();
    expect(() => calculateOrder([{ id: 'classic', qty: 1000 }])).toThrow();
  });

  it('exposes the delivery fee constant', () => {
    expect(DELIVERY_FEE).toBe(15);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./products.js"` / module not found.

- [ ] **Step 3: Write the minimal implementation**

Create `lib/products.js`:
```js
// Server-authoritative product catalog and totals.
// Safe to import on the client (display only) — contains no secrets.
// NEVER trust a price or total coming from the browser; always recompute here.

export const PRODUCTS = {
  classic: { id: 'classic', name: 'Classic Box', subtitle: '4 Premium Lamb Chops', price: 79 },
  large:   { id: 'large',   name: 'Large Box',   subtitle: '6 Premium Lamb Chops', price: 99 },
};

export const DELIVERY_FEE = 15;
const MAX_QTY = 99;

// items: [{ id: 'classic', qty: 2 }, ...] — any extra fields are ignored.
export function calculateOrder(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty.');
  }
  const lineItems = [];
  let subtotal = 0;
  for (const item of items) {
    const product = PRODUCTS[item?.id];
    if (!product) throw new Error(`Unknown product: ${item?.id}`);
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new Error(`Invalid quantity for ${product.id}.`);
    }
    const line_total = product.price * qty;
    subtotal += line_total;
    lineItems.push({ id: product.id, name: product.name, qty, unit_price: product.price, line_total });
  }
  const delivery_fee = DELIVERY_FEE;
  const total = subtotal + delivery_fee;
  return { lineItems, subtotal, delivery_fee, total, amountFils: total * 100 };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/products.js lib/products.test.js
git commit -m "feat: server-authoritative order totals with tests"
```

---

## Task 4: Supabase and Ziina server clients

**Files:**
- Create: `lib/supabase.js`
- Create: `lib/ziina.js`

- [ ] **Step 1: Write the Supabase client**

Create `lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js';

// Server-only client using the service-role key. Never import into client components.
let client;
export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are missing.');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
```

- [ ] **Step 2: Write the Ziina wrapper**

Create `lib/ziina.js`:
```js
const ZIINA_BASE = 'https://api-v2.ziina.com';

function authHeaders() {
  const key = process.env.ZIINA_API_KEY;
  if (!key) throw new Error('ZIINA_API_KEY is missing.');
  return { Authorization: `Bearer ${key}` };
}

export async function createPaymentIntent({ amountFils, successUrl, cancelUrl, failureUrl }) {
  const res = await fetch(`${ZIINA_BASE}/api/payment_intent`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountFils,
      currency_code: 'AED',
      message: 'House of Chops order',
      success_url: successUrl,
      cancel_url: cancelUrl,
      failure_url: failureUrl,
      test: process.env.ZIINA_TEST_MODE !== 'false',
    }),
  });
  if (!res.ok) {
    throw new Error(`Ziina create intent failed: ${res.status} ${await res.text()}`);
  }
  return res.json(); // { id, redirect_url, status, ... }
}

export async function getPaymentIntent(id) {
  const res = await fetch(`${ZIINA_BASE}/api/payment_intent/${id}`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(`Ziina get intent failed: ${res.status} ${await res.text()}`);
  }
  return res.json(); // { id, status, ... }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.js lib/ziina.js
git commit -m "feat: supabase and ziina server clients"
```

---

## Task 5: Checkout API route

**Files:**
- Create: `app/api/checkout/route.js`

- [ ] **Step 1: Write the route**

Create `app/api/checkout/route.js`:
```js
import { NextResponse } from 'next/server';
import { calculateOrder } from '@/lib/products';
import { getSupabase } from '@/lib/supabase';
import { createPaymentIntent } from '@/lib/ziina';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const customer = body?.customer || {};
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    const address = String(customer.address || '').trim();
    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Name, phone, and address are all required.' }, { status: 400 });
    }

    // Server-authoritative total — the browser's numbers are ignored.
    const order = calculateOrder(body?.items);

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    const intent = await createPaymentIntent({
      amountFils: order.amountFils,
      successUrl: `${origin}/order/success`,
      cancelUrl: `${origin}/order?status=cancelled`,
      failureUrl: `${origin}/order?status=failed`,
    });

    const supabase = getSupabase();
    const { error } = await supabase.from('orders').insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      items: order.lineItems,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      status: 'pending_payment',
      ziina_payment_id: intent.id,
    });
    if (error) throw new Error(error.message);

    // Remember which intent this browser is paying, so /api/confirm can verify it on return.
    const res = NextResponse.json({ redirect_url: intent.redirect_url });
    res.cookies.set('hoc_pi', intent.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Checkout failed.' }, { status: 400 });
  }
}
```

- [ ] **Step 2: Smoke-test it**

Run the dev server (`npm run dev`) and in another terminal:
```bash
curl -i -X POST http://localhost:3000/api/checkout \
  -H 'Content-Type: application/json' \
  -d '{"items":[{"id":"classic","qty":1}],"customer":{"name":"Test","phone":"050","address":"Dubai"}}'
```
Expected: HTTP 200, JSON body with a `redirect_url` (an `api-v2.ziina.com` URL), and a `Set-Cookie: hoc_pi=...` header. Confirm a `pending_payment` row appeared in Supabase.

- [ ] **Step 3: Commit**

```bash
git add app/api/checkout/route.js
git commit -m "feat: checkout route creates ziina intent and pending order"
```

---

## Task 6: Confirm API route

**Files:**
- Create: `app/api/confirm/route.js`

- [ ] **Step 1: Write the route**

Create `app/api/confirm/route.js`:
```js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';
import { getPaymentIntent } from '@/lib/ziina';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = cookies();
  const pi = cookieStore.get('hoc_pi')?.value;
  if (!pi) return NextResponse.json({ error: 'No pending order found.' }, { status: 400 });

  const intent = await getPaymentIntent(pi);
  const supabase = getSupabase();

  if (intent.status === 'completed') {
    // Flip to "new" only on the first confirmation (idempotent via the status guard).
    await supabase.from('orders')
      .update({ status: 'new' })
      .eq('ziina_payment_id', pi)
      .eq('status', 'pending_payment');

    const { data } = await supabase.from('orders')
      .select('order_number')
      .eq('ziina_payment_id', pi)
      .maybeSingle();

    const res = NextResponse.json({ status: 'paid', order_number: data?.order_number || null });
    res.cookies.delete('hoc_pi');
    return res;
  }

  // Not completed yet (pending / failed / cancelled) — leave the order as pending_payment.
  return NextResponse.json({ status: intent.status || 'pending' });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/confirm/route.js
git commit -m "feat: confirm route verifies ziina status before marking paid"
```

---

## Task 7: Storefront + cart (`/order`)

**Files:**
- Create: `app/order/page.js`

- [ ] **Step 1: Write the page**

Create `app/order/page.js`:
```jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS, DELIVERY_FEE } from '@/lib/products';

const LIST = [PRODUCTS.classic, PRODUCTS.large];
const STORAGE_KEY = 'hoc_cart_v1';

export default function OrderPage() {
  const [qty, setQty] = useState({ classic: 0, large: 0 });
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved?.qty) setQty((q) => ({ ...q, ...saved.qty }));
      if (saved?.customer) setCustomer((c) => ({ ...c, ...saved.customer }));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ qty, customer }));
  }, [qty, customer]);

  const items = LIST.filter((p) => qty[p.id] > 0).map((p) => ({ id: p.id, qty: qty[p.id] }));
  const subtotal = LIST.reduce((s, p) => s + p.price * (qty[p.id] || 0), 0);
  const hasItems = items.length > 0;
  const total = hasItems ? subtotal + DELIVERY_FEE : 0;
  const filled = customer.name.trim() && customer.phone.trim() && customer.address.trim();
  const canPay = hasItems && filled && !loading;

  const step = (id, d) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(99, (q[id] || 0) + d)) }));

  async function pay() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed.');
      window.location.href = data.redirect_url;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <main className="order">
      <div className="container">
        <header className="order__head">
          <Link href="/" className="order__back">← House of Chops</Link>
          <span className="eyebrow">Order Online</span>
          <h1>Build your box.</h1>
          <p>Fired to order, packed to travel. Delivery across Dubai.</p>
        </header>

        <section className="order__grid">
          {LIST.map((p) => (
            <article key={p.id} className="box">
              <div className="box__media" style={{ backgroundImage: `url(/images/${p.id}-box.jpg)` }} />
              <div className="box__body">
                <span className="box__sub eyebrow">{p.subtitle}</span>
                <h3 className="box__title">{p.name}</h3>
                <span className="box__price display">AED {p.price}</span>
                <div className="stepper">
                  <button onClick={() => step(p.id, -1)} aria-label={`Remove one ${p.name}`}>−</button>
                  <span className="display">{qty[p.id] || 0}</span>
                  <button onClick={() => step(p.id, 1)} aria-label={`Add one ${p.name}`}>+</button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="cart glass">
          <h2>Your order</h2>
          {!hasItems && <p className="cart__empty">Add a box to get started.</p>}
          {hasItems && (
            <>
              <ul className="cart__lines">
                {LIST.filter((p) => qty[p.id] > 0).map((p) => (
                  <li key={p.id}>
                    <span>{qty[p.id]} × {p.name}</span>
                    <span className="display">AED {p.price * qty[p.id]}</span>
                  </li>
                ))}
              </ul>
              <div className="cart__row"><span>Subtotal</span><span className="display">AED {subtotal}</span></div>
              <div className="cart__row"><span>Delivery</span><span className="display">AED {DELIVERY_FEE}</span></div>
              <div className="cart__row cart__row--total"><span>Total</span><span className="display">AED {total}</span></div>

              <div className="fields">
                <input placeholder="Full name" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                <input placeholder="Phone number" inputMode="tel" value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                <textarea placeholder="Delivery address" rows={3} value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              </div>

              {error && <p className="cart__error">{error}</p>}
              <button className="btn btn-primary pay" disabled={!canPay} onClick={pay}>
                {loading ? 'Redirecting…' : `Pay AED ${total}`}
              </button>
              <p className="cart__note">Secure payment by Ziina · Apple Pay, Google Pay & card</p>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .order { padding: 40px 0 96px; min-height: 100dvh; }
        .order__head { text-align: center; max-width: 38rem; margin: 0 auto 36px; }
        .order__back { display: inline-block; color: var(--color-muted); font-size: 0.85rem; margin-bottom: 18px; }
        .order__head h1 { font-size: clamp(2.2rem, 6vw, 3rem); margin: 12px 0 10px; }
        .order__head p { color: var(--color-muted); }
        .order__grid { display: grid; grid-template-columns: 1fr; gap: 18px; margin-bottom: 28px; }
        .box { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); overflow: hidden; }
        .box__media { aspect-ratio: 4/3; background: #0d0a07 center/cover no-repeat; }
        .box__body { padding: 20px; display: flex; flex-direction: column; gap: 8px; }
        .box__title { font-family: var(--font-serif); font-size: 1.6rem; }
        .box__price { font-size: 1.5rem; color: var(--color-accent); }
        .stepper { display: flex; align-items: center; gap: 18px; margin-top: 8px; }
        .stepper button { width: 44px; height: 44px; border-radius: 999px; border: 1px solid var(--color-border); color: var(--color-foreground); font-size: 1.3rem; background: var(--color-surface-2); }
        .stepper button:hover { border-color: var(--color-accent); }
        .stepper span { min-width: 1.5rem; text-align: center; font-size: 1.2rem; }
        .cart { max-width: 30rem; margin: 0 auto; padding: 26px; border-radius: var(--radius-lg); }
        .cart h2 { font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 16px; }
        .cart__empty { color: var(--color-muted); }
        .cart__lines { list-style: none; display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
        .cart__lines li { display: flex; justify-content: space-between; color: var(--color-foreground-soft); }
        .cart__row { display: flex; justify-content: space-between; padding: 6px 0; color: var(--color-muted); }
        .cart__row--total { color: var(--color-foreground); font-size: 1.15rem; border-top: 1px solid var(--color-border-soft); margin-top: 6px; padding-top: 12px; }
        .cart__row--total .display { color: var(--color-accent); }
        .fields { display: flex; flex-direction: column; gap: 10px; margin: 18px 0; }
        .fields input, .fields textarea { width: 100%; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
        .fields input:focus, .fields textarea:focus { outline: none; border-color: var(--color-accent); }
        .pay { width: 100%; min-height: 52px; font-size: 1rem; }
        .pay:disabled { opacity: 0.45; cursor: not-allowed; }
        .cart__error { color: #ff8a7a; font-size: 0.9rem; margin-bottom: 10px; }
        .cart__note { text-align: center; color: var(--color-muted); font-size: 0.78rem; margin-top: 12px; }
        @media (min-width: 760px) { .order__grid { grid-template-columns: repeat(2, 1fr); gap: 22px; } }
      `}</style>
    </main>
  );
}
```

- [ ] **Step 2: Verify in the browser**

With `npm run dev` running, open `http://localhost:3000/order`. Confirm: both boxes render with the site styling, steppers change quantities, the cart shows subtotal + 15 AED delivery + total, and "Pay" is disabled until name/phone/address are filled. Reload — the cart should persist.

- [ ] **Step 3: Commit**

```bash
git add app/order/page.js
git commit -m "feat: order storefront and cart"
```

---

## Task 8: Thank-you page (`/order/success`)

**Files:**
- Create: `app/order/success/page.js`

- [ ] **Step 1: Write the page**

Create `app/order/success/page.js`:
```jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  const [state, setState] = useState({ loading: true, paid: false, orderNumber: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/confirm', { method: 'POST' });
        const data = await res.json();
        if (data.status === 'paid') {
          localStorage.removeItem('hoc_cart_v1');
          setState({ loading: false, paid: true, orderNumber: data.order_number });
        } else {
          setState({ loading: false, paid: false, orderNumber: null });
        }
      } catch {
        setState({ loading: false, paid: false, orderNumber: null });
      }
    })();
  }, []);

  return (
    <main className="thanks">
      <div className="container">
        {state.loading && <p className="thanks__status">Confirming your payment…</p>}
        {!state.loading && state.paid && (
          <>
            <span className="eyebrow">Order Confirmed</span>
            <h1>Thank you.</h1>
            <p className="thanks__num display">{state.orderNumber}</p>
            <p className="thanks__msg">Your chops are heading to the kitchen. We&apos;ll be in touch on the number you gave us.</p>
            <Link href="/" className="btn btn-primary">Back to House of Chops</Link>
          </>
        )}
        {!state.loading && !state.paid && (
          <>
            <span className="eyebrow">Payment Not Confirmed</span>
            <h1>Hmm.</h1>
            <p className="thanks__msg">We couldn&apos;t confirm a completed payment. If you were charged, contact us and we&apos;ll sort it out — no order has been sent to the kitchen.</p>
            <Link href="/order" className="btn btn-primary">Back to ordering</Link>
          </>
        )}
      </div>
      <style jsx>{`
        .thanks { min-height: 100dvh; display: flex; align-items: center; text-align: center; }
        .thanks .container { max-width: 32rem; }
        .thanks h1 { font-family: var(--font-serif); font-size: clamp(2.4rem, 7vw, 3.4rem); margin: 12px 0; }
        .thanks__num { font-size: 2rem; color: var(--color-accent); letter-spacing: 0.06em; margin-bottom: 16px; }
        .thanks__msg { color: var(--color-muted); margin-bottom: 28px; }
        .thanks__status { color: var(--color-muted); }
      `}</style>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/order/success/page.js
git commit -m "feat: thank-you page confirms payment on return"
```

---

## Task 9: Repoint homepage order CTAs to `/order`

**Files:**
- Modify: `components/Menu.js`, `components/Hero.js`, `components/Navbar.js`, `components/Contact.js`

- [ ] **Step 1: Find every order CTA**

Run: `grep -rn "SITE.orderUrl" components/`
Expected: matches in `Menu.js` (2), `Hero.js` (1), `Navbar.js` (2), `Contact.js` (2).

- [ ] **Step 2: Replace each order CTA**

For each match that is an **order / "Order Now"** button, change it from the WhatsApp external link to an internal link to `/order`. Replace this attribute pattern:
```jsx
href={SITE.orderUrl}
target="_blank"
rel="noopener noreferrer"
```
with:
```jsx
href="/order"
```
(Remove the now-unused `target`/`rel` on those elements.) Leave any non-order WhatsApp/contact link in `Contact.js` pointing at WhatsApp if it is a "message us" link rather than an "order" link — check the surrounding label before changing. The order CTAs use labels like "Order", "Order Now"; repoint those.

- [ ] **Step 3: Verify**

Run `npm run dev`, open `http://localhost:3000`, click each "Order"/"Order Now" button. Each should navigate to `/order` (not WhatsApp).

- [ ] **Step 4: Commit**

```bash
git add components/Menu.js components/Hero.js components/Navbar.js components/Contact.js
git commit -m "feat: point order CTAs at the new /order page"
```

---

## Task 10: Kitchen auth (token, login API, login page)

**Files:**
- Create: `lib/kitchenAuth.js`
- Create: `app/api/kitchen/login/route.js`
- Create: `app/kitchen/login/page.js`

- [ ] **Step 1: Write the auth helper**

Create `lib/kitchenAuth.js`:
```js
import crypto from 'crypto';

export const KITCHEN_COOKIE = 'hoc_kitchen';

// A cookie value that can't be forged without knowing KITCHEN_PASSWORD.
export function kitchenToken() {
  const secret = process.env.KITCHEN_PASSWORD || '';
  return crypto.createHmac('sha256', secret).update('house-of-chops-kitchen-v1').digest('hex');
}

export function isKitchenAuthed(cookieStore) {
  const val = cookieStore.get(KITCHEN_COOKIE)?.value;
  return !!val && val === kitchenToken();
}
```

- [ ] **Step 2: Write the login route**

Create `app/api/kitchen/login/route.js`:
```js
import { NextResponse } from 'next/server';
import { kitchenToken, KITCHEN_COOKIE } from '@/lib/kitchenAuth';

export const runtime = 'nodejs';

export async function POST(request) {
  const { password } = await request.json();
  if (!password || password !== process.env.KITCHEN_PASSWORD) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(KITCHEN_COOKIE, kitchenToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
```

- [ ] **Step 3: Write the login page**

Create `app/kitchen/login/page.js`:
```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function KitchenLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/kitchen/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push('/kitchen');
    else setError('Wrong password.');
  }

  return (
    <main className="login">
      <form className="glass" onSubmit={submit}>
        <span className="eyebrow">House of Chops</span>
        <h1>Kitchen</h1>
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="login__error">{error}</p>}
        <button className="btn btn-primary" type="submit">Enter</button>
      </form>
      <style jsx>{`
        .login { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        form { display: flex; flex-direction: column; gap: 14px; padding: 32px; border-radius: var(--radius-lg); width: 100%; max-width: 22rem; }
        h1 { font-family: var(--font-serif); font-size: 2rem; }
        input { padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-size: 1rem; }
        input:focus { outline: none; border-color: var(--color-accent); }
        .login__error { color: #ff8a7a; font-size: 0.9rem; }
        button { min-height: 48px; }
      `}</style>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/kitchenAuth.js app/api/kitchen/login/route.js app/kitchen/login/page.js
git commit -m "feat: kitchen password login"
```

---

## Task 11: Kitchen data API (orders + update)

**Files:**
- Create: `app/api/kitchen/orders/route.js`
- Create: `app/api/kitchen/update/route.js`

- [ ] **Step 1: Write the orders route**

Create `app/api/kitchen/orders/route.js`:
```js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isKitchenAuthed(cookies())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['new', 'cooking', 'ready'])
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString())
    .neq('status', 'pending_payment');

  return NextResponse.json({ orders: data || [], totalToday: count || 0 });
}
```

- [ ] **Step 2: Write the update route**

Create `app/api/kitchen/update/route.js`:
```js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const ALLOWED = ['new', 'cooking', 'ready', 'delivered'];

export async function POST(request) {
  if (!isKitchenAuthed(cookies())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, status } = await request.json();
  if (!id || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/kitchen/orders/route.js app/api/kitchen/update/route.js
git commit -m "feat: kitchen orders and status-update APIs"
```

---

## Task 12: Kitchen board page + component

**Files:**
- Create: `app/kitchen/page.js`
- Create: `components/KitchenBoard.js`

- [ ] **Step 1: Write the server gate**

Create `app/kitchen/page.js`:
```jsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import KitchenBoard from '@/components/KitchenBoard';

export const dynamic = 'force-dynamic';

export default function KitchenPage() {
  if (!isKitchenAuthed(cookies())) redirect('/kitchen/login');
  return <KitchenBoard />;
}
```

- [ ] **Step 2: Write the board**

Create `components/KitchenBoard.js`:
```jsx
'use client';
import { useEffect, useRef, useState } from 'react';

const COLUMNS = [
  { key: 'new', label: 'New', next: 'cooking', cta: 'Start cooking' },
  { key: 'cooking', label: 'Cooking', next: 'ready', cta: 'Mark ready' },
  { key: 'ready', label: 'Ready / Out', next: 'delivered', cta: 'Delivered' },
];

function timeSince(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m ago`;
}

export default function KitchenBoard() {
  const [orders, setOrders] = useState([]);
  const [totalToday, setTotalToday] = useState(0);
  const [tick, setTick] = useState(0); // forces time-since to refresh
  const seenIds = useRef(new Set());
  const [flashIds, setFlashIds] = useState(new Set());

  async function load() {
    const res = await fetch('/api/kitchen/orders', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const incoming = data.orders || [];
    // Flag genuinely new arrivals for a highlight.
    const fresh = new Set();
    for (const o of incoming) {
      if (!seenIds.current.has(o.id) && o.status === 'new') fresh.add(o.id);
      seenIds.current.add(o.id);
    }
    if (fresh.size) {
      setFlashIds(fresh);
      setTimeout(() => setFlashIds(new Set()), 4000);
    }
    setOrders(incoming);
    setTotalToday(data.totalToday || 0);
  }

  useEffect(() => {
    load();
    const poll = setInterval(load, 5000);
    const clock = setInterval(() => setTick((t) => t + 1), 30000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, []);

  async function advance(id, status) {
    await fetch('/api/kitchen/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  const countFor = (key) => orders.filter((o) => o.status === key).length;

  return (
    <main className="kb">
      <header className="kb__top">
        <h1>Kitchen</h1>
        <div className="kb__counts">
          <span><b>{countFor('new')}</b> New</span>
          <span><b>{countFor('cooking')}</b> Cooking</span>
          <span><b>{countFor('ready')}</b> Ready</span>
          <span><b>{totalToday}</b> Today</span>
        </div>
      </header>

      <div className="kb__board">
        {COLUMNS.map((col) => (
          <section key={col.key} className="kb__col">
            <h2>{col.label} <span>{countFor(col.key)}</span></h2>
            {orders.filter((o) => o.status === col.key).map((o) => (
              <article key={o.id} className={`card${flashIds.has(o.id) ? ' card--flash' : ''}`} data-tick={tick}>
                <div className="card__head">
                  <span className="card__num">{o.order_number}</span>
                  <span className="card__time">{timeSince(o.created_at)}</span>
                </div>
                <ul className="card__items">
                  {(o.items || []).map((it, i) => (
                    <li key={i}>{it.qty} × {it.name}</li>
                  ))}
                </ul>
                <div className="card__cust">
                  <div>{o.customer_name}</div>
                  <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a>
                  <div className="card__addr">{o.customer_address}</div>
                </div>
                <div className="card__foot">
                  <span className="card__total">AED {o.total}</span>
                  <button onClick={() => advance(o.id, col.next)}>{col.cta}</button>
                </div>
              </article>
            ))}
            {countFor(col.key) === 0 && <p className="kb__empty">—</p>}
          </section>
        ))}
      </div>

      <style jsx>{`
        .kb { min-height: 100dvh; padding: 18px; }
        .kb__top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
        .kb__top h1 { font-family: var(--font-serif); font-size: 1.8rem; }
        .kb__counts { display: flex; gap: 16px; color: var(--color-muted); font-size: 0.9rem; }
        .kb__counts b { color: var(--color-accent); font-size: 1.1rem; }
        .kb__board { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .kb__col { background: var(--color-surface); border: 1px solid var(--color-border-soft); border-radius: var(--radius); padding: 12px; }
        .kb__col h2 { font-family: var(--font-body); font-weight: 600; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--color-muted); display: flex; justify-content: space-between; margin-bottom: 10px; }
        .kb__empty { color: var(--color-border); text-align: center; padding: 20px 0; }
        .card { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); padding: 14px; margin-bottom: 10px; }
        .card--flash { animation: flash 1s ease-in-out 0s 4; border-color: var(--color-accent); }
        @keyframes flash { 0%,100% { box-shadow: 0 0 0 0 rgba(200,135,58,0); } 50% { box-shadow: 0 0 0 3px rgba(200,135,58,0.6); } }
        .card__head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .card__num { font-family: var(--font-display); font-size: 1.2rem; color: var(--color-accent); letter-spacing: 0.05em; }
        .card__time { font-size: 0.78rem; color: var(--color-muted); }
        .card__items { list-style: none; margin-bottom: 8px; }
        .card__items li { font-size: 0.95rem; }
        .card__cust { font-size: 0.85rem; color: var(--color-foreground-soft); margin-bottom: 10px; }
        .card__cust a { color: var(--color-accent); }
        .card__addr { color: var(--color-muted); margin-top: 2px; }
        .card__foot { display: flex; justify-content: space-between; align-items: center; }
        .card__total { font-family: var(--font-display); color: var(--color-accent); }
        .card__foot button { padding: 9px 14px; border-radius: var(--radius); background: var(--color-accent); color: #1A1206; font-weight: 600; font-size: 0.85rem; }
        .card__foot button:hover { background: var(--color-accent-deep); }
        @media (min-width: 860px) { .kb__board { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </main>
  );
}
```

- [ ] **Step 3: Verify the gate and board**

Open `http://localhost:3000/kitchen` in a fresh/incognito window → should redirect to `/kitchen/login`. Enter the wrong password → "Wrong password." Enter `houseofchops.ae` → lands on the board. With a paid order present (from Task 13), it appears under New and the status buttons move it New → Cooking → Ready → off the board.

- [ ] **Step 4: Commit**

```bash
git add app/kitchen/page.js components/KitchenBoard.js
git commit -m "feat: live kitchen board with polling and status flow"
```

---

## Task 13: End-to-end test in Ziina test mode

**Files:** none (verification task)

- [ ] **Step 1: Run the full happy path**

With `npm run dev` running and `ZIINA_TEST_MODE=true`:
1. Go to `/order`, add 1 Classic + 1 Large, fill name/phone/address, tap Pay.
2. On Ziina's test page, complete payment with any test card (any number/expiry/CVV).
3. Confirm you land on `/order/success` showing an `HOC-…` order number.
4. Open `/kitchen` (log in), confirm the order shows under **New** with the right boxes, customer details, and total (AED 79 + 99 + 15 = 193).

- [ ] **Step 2: Verify the security guarantees**

1. In Supabase, confirm the order's `status` is `new` (not `pending_payment`) and `total` is `193`.
2. Tamper test: re-run the `curl` from Task 5 but add `"total": 1` to the body — confirm the saved order's `total` is still computed server-side (193 for that cart), not 1.
3. Visit `/order/success` directly in a new browser with no `hoc_pi` cookie — confirm it shows "Payment Not Confirmed" and creates no paid order.

- [ ] **Step 3: Verify the cancel path**

Start a checkout, then cancel on Ziina → confirm you return to `/order` and no order flips to `new` (it stays `pending_payment` in Supabase).

---

## Task 14: Launch switch

**Files:**
- Modify: `.env.local`; Vercel project env vars

- [ ] **Step 1: Mirror env vars into Vercel**

In the Vercel project (Settings → Environment Variables), add for Production: `ZIINA_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `KITCHEN_PASSWORD`, `NEXT_PUBLIC_SITE_URL=https://houseofchopsdxb.com`, and `ZIINA_TEST_MODE=false`.

- [ ] **Step 2: Use the live Ziina key**

Replace the test `ZIINA_API_KEY` with the live key in Vercel (and locally if doing a live local test). Keep `ZIINA_TEST_MODE=true` locally until you're ready.

- [ ] **Step 3: Deploy and smoke-test**

Push the branch, open a PR, merge, and let Vercel deploy. On production, run one small real order end-to-end, confirm it reaches `/kitchen`, then you're live.

---

## Self-review notes

- **Spec coverage:** storefront+cart (T7), 15 AED delivery + server total (T3/T5), Ziina intent in fils + test flag (T4/T5), pending→new only on confirmed payment (T6), orders table with all columns + HOC-01 numbering (T2), kitchen board with 3 columns/counts/auto-refresh/highlight/status flow (T11/T12), password gate (T10/T12), no-trust-the-browser + secrets server-only (T3/T5/T6), repointed CTAs (T9), E2E test mode then launch (T13/T14). All spec sections map to a task.
- **Cookie-based confirmation** is used instead of relying on Ziina appending the intent id to the success URL, so confirmation works regardless of Ziina's redirect query params.
