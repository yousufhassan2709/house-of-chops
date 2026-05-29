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
          <img src="/images/logo.png" alt="" width="56" height="56" />
          <span className="nav__wordmark display">House of Chops</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#menu">Menu</a>
          <a href="#story">Story</a>
          <a href="#contact">Contact</a>
        </nav>

        <a
          href={SITE.talabatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary nav__cta"
        >
          Order Now
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
          transition: background 0.3s var(--ease), backdrop-filter 0.3s var(--ease), border-color 0.3s var(--ease);
          border-bottom: 1px solid transparent;
        }
        .nav--scrolled {
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom-color: var(--color-border-soft);
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
          min-height: 56px;
        }
        .nav__brand img {
          width: 52px;
          height: 52px;
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

        .nav__burger {
          width: 44px; height: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-right: -8px;
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
