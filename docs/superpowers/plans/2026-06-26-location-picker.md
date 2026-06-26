# Map Pin Location Picker — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-text delivery address in the `/order` cart with a Google Maps search + draggable pin + structured detail fields, and store the exact coordinates so the kitchen/driver can navigate to the pin.

**Architecture:** A self-contained `components/LocationPicker.js` (client) wraps Google Maps (`@react-google-maps/api`) for search, a draggable pin, reverse-geocoding, and the detail fields, reporting the location up to the cart. Pure validation/compose logic lives in `lib/location.js` (unit-tested). The checkout route validates coordinates and composes a readable address server-side; the kitchen board gains an "Open in Google Maps" link.

**Tech Stack:** Next.js 14 (App Router, JS), `@react-google-maps/api`, Google Maps JavaScript + Places + Geocoding APIs, Supabase, vitest.

**Spec:** `docs/superpowers/specs/2026-06-26-location-picker-design.md`

---

## File structure

| File | Responsibility |
|------|----------------|
| `lib/location.js` | `isValidCoord`, `composeAddress`, `buildOrderLocation` — pure, testable |
| `lib/location.test.js` | Unit tests for the above |
| `components/LocationPicker.js` | Map + search + draggable pin + detail fields (client) |
| `app/order/page.js` | Use `LocationPicker`; update cart state + Pay gating |
| `app/api/checkout/route.js` | Validate coords, compose address, store new fields |
| `components/KitchenBoard.js` | "Open in Google Maps" link per card |
| `app/globals.css` | Dark styling for the Places autocomplete dropdown |
| `supabase/orders_location.sql` | Migration adding `latitude`, `longitude`, `address_details` |

---

## Task 1: Dependency

**Files:** Modify `package.json`

- [ ] **Step 1: Install the maps wrapper**

Run:
```bash
cd ~/Desktop/house-of-chops
npm install @react-google-maps/api
```
Expected: added to `package.json` dependencies, no errors.

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @react-google-maps/api"
```

(The env var `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is already present in `.env.local`.)

---

## Task 2: Database migration

**Files:** Create `supabase/orders_location.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/orders_location.sql`:
```sql
-- Add delivery-location columns. Run once in the Supabase SQL editor.
alter table public.orders
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists address_details jsonb;
```

- [ ] **Step 2: Owner runs it**

Owner action: Supabase → SQL Editor → paste `supabase/orders_location.sql` → Run. Confirm the three new columns appear on the `orders` table.

- [ ] **Step 3: Commit**

```bash
git add supabase/orders_location.sql
git commit -m "feat: orders location columns migration"
```

---

## Task 3: Location logic (TDD)

**Files:** Create `lib/location.js`; Test `lib/location.test.js`

- [ ] **Step 1: Write the failing tests**

Create `lib/location.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { isValidCoord, composeAddress, buildOrderLocation } from './location.js';

describe('isValidCoord', () => {
  it('accepts a real Dubai coordinate', () => {
    expect(isValidCoord(25.2048, 55.2708)).toBe(true);
  });
  it('rejects non-numbers and out-of-range', () => {
    expect(isValidCoord(NaN, 55)).toBe(false);
    expect(isValidCoord(91, 55)).toBe(false);
    expect(isValidCoord(25, 181)).toBe(false);
  });
  it('rejects the null island (0,0)', () => {
    expect(isValidCoord(0, 0)).toBe(false);
  });
});

describe('composeAddress', () => {
  it('joins present parts with a separator and skips empties', () => {
    expect(composeAddress({ formattedAddress: 'Arjan, Dubai', villa: '12', building: '', floor: '3', directions: 'gate code 1' }))
      .toBe('Arjan, Dubai · Villa/Apt 12 · Floor 3 · gate code 1');
  });
  it('returns empty string for no parts', () => {
    expect(composeAddress({})).toBe('');
  });
});

describe('buildOrderLocation', () => {
  it('builds location from a valid pin', () => {
    const r = buildOrderLocation({ lat: 25.1, lng: 55.2, formattedAddress: 'Arjan', villa: '7' });
    expect(r.latitude).toBe(25.1);
    expect(r.longitude).toBe(55.2);
    expect(r.address_details).toMatchObject({ villa: '7', formattedAddress: 'Arjan' });
    expect(r.customer_address).toContain('Villa/Apt 7');
  });
  it('allows fallback with a typed address and no pin', () => {
    const r = buildOrderLocation({ formattedAddress: 'Somewhere in Dubai', villa: '9' });
    expect(r.latitude).toBeNull();
    expect(r.longitude).toBeNull();
    expect(r.customer_address).toContain('Somewhere in Dubai');
  });
  it('throws when there is neither a pin nor an address', () => {
    expect(() => buildOrderLocation({ villa: '7' })).toThrow();
  });
  it('throws when villa/apartment is missing', () => {
    expect(() => buildOrderLocation({ lat: 25.1, lng: 55.2 })).toThrow();
  });
  it('ignores an invalid pin but keeps a typed address', () => {
    const r = buildOrderLocation({ lat: 0, lng: 0, formattedAddress: 'Arjan', villa: '7' });
    expect(r.latitude).toBeNull();
    expect(r.customer_address).toContain('Arjan');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `./location.js`.

- [ ] **Step 3: Implement**

Create `lib/location.js`:
```js
// Pure delivery-location helpers: coordinate validation + address composition.
// No secrets; safe to import on client or server.

