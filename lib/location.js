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
