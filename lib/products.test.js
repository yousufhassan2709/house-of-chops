import { describe, it, expect } from 'vitest';
import { calculateOrder, DELIVERY_FEE } from './products.js';

describe('calculateOrder', () => {
  it('totals one classic box plus delivery', () => {
    const r = calculateOrder([{ id: 'classic', qty: 1 }]);
    expect(r.subtotal).toBe(79);
    expect(r.delivery_fee).toBe(15);
    expect(r.total).toBe(94);
    expect(r.amountFils).toBe(9400);
  });

  it('totals a mixed cart and converts to fils', () => {
    const r = calculateOrder([{ id: 'classic', qty: 2 }, { id: 'large', qty: 1 }]);
    expect(r.subtotal).toBe(257);
    expect(r.total).toBe(272);
    expect(r.amountFils).toBe(27200);
    expect(r.lineItems).toHaveLength(2);
    expect(r.lineItems[0]).toMatchObject({ id: 'classic', qty: 2, unit_price: 79, line_total: 158 });
  });

  it('ignores any price sent by the caller (server is authoritative)', () => {
    const r = calculateOrder([{ id: 'classic', qty: 1, unit_price: 1, price: 1 }]);
    expect(r.total).toBe(94);
  });

  it('rejects an empty cart', () => {
    expect(() => calculateOrder([])).toThrow();
  });

  it('rejects an unknown product', () => {
    expect(() => calculateOrder([{ id: 'wagyu', qty: 1 }])).toThrow();
  });

  it('rejects a non-positive or non-integer quantity', () => {
    expect(() => calculateOrder([{ id: 'classic', qty: 0 }])).toThrow();
    expect(() => calculateOrder([{ id: 'classic', qty: 1.5 }])).toThrow();
    expect(() => calculateOrder([{ id: 'classic', qty: 1000 }])).toThrow();
  });

  it('exposes the delivery fee constant', () => {
    expect(DELIVERY_FEE).toBe(15);
  });
});
