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
      <div
        className="hero__photo"
        role="img"
        aria-label="House of Chops branded box with flame-grilled lamb chops"
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
            Dubai · Talabat Exclusive
          </motion.span>
          <motion.h1 variants={rise} className="hero__title">
            Lamb chops,<br />
            <em>done properly.</em>
          </motion.h1>
          <motion.p variants={rise} className="hero__sub">
            24-hour marinade. Open flame. Delivered hot.
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

    </section>
  );
}
