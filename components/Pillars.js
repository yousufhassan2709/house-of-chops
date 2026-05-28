'use client';
import { motion } from 'framer-motion';
import { PILLARS } from '@/lib/data';

const icons = [
  <path key="0" d="M12 2l2.4 6.9H22l-5.8 4.2 2.2 7-6.4-4.6L5.6 20l2.2-7L2 8.9h7.6L12 2z" />,
  <path key="1" d="M12 22a8 8 0 0 0 8-8c0-4-3-7-5-10-1 3-3 3-3 6-2-1-2-3-2-5-2 2-3 5-3 8a8 8 0 0 0 8 9z" />,
  <g key="2"><path d="M5 22h14M7 22V11a5 5 0 0 1 10 0v11" /><path d="M9 7c0-2 1.5-3 3-5 1.5 2 3 3 3 5" /></g>,
  <g key="3"><rect x="3" y="8" width="13" height="10" rx="2" /><path d="M16 11h3l2 3v4h-5" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></g>,
];

export default function Pillars() {
  return (
    <section className="pillars container">
      <div className="pillars__head">
        <span className="eyebrow">Why House of Chops</span>
        <h2>Obsessed with the chop.</h2>
      </div>
      <div className="pillars__grid">
        {PILLARS.map((p, i) => (
          <motion.div
            key={p.title}
            className="pillar glass"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icons[i]}
            </svg>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .pillars { padding: 70px 24px; }
        .pillars__head { margin-bottom: 44px; }
        .pillars__head h2 { font-size: clamp(2rem, 4.5vw, 3rem); margin-top: 14px; }
        .pillars__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .pillar { padding: 30px 26px; transition: transform 0.3s var(--ease), border-color 0.3s var(--ease); }
        .pillar:hover { transform: translateY(-6px); border-color: var(--color-accent); }
        .pillar h3 { font-size: 1.25rem; margin: 18px 0 10px; }
        .pillar p { color: var(--color-muted); font-size: 0.95rem; }
        @media (max-width: 980px) { .pillars__grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .pillars__grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
