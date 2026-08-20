# Nearest-Branch Order Popup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clicking any "Order Now" CTA opens a popup that detects the customer's nearest branch (Al Safa or Ibn Battuta) via browser geolocation and links to that branch's Deliveroo page, with a manual picker as the always-available fallback.

**Architecture:** Branch data lives in `lib/data.js` (single source of truth); pure distance/sorting helpers go in `lib/location.js` (already home to location helpers, fully unit-tested with Vitest). A `BranchPickerProvider` (context + modal) mounts once in `app/layout.js`; a small `OrderCta` client component replaces the seven `<a {...ORDER_LINK}>` anchors and opens the modal via context. The `ORDERING_ENABLED` flag still short-circuits everything back to a plain `/order` link.

**Tech Stack:** Next.js (App Router, JS), React context, styled-jsx (site convention), Vitest (`npm test` runs `vitest run`).

**Spec:** `docs/superpowers/specs/2026-08-20-nearest-branch-order-popup-design.md`

---

## Codebase orientation (read once before starting)

- `lib/data.js` — brand copy/links. Currently exports `ORDERING_ENABLED` (false), `DELIVEROO_URL`, and `ORDER_LINK` (spread onto anchors). `DELIVEROO_URL`/`ORDER_LINK` are removed at the end of this plan.
- `ORDER_LINK` usage sites (all become `OrderCta`): `components/Navbar.js` (desktop CTA line ~36, mobile sheet CTA line ~72), `components/Hero.js` (~54), `components/Contact.js` (CTA panel ~21, footer link ~60), `components/Menu.js` (per-card ~40, bottom CTA ~58).
- `lib/location.js` — pure helpers, tested in `lib/location.test.js`. Follow that test file's style.
- Styling: components use `<style jsx>` blocks + global classes `.btn`, `.btn-primary`, `.btn-ghost` from `app/globals.css`. Buttons are globally reset (`button { border: none; background: none; ... }` at globals.css:77) so `.btn` classes work identically on `<button>` and `<a>`. The navbar is `z-index: 50` — the modal uses 100.
- Design tokens: `--color-surface`, `--color-surface-2`, `--color-border`, `--color-border-soft`, `--color-accent`, `--color-foreground`, `--color-foreground-soft`, `--color-muted`, `--radius`, `--radius-lg`, `--font-body`, `--font-display`, `--ease`.
- Run tests with `npm test` (vitest run). Lint: `npm run lint`. Build: `npm run build`.

---

### Task 1: Branch data in lib/data.js

**Files:**
- Modify: `lib/data.js`

- [ ] **Step 1: Add the BRANCHES export**

In `lib/data.js`, directly below the `DELIVEROO_URL` declaration, add:

```js
// One entry per physical branch. Order Now CTAs open a picker that sorts
// these by distance to the customer (see components/BranchPicker.js).
export const BRANCHES = [
  {
    id: 'al-safa',
    name: 'Al Safa',
    area: 'Al Safa 1',
    lat: 25.187,
    lng: 55.245,
    deliverooUrl:
      'https://deliveroo.ae/menu/dubai/al-safa-1/house-of-chops-al-safa?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share',
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    area: 'Ibn Battuta',
    lat: 25.044,
    lng: 55.118,
    deliverooUrl:
      'https://deliveroo.ae/menu/dubai/ibn-battuta/house-of-chops-ibn-batuta?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share',
  },
];
```

Leave `DELIVEROO_URL` and `ORDER_LINK` in place for now — they are removed in Task 5 after every consumer has migrated.

- [ ] **Step 2: Sanity-check nothing broke**

Run: `npm test`
Expected: all existing tests PASS (products + location suites).

- [ ] **Step 3: Commit**

```bash
git add lib/data.js
git commit -m "Add BRANCHES data for Al Safa and Ibn Battuta"
```

### Task 2: Distance helpers in lib/location.js (TDD)

**Files:**
- Modify: `lib/location.js`
- Test: `lib/location.test.js`

- [ ] **Step 1: Write the failing tests**

Append to `lib/location.test.js` (and add `distanceKm, branchesByDistance` to the existing import from `./location.js` at the top):

