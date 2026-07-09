import { describe, it, expect } from 'vitest';
import { isValidCoord, parsePin, hasDeliveryLocation, composeAddress, buildOrderLocation } from './location.js';

describe('parsePin', () => {
  it('returns numeric coords for a valid pin', () => {
    expect(parsePin({ lat: 25.1, lng: 55.2 })).toEqual({ lat: 25.1, lng: 55.2 });
  });
  it('returns null when coords are missing or invalid', () => {
    expect(parsePin({})).toBeNull();
    expect(parsePin({ lat: 25.1 })).toBeNull();
    expect(parsePin({ lat: 0, lng: 0 })).toBeNull();
    expect(parsePin({ lat: 'x', lng: 55 })).toBeNull();
  });
});

describe('hasDeliveryLocation', () => {
  it('accepts a valid pin without an address', () => {
    expect(hasDeliveryLocation({ lat: 25.1, lng: 55.2 })).toBe(true);
  });
  it('accepts a typed address without a pin', () => {
    expect(hasDeliveryLocation({ formattedAddress: 'Arjan, Dubai' })).toBe(true);
  });
  it('rejects neither, whitespace-only address, or invalid pin alone', () => {
    expect(hasDeliveryLocation({})).toBe(false);
    expect(hasDeliveryLocation({ formattedAddress: '   ' })).toBe(false);
    expect(hasDeliveryLocation({ lat: 0, lng: 0 })).toBe(false);
  });
});

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