export function isValidCoord(lat, lng) {
  return (
    Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

// parts: { formattedAddress, villa, building, floor, directions }
export function composeAddress(parts = {}) {
  const segs = [];
  if (parts.formattedAddress) segs.push(String(parts.formattedAddress).trim());
  if (parts.villa) segs.push(`Villa/Apt ${String(parts.villa).trim()}`);
  if (parts.building) segs.push(String(parts.building).trim());
  if (parts.floor) segs.push(`Floor ${String(parts.floor).trim()}`);
  if (parts.directions) segs.push(String(parts.directions).trim());
  return segs.filter(Boolean).join(' · ');
}

// customer: { lat, lng, formattedAddress, villa, building, floor, directions }
// Returns { latitude, longitude, address_details, customer_address } or throws a
// user-facing Error. The server is authoritative: it never trusts a prebuilt address string.
export function buildOrderLocation(customer = {}) {
  const lat = customer.lat == null ? null : Number(customer.lat);
  const lng = customer.lng == null ? null : Number(customer.lng);
  const hasPin = lat != null && lng != null && isValidCoord(lat, lng);

  const formattedAddress = String(customer.formattedAddress || '').trim();
  if (!hasPin && !formattedAddress) {
    throw new Error('Please set your delivery location on the map.');
  }

  const villa = String(customer.villa || '').trim();
  if (!villa) {
    throw new Error('Villa / apartment number is required.');
  }

  const details = {
    formattedAddress,
    villa,
    building: String(customer.building || '').trim(),
    floor: String(customer.floor || '').trim(),
    directions: String(customer.directions || '').trim(),
  };

  return {
    latitude: hasPin ? lat : null,
    longitude: hasPin ? lng : null,
    address_details: details,
    customer_address: composeAddress(details),
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test`
Expected: PASS — all location tests green (plus the existing products tests).

- [ ] **Step 5: Commit**

```bash
git add lib/location.js lib/location.test.js
git commit -m "feat: delivery location validation and address composition with tests"
```

---

## Task 4: LocationPicker component

**Files:** Create `components/LocationPicker.js`; Modify `app/globals.css`

- [ ] **Step 1: Create the component**

Create `components/LocationPicker.js`:
```jsx
'use client';
import { useRef, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';

const LIBRARIES = ['places'];
const DUBAI = { lat: 25.2048, lng: 55.2708 };

export default function LocationPicker({ value, onChange }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const mapRef = useRef(null);
  const autoRef = useRef(null);
  const geocoderRef = useRef(null);

  const hasPin = value.lat != null && value.lng != null;
  const center = hasPin ? { lat: value.lat, lng: value.lng } : DUBAI;
  const set = (patch) => onChange({ ...value, ...patch });

  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current && typeof window !== 'undefined' && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    if (!geocoderRef.current) { onChange({ ...value, lat, lng }); return; }
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        onChange({ ...value, lat, lng, formattedAddress: results[0].formatted_address });
      } else {
        onChange({ ...value, lat, lng });
      }
    });
  }, [value, onChange]);

  const onPlaceChanged = () => {
    const place = autoRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onChange({ ...value, lat, lng, formattedAddress: place.formatted_address || place.name || '' });
      if (mapRef.current) { mapRef.current.panTo({ lat, lng }); mapRef.current.setZoom(16); }
    }
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      reverseGeocode(lat, lng);
      if (mapRef.current) { mapRef.current.panTo({ lat, lng }); mapRef.current.setZoom(16); }
    });
  };

  const details = (
    <div className="fields">
      <input placeholder="Villa / Apartment no." value={value.villa || ''}
        onChange={(e) => set({ villa: e.target.value })} />
      <input placeholder="Building / Community name (optional)" value={value.building || ''}
        onChange={(e) => set({ building: e.target.value })} />
      <input placeholder="Floor (optional)" value={value.floor || ''}
        onChange={(e) => set({ floor: e.target.value })} />
      <textarea placeholder="Directions / notes for the driver (optional)" rows={2} value={value.directions || ''}
        onChange={(e) => set({ directions: e.target.value })} />
    </div>
  );

  if (loadError) {
    return (
      <div className="lp">
        <p className="lp__err">Map couldn’t load — type your address instead.</p>
        <textarea className="lp__fallback" placeholder="Delivery address" rows={3}
          value={value.formattedAddress || ''} onChange={(e) => set({ formattedAddress: e.target.value })} />
        {details}
        <style jsx>{styles}</style>
      </div>
    );
  }
  if (!isLoaded) {
    return <div className="lp"><p className="lp__loading">Loading map…</p><style jsx>{styles}</style></div>;
  }

  return (
    <div className="lp">
      <Autocomplete
        onLoad={(a) => (autoRef.current = a)}
        onPlaceChanged={onPlaceChanged}
        options={{ componentRestrictions: { country: 'ae' }, fields: ['geometry', 'formatted_address', 'name'] }}
      >
        <input className="lp__search" placeholder="Search your area, building or street" />
      </Autocomplete>

      <button type="button" className="lp__locate" onClick={locateMe}>📍 Use my current location</button>

      <div className="lp__map">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={hasPin ? 16 : 11}
          onLoad={(m) => (mapRef.current = m)}
          onClick={(e) => reverseGeocode(e.latLng.lat(), e.latLng.lng())}
          options={{ disableDefaultUI: true, zoomControl: true, clickableIcons: false }}
        >
          {hasPin && (
            <Marker
              position={center}
              draggable
              onDragEnd={(e) => reverseGeocode(e.latLng.lat(), e.latLng.lng())}
            />
          )}
        </GoogleMap>
      </div>

      <p className="lp__addr">
        {hasPin ? (value.formattedAddress || 'Pin dropped — drag it to fine-tune.')
                : 'Search above, tap the map, or use your location to drop a pin.'}
      </p>

      {details}
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .lp { display: flex; flex-direction: column; gap: 12px; }
  .lp__search { width: 100%; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
  .lp__search:focus { outline: none; border-color: var(--color-accent); }
  .lp__locate { align-self: flex-start; padding: 9px 14px; border-radius: var(--radius); border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-foreground-soft); font-size: 0.85rem; }
  .lp__locate:hover { border-color: var(--color-accent); }
  .lp__map { width: 100%; height: 260px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--color-border); }
  .lp__addr { color: var(--color-muted); font-size: 0.85rem; }
  .lp__loading, .lp__err { color: var(--color-muted); font-size: 0.9rem; }
  .lp__fallback { width: 100%; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
`;
```

- [ ] **Step 2: Style the Places dropdown (global, since it renders outside the component)**

Append to `app/globals.css`:
```css
/* Google Places autocomplete dropdown — match the dark theme */
.pac-container {
  background: #14100C;
  border: 1px solid rgba(200, 135, 58, 0.22);
  border-radius: 10px;
  margin-top: 4px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Jost', system-ui, sans-serif;
}
.pac-item { color: rgba(255, 255, 255, 0.85); border-top: 1px solid rgba(255,255,255,0.06); padding: 8px 12px; }
.pac-item:hover { background: rgba(200, 135, 58, 0.12); }
.pac-item-query { color: #fff; }
.pac-matched { color: #C8873A; }
.pac-logo::after { filter: invert(0.85); }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: success (the new component compiles). It's only rendered from `/order` after Task 5, but the build should pass now.

- [ ] **Step 4: Commit**

```bash
git add components/LocationPicker.js app/globals.css
git commit -m "feat: LocationPicker map component with search, draggable pin, details"
```

---

## Task 5: Wire LocationPicker into the cart

**Files:** Modify `app/order/page.js`

- [ ] **Step 1: Import the component**

In `app/order/page.js`, add this import below the existing `PRODUCTS` import:
```js
import LocationPicker from '@/components/LocationPicker';
```

- [ ] **Step 2: Expand the customer state**

Replace:
```js
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
```
with:
```js
  const [customer, setCustomer] = useState({
    name: '', phone: '',
    lat: null, lng: null, formattedAddress: '',
    villa: '', building: '', floor: '', directions: '',
  });
```

- [ ] **Step 3: Update the Pay-enabled condition**

Replace:
```js
  const filled = customer.name.trim() && customer.phone.trim() && customer.address.trim();
```
with:
```js
  const hasLocation = (customer.lat != null && customer.lng != null) || (customer.formattedAddress || '').trim();
  const filled = customer.name.trim() && customer.phone.trim() && hasLocation && (customer.villa || '').trim();
```

- [ ] **Step 4: Replace the address textarea with the picker**

Replace this block:
```jsx
              <div className="fields">
                <input placeholder="Full name" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                <input placeholder="Phone number" inputMode="tel" value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                <textarea placeholder="Delivery address" rows={3} value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
              </div>
```
with:
```jsx
              <div className="fields">
                <input placeholder="Full name" value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
                <input placeholder="Phone number" inputMode="tel" value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
              </div>

              <LocationPicker value={customer} onChange={setCustomer} />
```

- [ ] **Step 5: Verify in the browser**

Run `npm run dev`, open `http://localhost:3000/order`, add a box. Confirm: the map renders, searching an area drops a pin, dragging the pin updates the address line, "Use my current location" works, and Pay stays disabled until name + phone + a pin (or typed address) + villa are filled. Reload — values persist.

- [ ] **Step 6: Commit**

```bash
git add app/order/page.js
git commit -m "feat: use LocationPicker in checkout cart"
```

---

## Task 6: Store location on checkout

**Files:** Modify `app/api/checkout/route.js`

- [ ] **Step 1: Import the builder**

Add near the top imports of `app/api/checkout/route.js`:
```js
import { buildOrderLocation } from '@/lib/location';
```

- [ ] **Step 2: Replace name/phone/address validation with name/phone + location**

Replace:
```js
    const customer = body?.customer || {};
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    const address = String(customer.address || '').trim();
    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Name, phone, and address are all required.' }, { status: 400 });
    }
```
with:
```js
    const customer = body?.customer || {};
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }
    // Validates coordinates and composes a readable address server-side (throws on bad input).
    const location = buildOrderLocation(customer);
```

- [ ] **Step 3: Store the new fields in the insert**

Replace the insert object's address/identity fields. Change:
```js
    const { error } = await supabase.from('orders').insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      items: order.lineItems,
```
to:
```js
    const { error } = await supabase.from('orders').insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: location.customer_address,
      latitude: location.latitude,
      longitude: location.longitude,
      address_details: location.address_details,
      items: order.lineItems,
```

- [ ] **Step 4: Verify it compiles**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add app/api/checkout/route.js
git commit -m "feat: validate and store delivery location at checkout"
```

---

## Task 7: Kitchen "Open in Google Maps" link

**Files:** Modify `components/KitchenBoard.js`

- [ ] **Step 1: Add the maps link to each card**

In `components/KitchenBoard.js`, find the customer block:
```jsx
                <div className="card__cust">
                  <div>{o.customer_name}</div>
                  <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a>
                  <div className="card__addr">{o.customer_address}</div>
                </div>
```
Replace it with:
```jsx
                <div className="card__cust">
                  <div>{o.customer_name}</div>
                  <a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a>
                  <div className="card__addr">{o.customer_address}</div>
                  {o.latitude != null && o.longitude != null && (
                    <a className="card__maps" href={`https://www.google.com/maps?q=${o.latitude},${o.longitude}`}
                      target="_blank" rel="noopener noreferrer">📍 Open in Google Maps</a>
                  )}
                </div>
```

- [ ] **Step 2: Style the maps link**

In the same file's `<style jsx>` block, add after the `.card__addr` rule:
```css
        .card__maps { display: inline-block; margin-top: 6px; color: var(--color-accent); font-weight: 600; font-size: 0.82rem; }
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add components/KitchenBoard.js
git commit -m "feat: kitchen card links to the delivery pin in Google Maps"
```

---

## Task 8: Vercel env + end-to-end test

**Files:** none (config + verification)

- [ ] **Step 1: Add the key to Vercel**

Owner action: Vercel → Settings → Environment Variables → add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (the same value as `.env.local`) for Production + Preview.

- [ ] **Step 2: End-to-end test (Ziina test mode)**

With `npm run dev`:
1. `/order` → add a box → fill name/phone → search an area, drop/drag the pin, fill villa + optional fields → Pay.
2. Complete the Ziina **test** payment.
3. In Supabase, confirm the order row has `latitude`, `longitude`, an `address_details` JSON, and a composed `customer_address`.
4. On `/kitchen`, confirm the card shows the address and an **"Open in Google Maps"** link that opens the dropped pin.

- [ ] **Step 3: Verify the fallback**

Temporarily break the key (e.g. rename the env var) and reload `/order` — confirm the picker shows the plain-text address fallback and you can still complete an order. Restore the key afterward.

---

## Self-review notes

- **Spec coverage:** search + pin + locate (T4/T5), detail fields (T4), lat/lng + address_details storage (T2/T6), server-composed `customer_address` + coord validation (T3/T6), kitchen maps link (T7), Maps-load fallback + relaxed gating (T4/T5/T3), env var + Vercel (T1/T8), no geofencing (nothing added), unit tests for pure logic (T3). All spec sections map to a task.
- **Type consistency:** the `customer`/location object shape `{ lat, lng, formattedAddress, villa, building, floor, directions }` is identical across `LocationPicker`, `app/order/page.js`, and `buildOrderLocation`. `buildOrderLocation` returns `{ latitude, longitude, address_details, customer_address }`, matching the checkout insert and the `orders` columns.
- **No placeholders:** every code step contains complete code.
