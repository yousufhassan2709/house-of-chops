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
              <p>Drops, specials and new boxes before they hit the menu.</p>

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

    </section>
  );
}
