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
