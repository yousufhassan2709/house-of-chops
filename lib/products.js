// Server-authoritative product catalog and totals.
// Safe to import on the client (display only) — contains no secrets.
// NEVER trust a price or total coming from the browser; always recompute here.

export const PRODUCTS = {
  classic: { id: 'classic', name: 'Classic Box', subtitle: '4 Premium Lamb Chops', price: 79 },
  large:   { id: 'large',   name: 'Large Box',   subtitle: '6 Premium Lamb Chops', price: 99 },
};

export const DELIVERY_FEE = 15;
const MAX_QTY = 99;

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
