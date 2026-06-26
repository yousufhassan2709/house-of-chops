# House of Chops — Map Pin Location Picker at Checkout

**Date:** 2026-06-26
**Status:** Design approved, pending spec review

## Goal

Replace the free-text "Delivery address" box on the `/order` cart with a Google Maps
location picker: search an address, drop/drag a pin to the exact spot, and fill in
structured delivery details (villa/apartment, building/community, floor, directions).
Store the precise coordinates so the kitchen/driver can navigate straight to the pin.

**Not in scope:** delivery-zone restrictions / geofencing. We capture the location
everywhere and block nothing. That is a separate, later feature.

## Existing state

- `/order` cart (`app/order/page.js`) collects `customer = { name, phone, address }`,
  where `address` is a single textarea.
- `POST /api/checkout` reads `customer.{name,phone,address}`, requires all three, and
  stores `customer_address` (text) on the order.
- Kitchen board (`components/KitchenBoard.js`) shows `o.customer_address` as plain text.
- `orders` table has `customer_address text not null` and no location columns.

## Provider & libraries

- **Google Maps Platform**, browser key `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (already in
  `.env.local`). APIs required on the key's project: **Maps JavaScript API**, **Places API**,
  **Geocoding API**. Key locked with an HTTP-referrer restriction to `houseofchopsdxb.com`,
  `*.vercel.app`, and `localhost:3000`.
- Wrapper: **`@react-google-maps/api`** (one dependency) for `useLoadScript`, `GoogleMap`,
  `Marker`, and `Autocomplete`.
- The Maps key is public by design (Maps JS keys always ship to the browser); the
  referrer restriction is the protection. It is a separate key from the server secrets.

## UX flow (in the cart)

The `address` textarea is replaced by a **Location** block:

1. **Search** — a Places `Autocomplete` input restricted to `country: 'ae'`. Selecting a
   result recenters the map (zoom ~16) and drops the pin at the result's geometry.
2. **Map + draggable pin** — a `GoogleMap` (default center Dubai `25.2048, 55.2708`,
   zoom 11) with a single draggable `Marker`. Dragging the pin (or a search selection, or
   the locate button) updates `lat`/`lng` and **reverse-geocodes** to fill a readable
   `formattedAddress` shown beneath the map (editable text).
3. **"Use my current location"** button — `navigator.geolocation.getCurrentPosition` →
   centers + drops the pin + reverse-geocodes. Gracefully no-ops if permission denied.
4. **Detail fields** — `villa` (Villa / Apartment no.), `building` (Building / Community),
   `floor` (Floor), `directions` (Directions / notes for the driver).

The cart's `customer` state becomes:
`{ name, phone, lat, lng, formattedAddress, villa, building, floor, directions }`,
persisted to `localStorage` as before.

**Pay button enabled when:** `name`, `phone`, a pin (`lat` & `lng` set), and `villa` are
present. `building`, `floor`, `directions` are optional.

## Component structure

- **`components/LocationPicker.js`** (client, self-contained): owns the map, search,
  draggable pin, locate button, reverse-geocoding, and the four detail inputs. Props:
  `value` (the location object) and `onChange(next)`. It does not know about the cart or
  checkout — it only reports the current location upward. This keeps `app/order/page.js`
  focused on cart/checkout and the maps complexity isolated in one file.
- `app/order/page.js` renders `<LocationPicker value={customer} onChange={...} />` in place
  of the old textarea and updates the Pay-enabled condition.

## Data model changes

Add to `orders` (migration the owner runs in Supabase):

```sql
alter table public.orders
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists address_details jsonb;
```

- `latitude`, `longitude` — the pin coordinates.
- `address_details` — `{ formattedAddress, villa, building, floor, directions }` (jsonb,
  mirroring the existing `items` jsonb pattern).
- `customer_address` (existing text column) is still populated — composed **server-side**
  into one readable line so the kitchen keeps showing a normal address with no code change
  to how it reads `customer_address`.

## Checkout changes (`app/api/checkout/route.js`)

- Read the new `customer` fields. Validate: `name`, `phone`, `villa` non-empty; `lat`/`lng`
  are finite numbers in valid global range (`-90..90`, `-180..180`) and not exactly `0,0`.
  (No UAE geofence — honoring "no restrictions". This is only a "is it a real coordinate"
  sanity check.)
- Compose `customer_address` server-side, e.g.:
  `"<formattedAddress> · Villa/Apt <villa> · <building> · Floor <floor> · <directions>"`
  (skip empty parts).
- Insert `latitude`, `longitude`, and `address_details` alongside the existing fields.
- Everything else (Ziina intent, server-authoritative totals, pending order) is unchanged.

## Kitchen board changes (`components/KitchenBoard.js`)

- Keep showing `customer_address`.
- Add an **"Open in Google Maps"** link/button per card when `latitude`/`longitude` exist:
  `https://www.google.com/maps?q=<lat>,<lng>` (opens in a new tab → driver navigation).
- Show `address_details` extras (villa/floor/directions) if present.
- The kitchen orders API (`/api/kitchen/orders`) already returns `*`, so `latitude`,
  `longitude`, and `address_details` come through automatically — no API change needed.

## Environment variables

| Var | Where | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | browser | Google Maps JS + Places + Geocoding (referrer-restricted) |

Add to Vercel (Production + Preview) alongside the existing vars.

## Error handling

- If the Maps script fails to load (bad key, API not enabled, billing off), the picker
  shows a clear message and a **fallback plain-text address textarea** so checkout still
  works. This prevents a Maps misconfiguration from blocking all orders. **In fallback
  mode the Pay condition relaxes** to require the typed address text instead of a pin
  (lat/lng will be null); the server accepts a missing pin only when a non-empty
  `formattedAddress`/address text is provided, so an order always has either a pin or a
  written address.
- Reverse-geocoding failure leaves `formattedAddress` blank but keeps the pin coordinates;
  the customer can still type the address and proceed.
- Geolocation permission denied → silent no-op, pin stays where it was.

## Testing

- Unit-test the server-side address composition + coordinate validation (pure logic,
  vitest), mirroring the existing `lib/products.test.js` approach. Extract the compose +
  validate helpers into a testable module (e.g. `lib/location.js`).
- Manual: search an address, drag the pin, use current location, fill details, pay in
  Ziina test mode, confirm the order stores lat/lng + details and the kitchen card shows
  the "Open in Google Maps" link pointing at the dropped pin.

## Out of scope (YAGNI for v1)

- Delivery-zone restrictions / geofencing / "we don't deliver here" messaging.
- Saved addresses / multiple addresses per customer.
- Distance or delivery-fee-by-distance calculation.

## Build order

1. Add `@react-google-maps/api`; add the env var (done) + Vercel.
2. SQL migration for `latitude`, `longitude`, `address_details`.
3. `lib/location.js` (compose address + validate coords) with unit tests.
4. `components/LocationPicker.js`.
5. Wire it into `app/order/page.js` (replace textarea, update Pay gating, persist new fields).
6. Update `app/api/checkout/route.js` (validate, compose, store new fields).
7. Update `components/KitchenBoard.js` (maps link + extra details).
8. End-to-end test in Ziina test mode.
