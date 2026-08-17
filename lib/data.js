// ============================================================
//  Brand data — single source of truth for copy and links.
//  Product names, prices, and images live in lib/products.js;
//  MENU below is derived from it so prices can never drift.
// ============================================================

import { PRODUCT_LIST, formatPrice } from './products';

// Flip to true to bring back the in-house ordering flow (/order links + page).
// While false, every "Order Now" CTA points at the Deliveroo listing instead.
export const ORDERING_ENABLED = false;

export const DELIVEROO_URL =
  'https://deliveroo.ae/menu/dubai/al-safa-1/house-of-chops-al-safa?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share';

// Spread onto any "Order Now" anchor so the destination stays in one place.
export const ORDER_LINK = ORDERING_ENABLED
  ? { href: '/order' }
  : { href: DELIVEROO_URL, target: '_blank', rel: 'noopener noreferrer' };

export const SITE = {
  name: 'House of Chops',
  tagline: 'Chops Only. That’s the House Rule.',
  shortTagline: 'Premium Lamb Chops — Delivered.',
  instagram: 'https://instagram.com/hseofchops',
  instagramHandle: '@hseofchops',
  phone: '+9714 380 9000',
  city: 'Dubai, UAE',
  hours: 'Daily · 12:00 PM — 1:00 AM',
  kitchen: 'Cloud Kitchen Arjan',
};

export const MENU = PRODUCT_LIST.map((p) => ({
  name: p.name,
  subtitle: p.subtitle,
  desc: p.desc,
  price: formatPrice(p.price),
  tag: p.tag,
  image: p.image,
}));

export const PILLARS = [
  {
    title: 'Premium Cuts',
    body: 'Hand-selected, consistently trimmed racks. No filler, no shortcuts.',
  },
  {
    title: 'The Secret Marinade',
    body: 'Mom’s recipe, perfected for over ten years and resting a full day before the flame.',
  },
  {
    title: 'Open Flame',
    body: 'Seared hot and fast for a charred crust and a tender centre.',
  },
  {
    title: 'Delivery-First',
    body: 'Engineered to travel. Packed to stay hot, juicy and intact to your door.',
  },
];
