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
          <motion.img
            variants={rise}
            src="/images/logo.png"
            alt="House of Chops"
            className="hero__logo"
            width="180"
            height="180"
          />
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

      <a href="#menu" className="hero__scroll" aria-label="Scroll to menu">
        <span />
      </a>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          padding: 96px 0 80px;
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
        .hero__copy {
          width: 100%;
          max-width: 640px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        }
        .hero__logo {
          width: clamp(120px, 26vw, 200px);
          height: auto;
          margin-bottom: 24px;
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.55));
        }
        .hero__eyebrow { margin-bottom: 18px; }
        .hero__title {
          font-family: var(--font-serif);
          font-size: clamp(2.6rem, 9vw, 4.8rem);
          line-height: 1.05;
          letter-spacing: -0.015em;
          margin-bottom: 22px;
        }
        .hero__title em { color: var(--color-accent); font-style: italic; }
        .hero__sub {
          font-size: clamp(1rem, 2.4vw, 1.15rem);
          color: var(--color-foreground-soft);
          max-width: 34rem;
          line-height: 1.65;
          margin-bottom: 32px;
        }
        .hero__actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          max-width: 380px;
          margin-bottom: 36px;
        }
        .hero__actions .btn { width: 100%; }

        .hero__rule {
          padding-top: 20px;
          border-top: 1px solid var(--color-border);
          width: 100%;
          max-width: 420px;
        }
        .hero__rule span {
          font-size: 0.85rem;
          letter-spacing: 0.2em;
          color: var(--color-accent);
          text-transform: uppercase;
          display: block;
        }

        .hero__scroll {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 56px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          opacity: 0.55;
          transition: opacity 0.25s var(--ease);
        }
        .hero__scroll:hover { opacity: 1; }
        .hero__scroll span {
          width: 22px;
          height: 36px;
          border: 1.5px solid var(--color-foreground);
          border-radius: 12px;
          position: relative;
        }
        .hero__scroll span::after {
          content: "";
          position: absolute;
          top: 8px;
          left: 50%;
          width: 2px;
          height: 6px;
          background: var(--color-foreground);
          transform: translateX(-50%);
          border-radius: 1px;
          animation: scroll-tick 1.8s var(--ease) infinite;
        }
        @keyframes scroll-tick {
          0%, 100% { transform: translate(-50%, 0); opacity: 1; }
          50% { transform: translate(-50%, 8px); opacity: 0.2; }
        }

        @media (min-width: 540px) {
          .hero__actions { flex-direction: row; max-width: none; justify-content: center; }
          .hero__actions .btn { width: auto; }
        }

        @media (min-width: 1024px) {
          .hero { padding: 120px 0 100px; }
        }
      `}</style>
    </section>
  );
}
