'use client';
import { motion } from 'framer-motion';
import { MENU } from '@/lib/data';
import OrderCta from './OrderCta';

export default function Menu() {
  return (
    <section id="menu" className="menu">
      <div className="container">
        <div className="menu__head">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">The Menu</span>
            <h2>Pick your box.</h2>
            <p>Every box is fired to order and packed to travel. Served with our chop dust fries or sweet potato.</p>
          </motion.div>
        </div>

        <div className="menu__grid">
          {MENU.map((item, i) => (
            <motion.article
              key={item.name}
              className="card"
              initial={{ opacity: 0, y: 34, scale: 0.955 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="card__media"
                role="img"
                aria-label={`${item.name} — ${item.subtitle}`}
                style={{ backgroundImage: `url(${item.image})` }}
              >
                {/* The glare crosses the photo as the card lands, and again on
                    hover. It is a single soft band on a diagonal — the light
                    moving over the picture, not a flash on top of it. */}
                <span className="card__shine" aria-hidden="true" />
                {item.tag && <span className="card__tag display">{item.tag}</span>}
              </div>
              <div className="card__body">
                <span className="card__subtitle eyebrow">{item.subtitle}</span>
                <h3 className="card__title">{item.name}</h3>
                <p className="card__desc">{item.desc}</p>
                <div className="card__foot">
                  <span className="card__price display gold-glare">{item.price}</span>
                  <OrderCta
                    className="btn btn-ghost card__cta"
                    aria-label={`Order the ${item.name}`}
                  >
                    Order
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </OrderCta>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <p className="menu__note">All prices inclusive of VAT. Chop dust fries or sweet potato with every box.</p>

        <div className="menu__cta">
          <OrderCta className="btn btn-primary">
            Order Now
          </OrderCta>
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
          transition: border-color 0.35s var(--ease);
          display: flex;
          flex-direction: column;
        }
        .card:hover { border-color: var(--color-accent); }

        .card__media {
          position: relative;
          aspect-ratio: 4 / 3;
          background-color: #0d0a07;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          overflow: hidden;
          transition: transform 0.6s var(--ease);
        }
        .card:hover .card__media { transform: scale(1.035); }

        /* Light moving across the photo, not a bar drawn on top of it.
           Three things make it read as light: it is blended into the picture
           with screen rather than laid over it, it is blurred wide enough to
           have no edge, and it carries the brand's gold rather than plain
           white — a white wipe on a dark food photo looks like a scanner. */
        .card__shine {
          position: absolute;
          top: -50%;
          left: 0;
          width: 62%;
          height: 200%;
          pointer-events: none;
          mix-blend-mode: screen;
          background: linear-gradient(
            100deg,
            rgba(200, 135, 58, 0) 0%,
            rgba(200, 135, 58, 0.06) 30%,
            rgba(232, 190, 124, 0.16) 45%,
            rgba(255, 243, 222, 0.22) 50%,
            rgba(232, 190, 124, 0.16) 55%,
            rgba(200, 135, 58, 0.06) 70%,
            rgba(200, 135, 58, 0) 100%
          );
          filter: blur(10px);
          rotate: 18deg;
        }
        /* Always moving, never hurrying: the sweep takes a third of the cycle
           and the band rests off-frame for the rest, so each photo catches the
           light every few seconds instead of strobing. The two cards are
           offset so the menu does not pulse in unison. */
        .card__shine {
          animation: cardGleam 11s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .menu__grid > :nth-child(even) .card__shine { animation-delay: -5.5s; }
        .card:hover .card__shine { animation-duration: 6s; }
        @keyframes cardGleam {
          0%   { transform: translateX(-170%); }
          32%  { transform: translateX(170%); }
          100% { transform: translateX(170%); }
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
        .card__foot :global(.card__cta) {
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
