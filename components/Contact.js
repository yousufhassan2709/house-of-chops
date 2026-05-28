'use client';
import { motion } from 'framer-motion';
import { SITE } from '@/lib/data';

export default function Contact() {
  return (
    <>
      <section id="contact" className="cta">
        <div className="container">
          <motion.div
            className="cta__panel glass"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Hungry yet?</span>
            <h2>Your chops are one tap away.</h2>
            <p>Open daily across Dubai. Order now and we&apos;ll fire them fresh.</p>
            <div className="cta__actions">
              <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Order on Talabat
              </a>
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                Follow on Instagram
              </a>
            </div>
            <div className="cta__info">
              <div><span>Hours</span><strong>{SITE.hours}</strong></div>
              <div><span>Service</span><strong>Delivery only · {SITE.city}</strong></div>
              <div><span>Call</span><strong>{SITE.phone}</strong></div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <span className="footer__mark">H<span>o</span>C</span>
            <p>{SITE.tagline}</p>
          </div>
          <div className="footer__links">
            <a href="#menu">Menu</a>
            <a href="#story">Our Story</a>
            <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer">Talabat</a>
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
        <div className="container footer__base">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.city}</span>
        </div>
      </footer>

      <style jsx>{`
        .cta { padding: 70px 0; }
        .cta__panel { text-align: center; padding: 60px 32px; }
        .cta__panel h2 { font-size: clamp(2.1rem, 5vw, 3.4rem); margin: 16px 0 14px; }
        .cta__panel > p { color: var(--color-muted); margin-bottom: 30px; }
        .cta__actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 44px; }
        .cta__info { display: flex; gap: 50px; justify-content: center; flex-wrap: wrap; }
        .cta__info span { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-accent); display: block; margin-bottom: 8px; }
        .cta__info strong { font-weight: 400; color: var(--color-foreground); }

        .footer { padding: 50px 0 36px; border-top: 1px solid var(--color-border); }
        .footer__inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 30px; flex-wrap: wrap; }
        .footer__mark { font-family: var(--font-display); font-weight: 700; font-size: 1.6rem; }
        .footer__mark span { color: var(--color-accent); }
        .footer__brand p { color: var(--color-muted); margin-top: 10px; max-width: 18rem; font-size: 0.92rem; }
        .footer__links { display: flex; gap: 28px; flex-wrap: wrap; }
        .footer__links a { color: var(--color-muted); font-size: 0.92rem; transition: color 0.25s var(--ease); }
        .footer__links a:hover { color: var(--color-accent); }
        .footer__base {
          display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
          margin-top: 36px; padding-top: 24px; border-top: 1px solid var(--color-border);
          color: var(--color-muted); font-size: 0.82rem;
        }
      `}</style>
    </>
  );
}
