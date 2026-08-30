'use client';
import { motion } from 'framer-motion';
import { PILLARS } from '@/lib/data';

/* Four marks drawn for this brand rather than picked off a sheet: the animal,
   the marinade, the fire and the box it travels in. A star, a torch and a
   parcel van said "features section"; a lamb's face says whose features.
   Every one is stroked with the same travelling gold as the numbers. */
const icons = [
  // Premium Cuts — the lamb itself.
  <g key="0">
    <path d="M7.6 7.6a2.1 2.1 0 1 1 1.7-3.2 2.9 2.9 0 0 1 5.4 0 2.1 2.1 0 1 1 1.7 3.2" />
    <path d="M7.4 8.5c-1.3-1-3-.8-3.6 0M16.6 8.5c1.3-1 3-.8 3.6 0" />
    <path d="M12 7.9c2.9 0 4.7 1.9 4.7 4.6 0 3.1-2.1 5.6-4.7 5.6s-4.7-2.5-4.7-5.6c0-2.7 1.8-4.6 4.7-4.6z" />
    <path d="M10.3 12.5h.01M13.7 12.5h.01" />
    <path d="M10.7 15.3c.8.6 1.8.6 2.6 0" />
  </g>,
  // The Secret Marinade — the jar, lidded, with the marinade sitting in it.
  // The herb sprig this replaces turned to scribble at 26px; a liquid line
  // inside a sealed jar survives the size.
  <g key="1">
    <path d="M8.6 3.4h6.8a1.1 1.1 0 0 1 1.1 1.1v1.7H7.5V4.5a1.1 1.1 0 0 1 1.1-1.1z" />
    <path d="M7.6 6.2h8.8l-.6 12a2.2 2.2 0 0 1-2.2 2.1h-3.2a2.2 2.2 0 0 1-2.2-2.1l-.6-12z" />
    <path d="M8.2 13.2c1.3-1 2.5.6 3.8 0s2.5-1 3.8 0" />
  </g>,
  // Open Flame — the fire itself, over the bars. The chop-on-the-flame version
  // of this collapsed into a squiggle at 26px; a flame reads instantly.
  <g key="2">
    <path d="M12 21.2c3.2 0 5.6-2.3 5.6-5.2 0-3.7-3.7-5.2-4.7-9-1.7 1.8-2.8 3.3-2.8 5.1-1.2-.5-1.7-1.8-1.7-3.1-1.6 1.7-2.2 3.9-2.2 5.9 0 3.4 2.6 6.3 5.8 6.3z" />
    <path d="M12 18.6c1.2 0 2.1-.9 2.1-2 0-1.4-1.4-2.1-1.8-3.5-.9 1-1.5 1.9-1.5 3 0 1.4.7 2.5 1.2 2.5z" />
    <path d="M4.5 4.2h15M6.8 2.4v3.4M12 2.4v3.4M17.2 2.4v3.4" />
  </g>,
  // Delivery-First — the box, already moving. The bone stamped on the lid was
  // unreadable at this size; the speed lines say "first" instead.
  <g key="3">
    <path d="M8.4 10.2h11.4l-1 8.3a2 2 0 0 1-2 1.7h-4.4a2 2 0 0 1-2-1.7l-2-8.3z" />
    <path d="M7.4 6.6h13.2v3.6H7.4z" />
    <path d="M5.4 12.2H2.6M4.6 15.4H1.8M5.8 18.6H3.6" />
  </g>,
];

export default function Pillars() {
  return (
    <section className="pillars">
      {/* The travelling gold the icons stroke themselves with. Declared once,
          drawn nowhere — SVG paint servers are referenced by id. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false" className="pillars__defs">
        <defs>
          <linearGradient id="chopGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#C8873A" />
            <stop offset="0.44" stopColor="#C8873A" />
            <stop offset="0.5" stopColor="#EBCB94" />
            <stop offset="0.56" stopColor="#C8873A" />
            <stop offset="1" stopColor="#C8873A" />
            <animateTransform attributeName="gradientTransform" type="translate"
              values="-1 0; 1 0; -1 0" dur="9s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
      </svg>
      <div className="container">
        <div className="pillars__head">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Why House of Chops</span>
            <h2>Obsessed with the chop.</h2>
            <p>One product. Engineered four ways.</p>
          </motion.div>
        </div>
        <div className="pillars__grid">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              className="pillar"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pillar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="url(#chopGold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {icons[i]}
                </svg>
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .pillars { padding: 72px 0; position: relative; }
        .pillars__defs { position: absolute; width: 0; height: 0; }
        .pillars__head {
          text-align: center;
          max-width: 36rem;
          margin: 0 auto 40px;
        }
        .pillars__head h2 {
          font-size: clamp(2rem, 5.5vw, 2.8rem);
          margin: 14px 0 12px;
        }
        .pillars__head p {
          color: var(--color-muted);
          font-size: 1rem;
        }
        .pillars__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        .pillar {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          padding: 24px 22px;
          text-align: left;
          transition: transform 0.3s var(--ease), border-color 0.3s var(--ease);
        }
        .pillar:hover { transform: translateY(-4px); border-color: var(--color-accent); }
        .pillar__icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: rgba(200, 135, 58, 0.08);
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .pillar h3 {
          font-family: var(--font-serif);
          font-size: 1.2rem;
          margin-bottom: 8px;
        }
        .pillar p {
          color: var(--color-muted);
          font-size: 0.94rem;
          line-height: 1.6;
        }

        @media (min-width: 640px) {
          .pillars { padding: 96px 0; }
          .pillars__grid { grid-template-columns: repeat(2, 1fr); gap: 18px; }
        }
        @media (min-width: 1024px) {
          .pillars { padding: 120px 0; }
          .pillars__grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
          .pillar { padding: 28px 24px; }
        }
      `}</style>
    </section>
  );
}
