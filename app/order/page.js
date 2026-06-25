'use client';
import { useState, useEffect } from 'react';
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
          <a href="/" className="order__back">← House of Chops</a>
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
              <p className="cart__note">Secure payment by Ziina · Apple Pay, Google Pay &amp; card</p>
            </>
          )}
        </section>
      </div>

      <style jsx>{`
        .order { padding: 40px 0 96px; min-height: 100dvh; }
        .order__head { text-align: center; max-width: 38rem; margin: 0 auto 36px; }
        .order__back { display: block; width: fit-content; margin: 0 auto 18px; color: var(--color-muted); font-size: 0.85rem; }
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
