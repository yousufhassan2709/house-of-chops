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

// Returns { lat, lng } when the customer has a usable pin, else null.
export function parsePin(customer = {}) {
  if (customer.lat == null || customer.lng == null) return null;
  const lat = Number(customer.lat);
  const lng = Number(customer.lng);
  return isValidCoord(lat, lng) ? { lat, lng } : null;
}

// True when the customer supplied either a valid map pin or a typed address.
// The client uses this to gate the Pay button; the server enforces the same
// rule in buildOrderLocation — keep them in sync by keeping them here.
export function hasDeliveryLocation(customer = {}) {
  return parsePin(customer) !== null || Boolean(String(customer.formattedAddress || '').trim());
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
  const pin = parsePin(customer);

  const formattedAddress = String(customer.formattedAddress || '').trim();
  if (!pin && !formattedAddress) {
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
    latitude: pin ? pin.lat : null,
    longitude: pin ? pin.lng : null,
    address_details: details,
    customer_address: composeAddress(details),
  };
}

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
// "detection unavailable". Branches whose own lat/lng are invalid are never
// annotated or sorted by distance (which would produce NaN); they're appended
// at the end, in their original relative order, so they stay pickable in the UI.
export function branchesByDistance(branches, lat, lng) {
  if (!isValidCoord(lat, lng)) return branches;
  const valid = [];
  const invalid = [];
  for (const b of branches) {
    if (isValidCoord(b.lat, b.lng)) valid.push(b);
    else invalid.push(b);
  }
  const sorted = valid
    .map((b) => ({ ...b, distanceKm: distanceKm(lat, lng, b.lat, b.lng) }))
    .sort((x, y) => x.distanceKm - y.distanceKm);
  return [...sorted, ...invalid];
}