```js
describe('distanceKm', () => {
  it('is ~0 for identical points', () => {
    expect(distanceKm(25.2, 55.27, 25.2, 55.27)).toBeCloseTo(0, 5);
  });
  it('computes a plausible Al Safa → Ibn Battuta distance (~20 km)', () => {
    const d = distanceKm(25.187, 55.245, 25.044, 55.118);
    expect(d).toBeGreaterThan(15);
    expect(d).toBeLessThan(25);
  });
  it('is symmetric', () => {
    expect(distanceKm(25.1, 55.2, 25.3, 55.4)).toBeCloseTo(distanceKm(25.3, 55.4, 25.1, 55.2), 8);
  });
});

describe('branchesByDistance', () => {
  const branches = [
    { id: 'al-safa', lat: 25.187, lng: 55.245 },
    { id: 'ibn-battuta', lat: 25.044, lng: 55.118 },
  ];

  it('sorts nearest-first and annotates distanceKm', () => {
    // Customer near Ibn Battuta Mall.
    const sorted = branchesByDistance(branches, 25.05, 55.12);
    expect(sorted.map((b) => b.id)).toEqual(['ibn-battuta', 'al-safa']);
    expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm);
  });
  it('does not mutate the input array', () => {
    branchesByDistance(branches, 25.05, 55.12);
    expect(branches[0].id).toBe('al-safa');
    expect(branches[0].distanceKm).toBeUndefined();
  });
  it('returns branches unsorted and unannotated for invalid coords', () => {
    for (const [lat, lng] of [[NaN, 55], [0, 0], [91, 55], [25, 181]]) {
      const out = branchesByDistance(branches, lat, lng);
      expect(out.map((b) => b.id)).toEqual(['al-safa', 'ibn-battuta']);
      expect(out[0].distanceKm).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: new tests FAIL with `distanceKm is not a function` (or import error); existing tests still pass.

- [ ] **Step 3: Implement the helpers**

Append to `lib/location.js`:

```js
const EARTH_RADIUS_KM = 6371;
const toRad = (deg) => (deg * Math.PI) / 180;

