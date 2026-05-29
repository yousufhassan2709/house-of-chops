'use client';
import { motion } from 'framer-motion';
import { MENU, SITE } from '@/lib/data';

export default function Menu() {
  return (
    <section id="menu" className="menu">
      <div className="container">
        <div className="menu__head">
          <span className="eyebrow">The Menu</span>
          <h2>Pick your plate.</h2>
          <p>Every order is fired to order and packed to travel. Prices in AED.</p>
        </div>

        <div className="menu__grid">
          {MENU.map((item, i) => (
            <motion.article
              key={item.name}
              className="card glass"
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="card__media"
                role="img"
                aria-label={item.name}
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {item.tag && <span className="card__tag">{item.tag}</span>}
              </div>
              <div className="card__body">
                <div className="card__row">
                  <h3>{item.name}</h3>
                  <span className="card__price">{item.price}</span>
                </div>
                <p>{item.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="menu__cta">
          <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Order the full menu on Talabat
          </a>
        </div>
      </div>

      <style jsx>{`
        .menu { padding: 70px 0; }
        .menu__head { text-align: center; max-width: 36rem; margin: 0 auto 50px; }
        .menu__head h2 { font-size: clamp(2rem, 4.5vw, 3rem); margin: 14px 0 12px; }
        .menu__head p { color: var(--color-muted); }
        .menu__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .card { overflow: hidden; transition: transform 0.35s var(--ease), border-color 0.35s var(--ease); }
        .card:hover { transform: translateY(-6px); border-color: var(--color-accent); }
        .card__media {
          position: relative; aspect-ratio: 16/10;
          background-color: #100c08;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .card__tag {
          position: absolute; top: 16px; left: 16px; padding: 7px 14px; border-radius: 999px;
          background: var(--color-accent); color: #1A1206; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .card__body { padding: 24px 26px 28px; }
        .card__row { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
        .card__row h3 { font-size: 1.4rem; }
        .card__price { font-family: var(--font-display); font-size: 1.25rem; color: var(--color-accent); white-space: nowrap; }
        .card__body p { color: var(--color-muted); font-size: 0.95rem; margin-top: 10px; }
        .menu__cta { text-align: center; margin-top: 44px; }
        @media (max-width: 720px) { .menu__grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
