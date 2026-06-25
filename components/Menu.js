'use client';
import { motion } from 'framer-motion';
import { MENU, SITE } from '@/lib/data';

export default function Menu() {
  return (
    <section id="menu" className="menu">
      <div className="container">
        <div className="menu__head">
          <span className="eyebrow">The Menu</span>
          <h2>Pick your box.</h2>
          <p>Every box is fired to order and packed to travel. Fries and two dipping sauces included.</p>
        </div>

        <div className="menu__grid">
          {MENU.map((item, i) => (
            <motion.article
              key={item.name}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="card__media"
                role="img"
                aria-label={`${item.name} — ${item.subtitle}`}
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {item.tag && <span className="card__tag display">{item.tag}</span>}
              </div>
              <div className="card__body">
                <span className="card__subtitle eyebrow">{item.subtitle}</span>
                <h3 className="card__title">{item.name}</h3>
                <p className="card__desc">{item.desc}</p>
                <div className="card__foot">
                  <span className="card__price display">{item.price}</span>
                  <a
                    href={SITE.orderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost card__cta"
                    aria-label={`Order the ${item.name} on WhatsApp`}
                  >
                    Order
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="menu__note">All prices inclusive of VAT. Fries + 2 sauces included with every box.</p>

        <div className="menu__cta">
          <a href={SITE.orderUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Order Now
          </a>
        </div>
      </div>

      <style jsx>{`
        .menu { padding: 72px 0; }
        .menu__head {
          text-align: center;
          max-width: 36rem;
          margin: 0 auto 40px;
        }
        .menu__head h2 {
          font-size: clamp(2rem, 5.5vw, 2.8rem);
          margin: 14px 0 12px;
        }
        .menu__head p {
          color: var(--color-muted);
          font-size: 1rem;
        }

        .menu__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: transform 0.35s var(--ease), border-color 0.35s var(--ease);
          display: flex;
          flex-direction: column;
        }
        .card:hover { transform: translateY(-4px); border-color: var(--color-accent); }

        .card__media {
          position: relative;
          aspect-ratio: 4 / 3;
          background-color: #0d0a07;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
        .card__tag {
          position: absolute; top: 14px; left: 14px;
          padding: 6px 12px;
          border-radius: 999px;
          background: var(--color-accent);
          color: #1A1206;
          font-size: 0.78rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .card__body {
          padding: 22px 22px 26px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .card__subtitle {
          font-size: 0.82rem;
          letter-spacing: 0.2em;
        }
        .card__title {
          font-family: var(--font-serif);
          font-size: 1.7rem;
          line-height: 1.1;
          margin: 2px 0 4px;
        }
        .card__desc {
          color: var(--color-muted);
          font-size: 0.96rem;
          line-height: 1.65;
        }
        .card__foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-top: 14px;
          padding-top: 18px;
          border-top: 1px solid var(--color-border-soft);
        }
        .card__price {
          font-size: 1.8rem;
          color: var(--color-accent);
          letter-spacing: 0.04em;
        }
        .card__cta {
          min-height: 44px;
          padding: 10px 20px;
          font-size: 0.88rem;
        }

        .menu__note {
          text-align: center;
          color: var(--color-muted);
          font-size: 0.85rem;
          margin: 28px 0 24px;
        }

        .menu__cta { text-align: center; }

        @media (min-width: 760px) {
          .menu { padding: 96px 0; }
          .menu__grid { grid-template-columns: repeat(2, 1fr); gap: 22px; }
          .card__media { aspect-ratio: 4 / 3; }
        }
        @media (min-width: 1024px) {
          .menu { padding: 120px 0; }
        }
      `}</style>
    </section>
  );
}
