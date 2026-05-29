'use client';
import { motion } from 'framer-motion';

export default function Story() {
  return (
    <section id="story" className="story">
      <div className="container story__inner">
        <motion.div
          className="story__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="story__photo"
            role="img"
            aria-label="Premium lamb chop racks ready for the flame"
            style={{ backgroundImage: "url('/images/story.jpg')" }}
          />
        </motion.div>

        <motion.div
          className="story__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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

      <style jsx>{`
        .story { padding: 72px 0; }
        .story__inner {
          display: flex;
          flex-direction: column;
          gap: 36px;
          align-items: center;
        }
        .story__visual {
          width: 100%;
          max-width: 520px;
          position: relative;
          aspect-ratio: 4 / 5;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--color-border);
        }
        .story__photo {
          position: absolute;
          inset: 0;
          background-color: #0d0a07;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .story__copy {
          width: 100%;
          max-width: 560px;
          text-align: center;
        }
        .story__copy h2 {
          font-size: clamp(2rem, 5vw, 2.8rem);
          margin: 14px 0 18px;
        }
        .story__copy p {
          color: var(--color-muted);
          line-height: 1.75;
          margin-bottom: 14px;
        }
        .story__rule {
          color: var(--color-foreground-soft) !important;
          font-style: italic;
          font-family: var(--font-serif);
          font-size: 1.06rem;
          padding: 14px 18px;
          border-left: 2px solid var(--color-accent);
          margin: 22px 0 4px;
          text-align: left;
        }
        .story__stats {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-top: 32px;
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

        @media (min-width: 860px) {
          .story { padding: 96px 0; }
          .story__inner {
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 56px;
          }
          .story__visual { flex: 0 0 44%; max-width: 480px; }
          .story__copy { text-align: left; flex: 1; max-width: none; }
          .story__rule { margin-left: 0; }
        }
        @media (min-width: 1024px) {
          .story { padding: 120px 0; }
          .story__inner { gap: 72px; }
        }
      `}</style>
    </section>
  );
}
