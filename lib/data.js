// ============================================================
//  Brand data — single source of truth for copy and links.
//  Product names, prices, and images live in lib/products.js;
//  MENU below is derived from it so prices can never drift.
// ============================================================

import { PRODUCT_LIST, formatPrice } from './products';

// Flip to true to bring back the in-house ordering flow (/order links + page).
// While false, Order Now CTAs open the branch picker (Deliveroo links).
export const ORDERING_ENABLED = false;

// One entry per physical branch. Order Now CTAs open a picker that sorts
// these by distance to the customer (see components/BranchPicker.js).
export const BRANCHES = [
  {
    id: 'al-safa',
    name: 'Al Safa',
    area: 'Al Safa 1',
    lat: 25.187,
    lng: 55.245,
    deliverooUrl:
      'https://deliveroo.ae/menu/dubai/al-safa-1/house-of-chops-al-safa?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share',
  },
  {
    id: 'ibn-battuta',
    name: 'Ibn Battuta',
    area: 'Ibn Battuta',
    lat: 25.044,
    lng: 55.118,
    deliverooUrl:
      'https://deliveroo.ae/menu/dubai/ibn-battuta/house-of-chops-ibn-batuta?utm_campaign=organic&utm_medium=referrer&utm_source=menu_share',
  },
];

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
