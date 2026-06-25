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
