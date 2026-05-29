'use client';
import { motion } from 'framer-motion';
import { PILLARS } from '@/lib/data';

const icons = [
  // Premium Cuts — star
  <path key="0" d="M12 2l2.4 6.9H22l-5.8 4.2 2.2 7-6.4-4.6L5.6 20l2.2-7L2 8.9h7.6L12 2z" />,
  // 24-Hour Marinade — flame
  <path key="1" d="M12 22a8 8 0 0 0 8-8c0-4-3-7-5-10-1 3-3 3-3 6-2-1-2-3-2-5-2 2-3 5-3 8a8 8 0 0 0 8 9z" />,
  // Open Flame — torch
  <g key="2">
    <path d="M5 22h14M7 22V11a5 5 0 0 1 10 0v11" />
    <path d="M9 7c0-2 1.5-3 3-5 1.5 2 3 3 3 5" />
  </g>,
  // Delivery-First — truck
  <g key="3">
    <rect x="3" y="8" width="13" height="10" rx="2" />
    <path d="M16 11h3l2 3v4h-5" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </g>,
];

export default function Pillars() {
  return (
    <section className="pillars">
      <div className="container">
        <div className="pillars__head">
          <span className="eyebrow">Why House of Chops</span>
          <h2>Obsessed with the chop.</h2>
          <p>One product. Engineered four ways.</p>
        </div>
        <div className="pillars__grid">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              className="pillar"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pillar__icon" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
        .pillars { padding: 72px 0; }
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
