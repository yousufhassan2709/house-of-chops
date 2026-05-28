'use client';
import { useState, useEffect } from 'react';
import { SITE } from '@/lib/data';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#menu', label: 'Menu' },
    { href: '#story', label: 'Our Story' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand" aria-label="House of Chops home">
          <span className="nav__mark">H<span>o</span>C</span>
          <span className="nav__name">House of Chops</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary nav__cta">
          Order on Talabat
        </a>

        <button
          className="nav__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>

      {open && (
        <div className="nav__mobile glass">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href={SITE.talabatUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" onClick={() => setOpen(false)}>
            Order on Talabat
          </a>
        </div>
      )}

      <style jsx>{`
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 0; transition: all 0.4s var(--ease);
        }
        .nav--scrolled {
          padding: 10px 0;
          background: rgba(12,10,9,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--color-border);
        }
        .nav__inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .nav__brand { display: flex; align-items: center; gap: 12px; }
        .nav__mark {
          font-family: var(--font-display); font-weight: 700; font-size: 1.5rem;
          letter-spacing: -0.02em; color: var(--color-foreground);
        }
        .nav__mark span { color: var(--color-accent); }
        .nav__name {
          font-family: var(--font-display); font-size: 1.05rem; font-weight: 500;
          letter-spacing: 0.02em;
        }
        .nav__links { display: flex; gap: 34px; }
        .nav__links a {
          font-size: 0.92rem; letter-spacing: 0.04em; color: var(--color-muted);
          transition: color 0.25s var(--ease); position: relative;
        }
        .nav__links a:hover { color: var(--color-foreground); }
        .nav__links a::after {
          content: ''; position: absolute; left: 0; bottom: -6px; height: 1px; width: 0;
          background: var(--color-accent); transition: width 0.3s var(--ease);
        }
        .nav__links a:hover::after { width: 100%; }
        .nav__burger { display: none; flex-direction: column; gap: 5px; padding: 8px; }
        .nav__burger span { width: 24px; height: 2px; background: var(--color-foreground); border-radius: 2px; }
        .nav__mobile {
          display: none; flex-direction: column; gap: 18px; margin: 12px 16px 0;
          padding: 22px; animation: fade 0.3s var(--ease);
        }
        @keyframes fade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        @media (max-width: 860px) {
          .nav__links, .nav__cta { display: none; }
          .nav__burger { display: flex; }
          .nav__mobile { display: flex; }
        }
      `}</style>
    </header>
  );
}
