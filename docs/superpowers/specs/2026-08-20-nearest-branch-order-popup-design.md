# Nearest-Branch Order Popup — Design

**Date:** 2026-08-20
**Status:** Approved

## Problem

Every "Order Now" CTA on the site points at a single Deliveroo link (the Al Safa
branch). House of Chops now has two branches, each with its own Deliveroo menu
page. Customers should land on the branch nearest to them.

## Decision Summary

Clicking any Order Now CTA opens a popup listing both branches. The popup
requests browser geolocation in parallel; when granted, the nearest branch is
sorted to the top with a "Nearest to you" badge and distance. If location is
denied, unavailable, or slow, the popup is simply a manual two-branch picker.
No branch choice is remembered between visits (explicitly decided: no
localStorage / persistence). Location is requested only at click time, never on
page load.

## Branch Data

`lib/data.js` gains a `BRANCHES` array — the single source of truth:

| Branch | Area label | Coordinates (approx.) | Deliveroo URL |
|---|---|---|---|
| Al Safa | Al Safa 1 | 25.187, 55.245 | `https://deliveroo.ae/menu/dubai/al-safa-1/house-of-chops-al-safa?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share` |
| Ibn Battuta | Ibn Battuta | 25.044, 55.118 | `https://deliveroo.ae/menu/dubai/ibn-battuta/house-of-chops-ibn-batuta?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share` |

Each entry: `{ id, name, area, lat, lng, deliverooUrl }`.

## Components

### `lib/location.js` additions (pure, testable)

- `distanceKm(lat1, lng1, lat2, lng2)` — haversine straight-line distance.
- `branchesByDistance(branches, lat, lng)` — returns a new array of branches
  sorted nearest-first, each annotated with `distanceKm`. Validates the
  customer coordinates with the existing `isValidCoord`; returns the branches
  unsorted/unannotated when coordinates are invalid.

### `components/BranchPicker.js` (new, client)

Modal dialog. Behavior on open:

1. Immediately render both branches as tappable cards (name, area). Cards are
   clickable from the first frame — detection never blocks choosing.
2. In parallel, call `navigator.geolocation.getCurrentPosition` with a 6-second
   timeout. While pending, show a quiet "Finding your nearest branch…" line.
3. **Granted:** sort cards nearest-first; the top card gets a
   "Nearest to you · X.X km" badge.
4. **Denied / error / timeout / unsupported:** remove the pending line and show
   the plain picker. No error messaging beyond that.

Tapping a card opens that branch's Deliveroo URL in a new tab
(`noopener noreferrer`) and closes the modal. The modal closes via X button,
backdrop click, or Escape. Styling follows the site's existing design tokens
(`--color-surface-2`, `--color-border`, `--color-accent`, `--radius`) and the
styled-jsx pattern used by other components.

### `components/OrderCta.js` (new, client)

Replaces the `<a {...ORDER_LINK}>` pattern used in Navbar (×2), Hero,
Contact (×2), and Menu (×2). Accepts `className` and `children` so existing
markup and styling are unchanged.

- `ORDERING_ENABLED === false` (current state): renders a `<button>` that opens
  the shared BranchPicker.
- `ORDERING_ENABLED === true`: renders a plain `<a href="/order">` — the popup
  never appears, preserving the flag's one-place-to-change behavior.

The BranchPicker is mounted once in `app/layout.js`; OrderCta instances open it
through a small shared context provider.

## Error Handling

- Geolocation unsupported (`!navigator.geolocation`) → plain picker.
- Permission denied / position error / 6s timeout → plain picker.
- Invalid coordinates (guarded by `isValidCoord`) → plain picker.
- No geolocation result ever produces an error message to the customer; the
  fallback is always the manual picker.

## Testing

- Vitest unit tests for `distanceKm` and `branchesByDistance` (nearest-first
  ordering, invalid-coordinate fallback, distance annotation).
- Manual browser verification of the three popup states: location granted,
  location denied, geolocation unsupported; plus Esc/backdrop/X close and both
  outbound links.

## Out of Scope

- Remembering the customer's branch (explicitly declined).
- Detecting location on page load.
- Any change to the in-house `/order` flow or checkout.
