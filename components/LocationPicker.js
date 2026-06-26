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
        <p className="lp__err">Map couldn't load — type your address instead.</p>
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