// Straight-line (haversine) distance in km between two coordinates.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Returns a new array of branches sorted nearest-first, each annotated with
// distanceKm. When the customer coordinates are invalid, returns the branches
// in their original order without annotation — callers treat that as
// "detection unavailable".
export function branchesByDistance(branches, lat, lng) {
  if (!isValidCoord(lat, lng)) return branches;
  return branches
    .map((b) => ({ ...b, distanceKm: distanceKm(lat, lng, b.lat, b.lng) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/location.js lib/location.test.js
git commit -m "Add distanceKm and branchesByDistance helpers"
```

### Task 3: BranchPicker modal + provider

**Files:**
- Create: `components/BranchPicker.js`

This is a client-side UI component; there is no unit-test harness for components in this repo (Vitest is node-only here), so it is verified in the browser in Task 6. Keep the logic-free pattern: all sorting/validation lives in the tested `lib/location.js`.

- [ ] **Step 1: Create the component**

Create `components/BranchPicker.js` with exactly:

```js
'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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

  // Ask for location the moment the picker opens — never earlier. The cards
  // are clickable throughout; detection only re-orders and badges them.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    let cancelled = false;
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
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
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

        {locating && <p className="bp__hint">Finding your nearest branch…</p>}

        <div className="bp__list">
          {branches.map((b, i) => (
            <a
              key={b.id}
              className="bp__card"
              href={b.deliverooUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              <span className="bp__meta">
                <span className="bp__name">{b.name}</span>
                <span className="bp__area">{b.area} · Deliveroo</span>
              </span>
              {detected && i === 0 && (
                <span className="bp__badge">Nearest to you · {b.distanceKm.toFixed(1)} km</span>
              )}
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
        .bp__hint {
          color: var(--color-muted);
          font-size: 0.85rem;
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
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: no errors (warnings pre-existing elsewhere are fine).

- [ ] **Step 3: Commit**

```bash
git add components/BranchPicker.js
git commit -m "Add BranchPicker modal with nearest-branch detection"
```

### Task 4: OrderCta component

**Files:**
- Create: `components/OrderCta.js`

- [ ] **Step 1: Create the component**

Create `components/OrderCta.js` with exactly:

```js
'use client';
import { ORDERING_ENABLED } from '@/lib/data';
import { useBranchPicker } from './BranchPicker';

// Drop-in replacement for the old `<a {...ORDER_LINK}>` anchors. While
// ORDERING_ENABLED is false it opens the branch picker; when the in-house
// flow returns it becomes a plain /order link and the picker never appears.
export default function OrderCta({ className, children, onClick, ...rest }) {
  const openPicker = useBranchPicker();

  if (ORDERING_ENABLED) {
    return (
      <a href="/order" className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        if (onClick) onClick(e);
        openPicker();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
```

(`...rest` carries through `aria-label` from the Menu cards.)

- [ ] **Step 2: Verify it compiles**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/OrderCta.js
git commit -m "Add OrderCta component that opens the branch picker"
```

### Task 5: Wire provider into layout and migrate all seven CTAs

**Files:**
- Modify: `app/layout.js` (wrap children in provider)
- Modify: `components/Navbar.js` (2 CTAs)
- Modify: `components/Hero.js` (1 CTA)
- Modify: `components/Contact.js` (2 CTAs + footer button styling)
- Modify: `components/Menu.js` (2 CTAs)
- Modify: `lib/data.js` (remove now-unused exports)

- [ ] **Step 1: Mount the provider in app/layout.js**

Add the import and wrap the body contents:

```js
import './globals.css';
import { BranchPickerProvider } from '@/components/BranchPicker';
```

and change `RootLayout` to:

```js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BranchPickerProvider>{children}</BranchPickerProvider>
      </body>
    </html>
  );
}
```

(`BranchPickerProvider` is a client component; rendering it from the server layout is standard Next.js — `metadata`/`viewport` exports are unaffected.)

- [ ] **Step 2: Migrate Navbar.js**

Change the import line to:

```js
import { SITE } from '@/lib/data';
import OrderCta from './OrderCta';
```

Replace the desktop CTA (`<a {...ORDER_LINK} className="btn btn-primary nav__cta">Order Now</a>`) with:

```jsx
<OrderCta className="btn btn-primary nav__cta">
  Order Now
</OrderCta>
```

Replace the mobile-sheet CTA (`<a {...ORDER_LINK} className="btn btn-primary" onClick={() => setOpen(false)}>Order Now</a>`) with:

```jsx
<OrderCta className="btn btn-primary" onClick={() => setOpen(false)}>
  Order Now
</OrderCta>
```

Styled-jsx only styles elements rendered directly in the same file — `OrderCta`'s button is a child component, so the scoped `.nav__cta` / `.nav__sheet .btn` rules would stop matching. Fix by marking those selectors global. In the Navbar `<style jsx>` block change:

- `.nav__cta { display: none; }` → `:global(.nav__cta) { display: none; }`
- inside the `@media (min-width: 860px)` block, `.nav__cta { display: inline-flex; }` → `:global(.nav__cta) { display: inline-flex; }`
- `.nav__sheet .btn { ... }` → `.nav__sheet :global(.btn) { ... }` (keep the declarations unchanged)

- [ ] **Step 3: Migrate Hero.js**

`SITE` is not used anywhere in Hero.js (verified by grep), so replace the whole `@/lib/data` import line with `import OrderCta from './OrderCta';`. Replace:

```jsx
<a {...ORDER_LINK} className="btn btn-primary btn--magnetic">
```

with

```jsx
<OrderCta className="btn btn-primary btn--magnetic">
```

(closing tag `</a>` → `</OrderCta>`; the inner spans stay). Hero has no scoped styles targeting the CTA (`.btn` variants live in globals.css), so no style changes.

- [ ] **Step 4: Migrate Contact.js**

Change the import to `import { SITE } from '@/lib/data';` and add `import OrderCta from './OrderCta';`.

CTA panel: replace `<a {...ORDER_LINK} className="btn btn-primary">Order Now</a>` with:

```jsx
<OrderCta className="btn btn-primary">
  Order Now
</OrderCta>
```

Footer: replace `<a {...ORDER_LINK}>Order</a>` with:

```jsx
<OrderCta>Order</OrderCta>
```

The footer styles target `.footer__links a`; the button needs the same look. In the Contact `<style jsx>` block change:

- `.footer__links a { ... }` → `.footer__links a, .footer__links :global(button) { ... }` (keep declarations)
- `.footer__links a:hover { ... }` → `.footer__links a:hover, .footer__links :global(button):hover { ... }`

- [ ] **Step 5: Migrate Menu.js**

Change the import to `import { MENU } from '@/lib/data';` (`SITE` is unused in Menu.js — verified by grep) and add `import OrderCta from './OrderCta';`.

Card CTA: replace

```jsx
<a
  {...ORDER_LINK}
  className="btn btn-ghost card__cta"
  aria-label={`Order the ${item.name}`}
>
```

with

```jsx
<OrderCta
  className="btn btn-ghost card__cta"
  aria-label={`Order the ${item.name}`}
>
```

(closing `</a>` → `</OrderCta>`). Bottom CTA: replace `<a {...ORDER_LINK} className="btn btn-primary">Order Now</a>` with:

```jsx
<OrderCta className="btn btn-primary">
  Order Now
</OrderCta>
```

In the Menu `<style jsx>` block change `.card__cta { ... }` → `:global(.card__cta) { ... }` (keep declarations) so the sizing still reaches the button inside `OrderCta`.

- [ ] **Step 6: Remove dead exports from lib/data.js**

Delete the `DELIVEROO_URL` and `ORDER_LINK` exports and the comment about them (lines beginning "// Flip to true…" stays with `ORDERING_ENABLED`, but drop the sentence about "every Order Now CTA points at the Deliveroo listing" and the "// Spread onto any…" comment). The Al Safa URL now lives only in `BRANCHES`. Update the `ORDERING_ENABLED` comment to:

```js
// Flip to true to bring back the in-house ordering flow (/order links + page).
// While false, Order Now CTAs open the branch picker (Deliveroo links).
export const ORDERING_ENABLED = false;
```

Then confirm nothing still references the removed names:

Run: `grep -rn "ORDER_LINK\|DELIVEROO_URL" app components lib`
Expected: no output.

- [ ] **Step 7: Lint and build**

Run: `npm run lint && npm test && npm run build`
Expected: lint clean, all tests pass, build succeeds.

- [ ] **Step 8: Commit**

```bash
git add app/layout.js components/Navbar.js components/Hero.js components/Contact.js components/Menu.js lib/data.js
git commit -m "Route Order Now CTAs through the nearest-branch picker"
```

### Task 6: Browser verification

**Files:** none (verification only)

Use the in-app browser preview tools (never Bash) to run the dev server and verify. In Claude Code: `preview_start` with a `.claude/launch.json` entry (`runtimeExecutable: "npm"`, `runtimeArgs: ["run", "dev"]`, `port: 3000`).

- [ ] **Step 1: Location granted.** Open the site; click the hero "Order Now". The modal must appear with both branches immediately. Grant location (in a headless preview, use CDP sensor override or verify via the fallback state plus unit-tested sorting). With a location near Ibn Battuta (25.05, 55.12), the Ibn Battuta card must be first with a "Nearest to you · X.X km" badge.
- [ ] **Step 2: Location denied.** Deny the permission (or block it in site settings): the "Finding your nearest branch…" line must disappear and both cards remain, no badge, no error text.
- [ ] **Step 3: Links.** Each card links to the correct Deliveroo URL with `target="_blank"` — verify via `read_page` hrefs rather than actually visiting Deliveroo.
- [ ] **Step 4: Close behaviors.** X button, backdrop click, and Escape each close the modal; clicking inside the panel does not. Body scroll is locked while open and restored after close.
- [ ] **Step 5: All seven CTAs.** Navbar desktop CTA (≥860px viewport), navbar mobile sheet CTA (mobile viewport — sheet closes and modal opens), hero CTA, both Menu CTAs (card "Order" buttons and bottom "Order Now"), Contact panel CTA, and the footer "Order" button (must look like the neighboring footer links). Check mobile (375px) and desktop (1280px) layouts of the modal (bottom-sheet vs centered).
- [ ] **Step 6: Screenshot proof.** Capture the modal in its detected state (or fallback state if detection can't be simulated) and share with the user.

If any check fails, fix the source, re-run `npm run lint && npm test`, and re-verify before moving on. Commit any fixes with a message describing the actual fix.
