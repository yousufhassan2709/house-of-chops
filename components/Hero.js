'use client';
import { motion } from 'framer-motion';
import { SITE, ORDER_LINK } from '@/lib/data';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
};
const rise = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div
        className="hero__photo"
        role="img"
        aria-label="Flame-grilled lamb chops on a wood board with charred garlic and rosemary"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />
      <div className="hero__scrim" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />

      <div className="container hero__inner">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="hero__copy"
        >
          <motion.span variants={rise} className="hero__eyebrow">
            <span className="hero__flame" aria-hidden="true" />
            Dubai · Delivery Only
          </motion.span>

          <motion.h1 variants={rise} className="hero__title">
            Lamb chops,<br />
            <em>done properly.</em>
          </motion.h1>

          <motion.p variants={rise} className="hero__sub">
            secret marinade <span aria-hidden="true">·</span> open flame{' '}
            <span aria-hidden="true">·</span> delivered hot.
          </motion.p>

          <motion.div variants={rise} className="hero__actions">
            <a {...ORDER_LINK} className="btn btn-primary btn--magnetic">
              <span>Order Now</span>
              <span className="btn__icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
            <a href="#menu" className="btn btn-ghost">View the Menu</a>
          </motion.div>

          <motion.div variants={rise} className="hero__rule">
            <span className="display">“Chops Only. That’s the House Rule.”</span>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#story"
        className="hero__scroll"
        aria-label="Scroll to discover more"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
      >
        <span className="hero__scroll-label">Scroll</span>
        <span className="hero__scroll-track" aria-hidden="true">
          <span className="hero__scroll-dot" />
        </span>
      </motion.a>
    </section>
  );
}
