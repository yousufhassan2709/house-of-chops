'use client';
import { useState, useEffect, useRef } from 'react';
import { SITE } from '@/lib/data';
import OrderCta from './OrderCta';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Desktop: the three section links live behind one control instead of
  // sitting across the bar. Mobile keeps the full-height sheet.
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!navOpen) return;
    const away = (e) => { if (!navRef.current?.contains(e.target)) setNavOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [navOpen]);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label="House of Chops home">
          <img src="/images/logo.png" alt="" width="72" height="72" className="chop-kick" />
          <span className="nav__wordmark display">House of Chops</span>
        </a>

        <div className="nav__nav" ref={navRef}>
          <button
            type="button"
            className={`nav__trigger ${navOpen ? 'nav__trigger--open' : ''}`}
            aria-haspopup="menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            Explore
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 3.5L5 6.5L8 3.5" />
            </svg>
          </button>
          <nav className={`nav__drop ${navOpen ? 'nav__drop--open' : ''}`} aria-label="Primary">
            <a href="#menu" onClick={() => setNavOpen(false)}>Menu</a>
            <a href="#story" onClick={() => setNavOpen(false)}>Story</a>
            <a href="#contact" onClick={() => setNavOpen(false)}>Contact</a>
          </nav>
        </div>

        <div className="nav__end">
          <OrderCta className="btn btn-primary nav__cta">
            Order Now
          </OrderCta>

          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="nav__ig"
            aria-label={`Follow House of Chops on Instagram (${SITE.instagramHandle})`}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </a>

          <button
            className="nav__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span style={{ transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
            <span style={{ opacity: open ? 0 : 1 }} />
            <span style={{ transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </div>

      <div className={`nav__sheet ${open ? 'nav__sheet--open' : ''}`} role="dialog" aria-modal="true">
        <a href="#menu" onClick={() => setOpen(false)}>Menu</a>
        <a href="#story" onClick={() => setOpen(false)}>Story</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        <OrderCta className="btn btn-primary" onClick={() => setOpen(false)}>
          Order Now
        </OrderCta>
      </div>

      <style jsx>{`
        /* The bar is lit rather than filled: a standing wash of Flame Gold
           across the top, and a single low-opacity highlight that drifts the
           full width of it on a slow loop. Both stay under 10% so the bar
           still reads as near-black — it should look like brushed metal
           catching light, not like a glowing strip. */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          padding: 10px 0;
          background:
            linear-gradient(180deg, rgba(200, 135, 58, 0.075), rgba(200, 135, 58, 0.02) 62%, rgba(200, 135, 58, 0) 100%),
            #020101;
          transition: padding 0.3s var(--ease), background 0.3s var(--ease);
        }
        .nav::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: linear-gradient(
            100deg,
            rgba(200, 135, 58, 0) 34%,
            rgba(200, 135, 58, 0.07) 44%,
            rgba(232, 190, 124, 0.11) 50%,
            rgba(200, 135, 58, 0.07) 56%,
            rgba(200, 135, 58, 0) 66%
          );
          background-size: 260% 100%;
          animation: navSweep 9s linear infinite;
        }
        @keyframes navSweep {
          0%   { background-position: 130% 0; }
          100% { background-position: -30% 0; }
        }
        /* The bottom edge is the same gold, brightest in the middle — it
           replaces the grey hairline and the drop shadow, which were two
           pieces of furniture doing one job. */
        .nav::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1px;
          pointer-events: none;
          opacity: 0;
          background: linear-gradient(90deg,
            rgba(200, 135, 58, 0) 0%,
            rgba(200, 135, 58, 0.55) 50%,
            rgba(200, 135, 58, 0) 100%);
          transition: opacity 0.35s var(--ease);
        }
        .nav--scrolled::after { opacity: 1; }
        .nav--scrolled { padding: 6px 0; }
        .nav__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .nav__brand {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 46px;
        }
        .nav__brand img {
          width: 46px;
          height: 46px;
          object-fit: contain;
          filter: drop-shadow(0 4px 14px rgba(200, 135, 58, 0.35));
        }
        .nav__wordmark {
          font-size: 0.98rem;
          letter-spacing: 0.16em;
          color: var(--color-foreground);
          text-transform: uppercase;
          white-space: nowrap;
        }
        /* On the narrowest phones the mark alone carries the brand — the
           wordmark was what made the bar feel crowded. */
        @media (max-width: 430px) {
          .nav__wordmark { display: none; }
        }

        /* One control instead of three links. The bar carries the brand, a
           way in, and the order button — nothing else earns the space. */
        .nav__nav { display: none; position: relative; }
        .nav__trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 0.95rem;
          color: var(--color-foreground-soft);
          transition: color 0.2s var(--ease), border-color 0.2s var(--ease), background 0.2s var(--ease);
        }
        .nav__trigger:hover { color: var(--color-accent); }
        .nav__trigger svg { opacity: 0.6; transition: transform 0.25s var(--ease); }
        .nav__trigger--open {
          color: var(--color-accent);
          border-color: rgba(200, 135, 58, 0.28);
          background: rgba(200, 135, 58, 0.06);
        }
        .nav__trigger--open svg { transform: rotate(180deg); }

        .nav__drop {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          min-width: 170px;
          display: flex;
          flex-direction: column;
          padding: 6px;
          border-radius: 14px;
          border: 1px solid rgba(200, 135, 58, 0.18);
          background: rgba(6, 4, 3, 0.97);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: 0 22px 46px -18px rgba(0, 0, 0, 0.9);
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.22s var(--ease), transform 0.22s var(--ease);
        }
        .nav__drop--open { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .nav__drop a {
          padding: 9px 14px;
          border-radius: 9px;
          font-size: 0.92rem;
          color: var(--color-foreground-soft);
          transition: color 0.18s var(--ease), background 0.18s var(--ease);
        }
        .nav__drop a:hover { color: var(--color-accent); background: rgba(200, 135, 58, 0.08); }

        .nav__end :global(.nav__cta) { display: none; }

        /* Right-side group: IG icon sits immediately next to the hamburger */
        .nav__end {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-right: -4px;
        }

        .nav__ig {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          color: var(--color-foreground);
          transition: color 0.2s var(--ease), background 0.2s var(--ease), transform 0.2s var(--ease);
        }
        .nav__ig:hover { color: var(--color-accent); background: rgba(200, 135, 58, 0.08); }
        .nav__ig:active { transform: scale(0.94); }
        .nav__ig:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }

        .nav__burger {
          width: 44px; height: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }
        .nav__burger span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--color-foreground);
          border-radius: 2px;
          transition: transform 0.25s var(--ease), opacity 0.2s var(--ease);
        }

        .nav__sheet {
          position: fixed;
          /* Sits directly under the slimmed bar (10px + 46px + 10px). */
          inset: 66px 0 0 0;
          background: rgba(0, 0, 0, 0.96);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 24px;
          padding: 48px 24px 40px;
          transform: translateY(-12px);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
        }
        .nav__sheet--open { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .nav__sheet a {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-foreground);
          padding: 8px 0;
        }
        .nav__sheet :global(.btn) {
          margin-top: 12px;
          font-family: var(--font-body);
          font-size: 0.98rem;
          letter-spacing: 0.02em;
          text-transform: none;
          width: 100%;
          max-width: 320px;
        }

        @media (min-width: 860px) {
          .nav__nav { display: block; }
          .nav__end :global(.nav__cta) { display: inline-flex; }
          .nav__burger { display: none; }
          .nav__sheet { display: none; }
        }
      `}</style>
    </header>
  );
}
