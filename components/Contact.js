'use client';
import { motion } from 'framer-motion';
import { SITE } from '@/lib/data';

export default function Contact() {
  return (
    <>
      <section id="contact" className="cta">
        <div className="container">
          <motion.div
            className="cta__panel"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Hungry yet?</span>
            <h2>Your chops are one tap away.</h2>
            <p>Open daily across Dubai. Order now and we’ll fire them fresh.</p>
            <div className="cta__actions">
              <a
                href={SITE.talabatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Order on Talabat
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                Follow {SITE.instagramHandle}
              </a>
            </div>
            <div className="cta__info">
              <div>
                <span>Hours</span>
                <strong>{SITE.hours}</strong>
              </div>
              <div>
                <span>Service</span>
                <strong>Delivery only · {SITE.city}</strong>
              </div>
              <div>
                <span>Call</span>
                <strong>{SITE.phone}</strong>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="House of Chops" width="120" height="120" />
            <p className="footer__tagline">{SITE.tagline}</p>
          </div>
          <nav className="footer__links" aria-label="Footer">
            <a href="#menu">Menu</a>
            <a href="#story">Story</a>
            <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer">Talabat</a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </nav>
        </div>
        <div className="container footer__base">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.kitchen} · {SITE.city}</span>
        </div>
      </footer>

      <style jsx>{`
        .cta { padding: 72px 0; }
        .cta__panel {
          text-align: center;
          padding: 44px 24px 48px;
          background:
            linear-gradient(180deg, rgba(200, 135, 58, 0.06), rgba(200, 135, 58, 0.02));
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }
        .cta__panel h2 {
          font-size: clamp(2rem, 5.5vw, 3rem);
          margin: 14px 0 14px;
        }
        .cta__panel > p {
          color: var(--color-muted);
          margin-bottom: 28px;
        }
        .cta__actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          margin-bottom: 36px;
        }
        .cta__actions .btn { width: 100%; max-width: 320px; }

        .cta__info {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          text-align: center;
          padding-top: 28px;
          border-top: 1px solid var(--color-border-soft);
        }
        .cta__info span {
          display: block;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 6px;
          font-family: var(--font-display);
        }
        .cta__info strong {
          font-weight: 400;
          color: var(--color-foreground);
          font-size: 0.95rem;
        }

        .footer {
          padding: 48px 0 32px;
          border-top: 1px solid var(--color-border-soft);
        }
        .footer__inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 24px;
        }
        .footer__brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
        }
        .footer__brand img {
          width: 110px;
          height: 110px;
          object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(200, 135, 58, 0.30));
        }
        .footer__tagline {
          color: var(--color-muted);
          max-width: 22rem;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.96rem;
        }
        .footer__links {
          display: flex;
          gap: 22px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .footer__links a {
          color: var(--color-foreground-soft);
          font-size: 0.92rem;
          transition: color 0.2s var(--ease);
        }
        .footer__links a:hover { color: var(--color-accent); }
        .footer__base {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          margin-top: 32px;
          padding-top: 22px;
          border-top: 1px solid var(--color-border-soft);
          color: var(--color-muted);
          font-size: 0.78rem;
        }

        @media (min-width: 540px) {
          .cta__actions { flex-direction: row; justify-content: center; }
          .cta__actions .btn { width: auto; }
        }
        @media (min-width: 760px) {
          .cta { padding: 96px 0; }
          .cta__panel { padding: 64px 48px; }
          .cta__info { grid-template-columns: repeat(3, 1fr); padding-top: 36px; }
          .footer { padding: 60px 0 40px; }
          .footer__inner { flex-direction: row; justify-content: space-between; text-align: left; }
          .footer__brand { flex-direction: row; align-items: center; }
          .footer__tagline { text-align: left; }
          .footer__base { flex-direction: row; justify-content: space-between; text-align: left; }
        }
      `}</style>
    </>
  );
}
