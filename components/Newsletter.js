'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

/** The follow-up sign-up, sitting between the closing CTA and the footer.
 *
 *  One field and one button. A restaurant newsletter that asks for a name, a
 *  birthday and a preference is a form; this is a line you finish in four
 *  seconds on a phone, which is the only version anyone actually completes.
 *
 *  It states what arrives before it asks for the address — nobody should have
 *  to guess what they are signing up for — and once it is done the whole panel
 *  becomes the confirmation rather than growing a message underneath it.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          path: typeof window !== 'undefined' ? window.location.pathname : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Could not sign you up. Please try again.');
        setState('error');
        return;
      }
      setState('done');
    } catch {
      setError('Could not sign you up. Please try again.');
      setState('error');
    }
  }

  return (
    <section className="news" aria-labelledby="news-title">
      <div className="container">
        <motion.div
          className="news__panel"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="news__rule" aria-hidden="true" />

          {state === 'done' ? (
            <div className="news__done" role="status">
              <span className="eyebrow">You&rsquo;re on the list</span>
              <h2 id="news-title">Welcome to the House.</h2>
              <p>Specials, new boxes and the odd secret off the grill — straight to your inbox.</p>
            </div>
          ) : (
            <>
              <span className="eyebrow">Stay on the list</span>
              <h2 id="news-title">First to know. First to eat.</h2>
              <p>Drops, specials and new boxes before they hit the menu. No spam — just chops.</p>

              <form className="news__form" onSubmit={submit} noValidate>
                <label className="news__label" htmlFor="news-email">Email address</label>
                <div className="news__row">
                  <input
                    id="news-email"
                    className="news__input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                    aria-invalid={state === 'error'}
                    aria-describedby={state === 'error' ? 'news-error' : undefined}
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-primary news__btn"
                    disabled={state === 'sending'}
                  >
                    {state === 'sending' ? 'Signing up…' : 'Sign up'}
                  </button>
                </div>
                {state === 'error' && (
                  <p className="news__error" id="news-error" role="alert">{error}</p>
                )}
              </form>
            </>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .news { padding: 8px 0 64px; }

        .news__panel {
          position: relative;
          max-width: 42rem;
          margin: 0 auto;
          text-align: center;
          padding: 44px 24px 8px;
        }

        /* A single gold hairline instead of a bordered box — the sign-up is
           the last thing on the page, not another card competing with the
           closing CTA above it. */
        .news__rule {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(320px, 70%);
          height: 1px;
          background: linear-gradient(90deg,
            rgba(200, 135, 58, 0) 0%,
            rgba(200, 135, 58, 0.55) 50%,
            rgba(200, 135, 58, 0) 100%);
        }

        .news__panel h2 {
          font-size: clamp(1.7rem, 4.6vw, 2.3rem);
          margin: 14px 0 10px;
        }
        .news__panel p {
          color: var(--color-muted);
          font-size: 0.98rem;
          max-width: 32rem;
          margin: 0 auto;
        }

        .news__form { margin-top: 26px; }
        /* The label is read out but not drawn — the placeholder and the
           heading already say what goes in the box. */
        .news__label {
          position: absolute;
          width: 1px; height: 1px;
          padding: 0; margin: -1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }

        .news__row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 30rem;
          margin: 0 auto;
        }

        .news__input {
          flex: 1;
          min-height: 52px;
          padding: 14px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: border-color 0.25s var(--ease), background 0.25s var(--ease), box-shadow 0.25s var(--ease);
        }
        .news__input::placeholder { color: rgba(255, 255, 255, 0.38); }
        .news__input:hover { border-color: rgba(200, 135, 58, 0.4); }
        .news__input:focus {
          outline: none;
          border-color: var(--color-accent);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(200, 135, 58, 0.16);
        }
        .news__input[aria-invalid='true'] { border-color: rgba(224, 122, 95, 0.7); }

        .news__btn { min-height: 52px; white-space: nowrap; }
        .news__btn:disabled { opacity: 0.6; cursor: default; }

        .news__error {
          margin-top: 12px;
          color: #E8A18C;
          font-size: 0.9rem;
        }

        .news__done { padding: 4px 0 12px; }

        @media (min-width: 560px) {
          .news__row { flex-direction: row; }
          .news__btn { width: auto; }
        }
        @media (min-width: 760px) {
          .news { padding: 8px 0 88px; }
          .news__panel { padding: 56px 32px 8px; }
        }
      `}</style>
    </section>
  );
}
