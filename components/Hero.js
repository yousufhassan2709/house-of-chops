'use client';
import { motion } from 'framer-motion';
import { SITE } from '@/lib/data';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section id="top" className="hero">
      {/* Full-bleed product photo behind everything */}
      <div
        className="hero__photo"
        role="img"
        aria-label="House of Chops branded box with flame-grilled lamb chops, seasoned fries and dipping sauces"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      <div className="hero__scrim" aria-hidden="true" />

      <div className="container hero__inner">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="hero__copy"
        >
          <motion.span variants={rise} className="eyebrow hero__eyebrow">
            Dubai · Delivery Only · Talabat Exclusive
          </motion.span>
          <motion.h1 variants={rise} className="hero__title">
            Lamb chops,<br />
            <em>done properly.</em>
          </motion.h1>
          <motion.p variants={rise} className="hero__sub">
            Premium racks. Marinated 24 hours. Fired over open flame. Built to arrive
            hot, tender and unforgettable.
          </motion.p>
          <motion.div variants={rise} className="hero__actions">
            <a
              href={SITE.talabatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Order on Talabat
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#menu" className="btn btn-ghost">View the Menu</a>
          </motion.div>
          <motion.div variants={rise} className="hero__rule">
            <span className="display">“Chops Only. That’s the House Rule.”</span>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        .hero {
          position: relative;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 88px;
          overflow: hidden;
          isolation: isolate;
        }
        .hero__photo {
          position: absolute;
          inset: 0;
          background-color: #050403;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: -2;
        }
        .hero__scrim {
          position: absolute;
          inset: 0;
          z-index: -1;
          background:
            linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.30) 38%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.92) 100%),
            radial-gradient(60% 40% at 50% 35%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%);
        }
        .hero__inner {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        /* Bulletproof centering — text-align on parent, every child block-centered */
        .hero__copy {
          width: 100%;
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero__copy > * + * { margin-top: 32px; }
        .hero__eyebrow {
          display: inline-block;
        }
        .hero__title {
          font-family: var(--font-serif);
          font-size: clamp(2.6rem, 10vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.015em;
          text-align: center;
          width: 100%;
        }
        .hero__title em { color: var(--color-accent); font-style: italic; }
        .hero__sub {
          font-size: clamp(1rem, 2.4vw, 1.15rem);
          color: var(--color-foreground-soft);
          max-width: 34rem;
          line-height: 1.65;
          text-align: center;
          margin-left: auto;
          margin-right: auto;
        }
        .hero__actions {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          max-width: 380px;
          justify-content: center;
        }
        .hero__actions .btn { width: 100%; }

        .hero__rule {
          width: 100%;
          max-width: 420px;
          padding-top: 28px;
          border-top: 1px solid var(--color-border);
          text-align: center;
        }
        .hero__rule span {
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          color: var(--color-accent);
          text-transform: uppercase;
          display: block;
        }

        @media (min-width: 540px) {
          .hero__actions { flex-direction: row; max-width: none; }
          .hero__actions .btn { width: auto; }
        }

        @media (min-width: 1024px) {
          .hero { padding: 140px 24px 112px; }
          .hero__copy > * + * { margin-top: 36px; }
        }
      `}</style>
    </section>
  );
}
