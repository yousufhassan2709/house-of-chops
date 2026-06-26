'use client';
import { useRef, useState, useCallback } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const DUBAI = { lat: 25.2048, lng: 55.2708 };

export default function LocationPicker({ value, onChange }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const hasPin = value.lat != null && value.lng != null;
  const center = hasPin ? { lat: value.lat, lng: value.lng } : DUBAI;
  // Functional updates so async callbacks always merge against the latest state
  // (never overwrite villa/floor/etc. typed while a geocode request is in flight).
  const set = (patch) => onChange((curr) => ({ ...curr, ...patch }));

  const getGeocoder = () => {
    if (!geocoderRef.current && typeof window !== 'undefined' && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
    return geocoderRef.current;
  };

  const dropPin = useCallback((lat, lng, formattedAddress) => {
    onChange((curr) => ({
      ...curr,
      lat,
      lng,
      formattedAddress: formattedAddress != null ? formattedAddress : curr.formattedAddress,
    }));
    if (mapRef.current) { mapRef.current.panTo({ lat, lng }); mapRef.current.setZoom(16); }
  }, [onChange]);

  const reverseGeocode = useCallback((lat, lng) => {
    const geocoder = getGeocoder();
    if (!geocoder) { dropPin(lat, lng); return; }
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const addr = status === 'OK' && results && results[0] ? results[0].formatted_address : null;
      dropPin(lat, lng, addr);
    });
  }, [dropPin]);

  const runSearch = (e) => {
    if (e) e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const geocoder = getGeocoder();
    if (!geocoder) return;
    setSearching(true);
    setSearchError('');
    geocoder.geocode({ address: q, componentRestrictions: { country: 'ae' } }, (results, status) => {
      setSearching(false);
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        dropPin(loc.lat(), loc.lng(), results[0].formatted_address);
      } else {
        setSearchError('No match — try a different search, or drop the pin on the map.');
      }
    });
  };

  const locateMe = () => {
    if (!navigator.geolocation) {
      setSearchError('Location isn’t available on this device — search or drop the pin instead.');
      return;
    }
    setSearchError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
      () => setSearchError('Couldn’t get your location — search or drop the pin on the map instead.'),
    );
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
      <form className="lp__searchrow" onSubmit={runSearch}>
        <input className="lp__search" placeholder="Search your area, building or street"
          value={query} onChange={(e) => setQuery(e.target.value)} />
        <button type="submit" className="lp__searchbtn" disabled={searching}>{searching ? '…' : 'Search'}</button>
      </form>
      {searchError && <p className="lp__err">{searchError}</p>}

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
  .lp__searchrow { display: flex; gap: 8px; }
  .lp__search { flex: 1; min-width: 0; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
  .lp__search:focus { outline: none; border-color: var(--color-accent); }
  .lp__searchbtn { padding: 0 18px; border-radius: var(--radius); border: 1px solid var(--color-border); background: var(--color-accent); color: #1A1206; font-weight: 600; font-size: 0.9rem; white-space: nowrap; }
  .lp__searchbtn:disabled { opacity: 0.5; }
  .lp__locate { align-self: flex-start; padding: 9px 14px; border-radius: var(--radius); border: 1px solid var(--color-border); background: var(--color-surface-2); color: var(--color-foreground-soft); font-size: 0.85rem; }
  .lp__locate:hover { border-color: var(--color-accent); }
  .lp__map { width: 100%; height: 260px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--color-border); }
  .lp__addr { color: var(--color-muted); font-size: 0.85rem; }
  .lp__loading, .lp__err { color: var(--color-muted); font-size: 0.9rem; }
  .lp__fallback { width: 100%; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
  .fields { display: flex; flex-direction: column; gap: 10px; }
  .fields input, .fields textarea { width: 100%; padding: 13px 14px; background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius); color: var(--color-foreground); font-family: var(--font-body); font-size: 1rem; }
  .fields input:focus, .fields textarea:focus { outline: none; border-color: var(--color-accent); }
`;
