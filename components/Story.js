'use client';
import { motion } from 'framer-motion';

export default function Story() {
  return (
    <section id="story" className="story">
      <div className="container story__inner">
        <motion.div
          className="story__visual glass"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="story__photo" role="img" aria-label="Lamb chops over open flame">
            <span className="story__note">Drop story.jpg here</span>
          </div>
        </motion.div>

        <motion.div
          className="story__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">Our Story</span>
          <h2>One thing. Done relentlessly well.</h2>
          <p>
            House of Chops started with a simple belief: a lamb chop deserves obsession.
            Not a side on someone else&apos;s menu, but the main event.
          </p>
          <p>
            We trim, marinate and fire every rack with the same care a steakhouse gives a
            ribeye, then engineer the packaging so it lands at your door exactly the way it
            left the flame. No dining room, no distractions, just the best chops in Dubai,
            delivered.
          </p>
          <div className="story__stats">
            <div><strong>24h</strong><span>marinade</span></div>
            <div><strong>100%</strong><span>premium cuts</span></div>
            <div><strong>1</strong><span>obsession</span></div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .story { padding: 80px 0; }
        .story__inner { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center; }
        .story__visual { overflow: hidden; aspect-ratio: 1/1; }
        .story__photo {
          position: absolute; inset: 0;
          background:
            radial-gradient(110% 90% at 30% 80%, rgba(161,98,7,0.28), transparent 55%),
            linear-gradient(160deg, #241d13, #0d0a07);
          display: flex; align-items: center; justify-content: center;
        }
        .story__visual { position: relative; }
        .story__note { font-size: 0.78rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(245,241,234,0.3); }
        .story__copy h2 { font-size: clamp(2rem, 4.5vw, 3rem); margin: 16px 0 20px; }
        .story__copy p { color: var(--color-muted); margin-bottom: 16px; max-width: 34rem; line-height: 1.75; }
        .story__stats { display: flex; gap: 44px; margin-top: 32px; }
        .story__stats strong { display: block; font-family: var(--font-display); font-size: 2.2rem; color: var(--color-accent); line-height: 1; }
        .story__stats span { font-size: 0.78rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-muted); margin-top: 8px; display: block; }
        @media (max-width: 860px) {
          .story__inner { grid-template-columns: 1fr; gap: 40px; }
          .story__visual { max-width: 420px; width: 100%; }
        }
      `}</style>
    </section>
  );
}
