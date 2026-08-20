// Server-authoritative product catalog and totals — the single source of
// truth for anything sold (prices, names, copy, images). Marketing surfaces
// (lib/data.js MENU) derive from this; never hardcode a price elsewhere.
// Safe to import on the client (display only) — contains no secrets.
// NEVER trust a price or total coming from the browser; always recompute here.

export const PRODUCTS = {
  classic: {
    id: 'classic',
    name: 'Classic Box',
    subtitle: '4 Premium Lamb Chops',
    desc:
      'Marinated in our signature honey BBQ & roasted garlic herb blend. Served with our chop dust fries or sweet potato.',
    price: 99,
    tag: null,
    image: '/images/classic-box.jpg',
  },
  large: {
    id: 'large',
    name: 'Large Box',
    subtitle: '6 Premium Lamb Chops',
    desc:
      'Same bold marinade, bigger feast. Served with our chop dust fries or sweet potato. Perfect for sharing.',
    price: 119,
    tag: null,
    image: '/images/large-box.jpg',
  },
};

// Stable display order for storefront and menu.
export const PRODUCT_LIST = [PRODUCTS.classic, PRODUCTS.large];

export const DELIVERY_FEE = 15;
const MAX_QTY = 99;

export function formatPrice(amount) {
  return `AED ${amount}`;
}

// items: [{ id: 'classic', qty: 2 }, ...] — any extra fields are ignored.
export function calculateOrder(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty.');
  }
  const lineItems = [];
  let subtotal = 0;
  for (const item of items) {
    const product = PRODUCTS[item?.id];
    if (!product) throw new Error(`Unknown product: ${item?.id}`);
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      throw new Error(`Invalid quantity for ${product.id}.`);
    }
    const line_total = product.price * qty;
    subtotal += line_total;
    lineItems.push({ id: product.id, name: product.name, qty, unit_price: product.price, line_total });
  }
  const delivery_fee = DELIVERY_FEE;
  const total = subtotal + delivery_fee;
  return { lineItems, subtotal, delivery_fee, total, amountFils: total * 100 };
}
