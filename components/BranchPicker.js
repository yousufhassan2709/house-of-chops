'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { BRANCHES } from '@/lib/data';
import { branchesByDistance } from '@/lib/location';

// Order Now CTAs live in several components but share one modal, mounted once
// in the root layout. The context value is just "open the picker".
const BranchPickerContext = createContext(() => {});

export function useBranchPicker() {
  return useContext(BranchPickerContext);
}

export function BranchPickerProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openPicker = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  return (
    <BranchPickerContext.Provider value={openPicker}>
      {children}
      {open && <BranchPickerModal onClose={close} />}
    </BranchPickerContext.Provider>
  );
}

function BranchPickerModal({ onClose }) {
  const [branches, setBranches] = useState(BRANCHES);
  const [locating, setLocating] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    panelRef.current?.focus();
    return () => prev?.focus?.();
  }, []);

  // Ask for location the moment the picker opens — never earlier. The cards
  // are clickable throughout; detection only re-orders and badges them.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    let cancelled = false;
    // getCurrentPosition's own timeout only starts counting once the user
    // answers the permission prompt, so an ignored prompt would otherwise
    // leave the "locating" hint up forever — this wall-clock timer bounds it.
    const fallback = setTimeout(() => setLocating(false), 8000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setBranches(branchesByDistance(BRANCHES, pos.coords.latitude, pos.coords.longitude));
        setLocating(false);
      },
      () => {
        if (!cancelled) setLocating(false);
      },
      { timeout: 6000, maximumAge: 300000 },
    );
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Navbar's mobile sheet also writes body overflow but mounts/cleans up
    // before this modal does, so last-cleanup-wins works out — don't assume
    // that ordering is guaranteed if either component's lifecycle changes.
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const detected = branches[0]?.distanceKm != null;

  return (
    <div className="bp__backdrop" onClick={onClose}>
      <div
        className="bp"
        role="dialog"
        aria-modal="true"
        aria-label="Choose your branch"
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bp__head">
          <h3 className="bp__title display">Choose your branch</h3>
          <button type="button" className="bp__close" aria-label="Close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p className="bp__hint" aria-live="polite">{locating ? 'Finding your nearest branch…' : ''}</p>

        <div className="bp__list">
          {branches.map((b, i) => (
            <a
              key={b.id}
              className="bp__card"
              href={b.deliverooUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setTimeout(onClose, 0)}
            >
              <span className="bp__meta">
                <span className="bp__name">{b.name}</span>
                <span className="bp__area">{b.area} · Deliveroo</span>
                {detected && i === 0 && (
                  <span className="bp__badge">Nearest to you · {b.distanceKm.toFixed(1)} km</span>
                )}
              </span>
              <svg className="bp__arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </div>
      </div>
      <style jsx>{`
        .bp__backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 16px;
        }
        .bp {
          width: 100%;
          max-width: 420px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bp__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .bp__title {
          font-size: 1.15rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-foreground);
        }
        .bp__close {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: var(--color-foreground-soft);
          transition: color 0.2s var(--ease), background 0.2s var(--ease);
        }
        .bp__close:hover {
          color: var(--color-accent);
          background: rgba(200, 135, 58, 0.08);
        }
        .bp__close:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        .bp__hint {
          color: var(--color-muted);
          font-size: 0.85rem;
          min-height: 1.2em;
        }
        .bp__list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .bp__card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius);
          transition: border-color 0.2s var(--ease), transform 0.2s var(--ease);
        }
        .bp__card:hover {
          border-color: var(--color-accent);
          transform: translateY(-2px);
        }
        .bp__card:focus-visible {
          outline: 2px solid var(--color-accent);
          outline-offset: 2px;
        }
        .bp__meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex: 1;
          min-width: 0;
        }
        .bp__name {
          color: var(--color-foreground);
          font-weight: 600;
          font-size: 1.02rem;
        }
        .bp__area {
          color: var(--color-muted);
          font-size: 0.82rem;
        }
        .bp__badge {
          align-self: flex-start;
          margin-top: 5px;
          padding: 5px 10px;
          border-radius: 999px;
          background: var(--color-accent);
          color: #1a1206;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .bp__arrow {
          color: var(--color-foreground-soft);
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .bp__backdrop {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}
