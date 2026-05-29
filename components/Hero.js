'use client';
import { motion } from 'framer-motion';
import { SITE } from '@/lib/data';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const rise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero__inner">
        <motion.div variants={stagger} initial="hidden" animate="show" className="hero__copy">
          <motion.span variants={rise} className="eyebrow">Dubai · Delivery Only</motion.span>
          <motion.h1 variants={rise} className="hero__title">
            Lamb chops,<br /><em>done properly.</em>
          </motion.h1>
          <motion.p variants={rise} className="hero__sub">
            Premium racks, marinated for a full day and finished over open flame.
            Built to arrive hot, tender and unforgettable.
          </motion.p>
          <motion.div variants={rise} className="hero__actions">
            <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Order on Talabat
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#menu" className="btn btn-ghost">View the Menu</a>
          </motion.div>
          <motion.div variants={rise} className="hero__meta">
            <span>★★★★★</span>
            <span>Loved across Dubai</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__visual glass"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div
            className="hero__photo"
            role="img"
            aria-label="Plate of flame-grilled lamb chops"
            style={{ backgroundImage: "url('/images/hero.jpg')" }}
          />
          <div className="hero__badge glass">
            <strong>24h</strong>
            <span>marinade</span>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .hero { padding: 160px 0 90px; }
        .hero__inner {
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center;
        }
        .hero__title {
          font-size: clamp(2.8rem, 7vw, 5.2rem); margin: 18px 0 22px;
        }
        .hero__title em { color: var(--color-accent); font-style: italic; }
        .hero__sub {
          font-size: 1.12rem; color: var(--color-muted); max-width: 30rem; line-height: 1.7;
        }
        .hero__actions { display: flex; gap: 14px; margin: 34px 0 26px; flex-wrap: wrap; }
        .hero__meta { display: flex; align-items: center; gap: 12px; color: var(--color-muted); font-size: 0.9rem; }
        .hero__meta span:first-child { color: var(--color-accent); letter-spacing: 2px; }

        .hero__visual { position: relative; aspect-ratio: 4/5; overflow: hidden; }
        .hero__photo {
          position: absolute; inset: 0;
          background-color: #0e0b08;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .hero__badge {
          position: absolute; bottom: 22px; left: 22px; padding: 16px 22px;
          display: flex; flex-direction: column; line-height: 1;
        }
        .hero__badge strong { font-family: var(--font-display); font-size: 1.8rem; color: var(--color-accent); }
        .hero__badge span { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--color-muted); margin-top: 6px; }

        @media (max-width: 860px) {
          .hero { padding: 130px 0 60px; }
          .hero__inner { grid-template-columns: 1fr; gap: 40px; }
          .hero__visual { max-width: 420px; margin: 0 auto; width: 100%; }
        }
      `}</style>
    </section>
  );
}
