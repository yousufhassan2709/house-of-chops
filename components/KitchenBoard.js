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
  const [tick, setTick] = useState(0);
  const seenIds = useRef(new Set());
  const [flashIds, setFlashIds] = useState(new Set());

  async function load() {
    const res = await fetch('/api/kitchen/orders', { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const incoming = data.orders || [];
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
                  {o.latitude != null && o.longitude != null && (
                    <a className="card__maps" href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                      target="_blank" rel="noopener noreferrer">📍 Open in Google Maps</a>
                  )}
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
        .card__maps { display: inline-block; margin-top: 6px; color: var(--color-accent); font-weight: 600; font-size: 0.82rem; }
        .card__foot { display: flex; justify-content: space-between; align-items: center; }
        .card__total { font-family: var(--font-display); color: var(--color-accent); }
        .card__foot button { padding: 9px 14px; border-radius: var(--radius); background: var(--color-accent); color: #1A1206; font-weight: 600; font-size: 0.85rem; }
        .card__foot button:hover { background: var(--color-accent-deep); }
        @media (min-width: 860px) { .kb__board { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
    </main>
  );
}
