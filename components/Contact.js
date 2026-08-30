'use client';
import { motion } from 'framer-motion';
import { SITE } from '@/lib/data';
import OrderCta from './OrderCta';
import Newsletter from './Newsletter';

export default function Contact() {
  return (
    <>
      <section id="contact" className="cta">
        <div className="container">
          <motion.div
            className="cta__panel"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="eyebrow">Hungry yet?</span>
              <h2>Your chops are one tap away.</h2>
            </motion.div>
            <p>Open daily across Dubai. Order now and we’ll fire them fresh.</p>
            <div className="cta__actions">
              <OrderCta className="btn btn-primary">
                Order Now
              </OrderCta>
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
            </div>
          </motion.div>
        </div>
      </section>

      <Newsletter />

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="House of Chops" width="120" height="120" className="chop-kick" />
            <p className="footer__tagline">{SITE.tagline}</p>
          </div>
          <nav className="footer__links" aria-label="Footer">
            <a href="#menu">Menu</a>
            <a href="#story">Story</a>
            <OrderCta className="footer__link">Order</OrderCta>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </nav>
        </div>
        <div className="container footer__base">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.kitchen} · {SITE.city}</span>
        </div>
      </footer>

      <style jsx>{`
        .footer {
          padding: 48px 0 32px;
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
        .footer__links a, .footer__links :global(.footer__link) {
          color: var(--color-foreground-soft);
          font-size: 0.92rem;
          transition: color 0.2s var(--ease);
        }
        .footer__links a:hover, .footer__links :global(.footer__link):hover { color: var(--color-accent); }
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

        @media (min-width: 760px) {
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
