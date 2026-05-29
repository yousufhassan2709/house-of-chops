'use client';
import { motion } from 'framer-motion';

export default function Story() {
  return (
    <section id="story" className="story">
      <div className="container">
        <motion.div
          className="story__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow">The Concept</span>
          <h2>One thing. Done relentlessly well.</h2>
          <p>
            House of Chops is a delivery-only premium lamb chop brand, operating exclusively
            on Talabat. We serve bold, fire-grilled lamb chops in signature black packaging
            — designed to stand out on the app and on the doorstep.
          </p>
          <p className="story__rule">No dine-in. No distractions. Just one product, done perfectly.</p>

          <div className="story__stats">
            <div><strong className="display">24h</strong><span>marinade</span></div>
            <div><strong className="display">100%</strong><span>premium cuts</span></div>
            <div><strong className="display">1</strong><span>obsession</span></div>
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        .story {
          padding: 88px 0;
          text-align: center;
        }
        .story__copy {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }
        .story__copy h2 {
          font-size: clamp(2rem, 5vw, 2.8rem);
          margin: 18px 0 22px;
          text-align: center;
        }
        .story__copy > p {
          color: var(--color-muted);
          line-height: 1.75;
          margin-bottom: 18px;
          text-align: center;
        }
        .story__rule {
          color: var(--color-foreground-soft) !important;
          font-style: italic;
          font-family: var(--font-serif);
          font-size: 1.1rem;
          padding: 20px 24px;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          margin: 32px auto !important;
          max-width: 28rem;
          text-align: center !important;
        }
        .story__stats {
          display: flex;
          justify-content: center;
          gap: 36px;
          margin-top: 36px;
          flex-wrap: wrap;
        }
        .story__stats > div {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .story__stats strong {
          font-size: 2.2rem;
          color: var(--color-accent);
          line-height: 1;
        }
        .story__stats span {
          font-size: 0.74rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-top: 8px;
        }
        @media (min-width: 1024px) {
          .story { padding: 120px 0; }
        }
      `}</style>
    </section>
  );
}
