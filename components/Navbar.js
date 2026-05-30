'use client';
import { useState, useEffect } from 'react';
import { SITE } from '@/lib/data';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label="House of Chops home">
          <img src="/images/logo.png" alt="" width="72" height="72" />
          <span className="nav__wordmark display">House of Chops</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#story">Story</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="nav__end">
          <a
            href={SITE.talabatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary nav__cta"
          >
            Order Now
          </a>

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
        <a
          href={SITE.talabatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          onClick={() => setOpen(false)}
        >
          Order on Talabat
        </a>
      </div>

      <style jsx>{`
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 50;
          padding: 14px 0;
          background: #020101;
          border-bottom: 1px solid transparent;
          transition: border-color 0.3s var(--ease), box-shadow 0.3s var(--ease);
        }
        .nav--scrolled {
          border-bottom-color: var(--color-border-soft);
          box-shadow: 0 12px 28px -16px rgba(0, 0, 0, 0.6);
        }
        .nav__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .nav__brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 64px;
        }
        .nav__brand img {
          width: 68px;
          height: 68px;
          object-fit: contain;
          filter: drop-shadow(0 4px 14px rgba(200, 135, 58, 0.35));
        }
        .nav__wordmark {
          font-size: 1.05rem;
          letter-spacing: 0.14em;
          color: var(--color-foreground);
          text-transform: uppercase;
        }

        .nav__links {
          display: none;
          gap: 32px;
        }
        .nav__links a {
          font-size: 0.95rem;
          color: var(--color-foreground-soft);
          transition: color 0.2s var(--ease);
        }
        .nav__links a:hover { color: var(--color-accent); }

        .nav__cta { display: none; }

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
          inset: 64px 0 0 0;
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
        .nav__sheet a.btn {
          margin-top: 12px;
          font-family: var(--font-body);
          font-size: 0.98rem;
          letter-spacing: 0.02em;
          text-transform: none;
          width: 100%;
          max-width: 320px;
        }

        @media (min-width: 860px) {
          .nav__links { display: flex; }
          .nav__cta { display: inline-flex; }
          .nav__burger { display: none; }
          .nav__sheet { display: none; }
        }
      `}</style>
    </header>
  );
}
