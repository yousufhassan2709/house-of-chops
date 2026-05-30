// ============================================================
//  Brand data — single source of truth for copy, menu, links.
//  Update these to change content site-wide.
// ============================================================

export const SITE = {
  name: 'House of Chops',
  tagline: 'Chops Only. That’s the House Rule.',
  shortTagline: 'Premium Lamb Chops — Delivered.',
  talabatUrl: 'https://www.talabat.com', // TODO: replace with live Talabat page URL
  instagram: 'https://instagram.com/hseofchops',
  instagramHandle: '@hseofchops',
  phone: '+9714 380 9000',
  city: 'Dubai, UAE',
  hours: 'Daily · 12:00 PM — 1:00 AM',
  kitchen: 'Cloud Kitchen Arjan',
};

export const MENU = [
  {
    name: 'Classic Box',
    subtitle: '4 Premium Lamb Chops',
    desc:
      'Marinated in our signature honey BBQ & roasted garlic herb blend. Served with seasoned fries and two dipping sauces.',
    price: 'AED 79',
    tag: null,
    image: '/images/classic-box.jpg',
  },
  {
    name: 'Large Box',
    subtitle: '6 Premium Lamb Chops',
    desc:
      'Same bold marinade, bigger feast. Served with seasoned fries and two dipping sauces. Perfect for sharing.',
    price: 'AED 99',
    tag: 'For Sharing',
    image: '/images/large-box.jpg',
  },
];

export const PILLARS = [
  {
    title: 'Premium Cuts',
    body: 'Hand-selected, consistently trimmed racks. No filler, no shortcuts.',
  },
  {
    title: '24-Hour Marinade',
    body: 'Honey BBQ and roasted garlic herb blend, resting a full day before the flame.',
  },
  {
    title: 'Open Flame',
    body: 'Seared hot and fast for a charred crust and a tender, pink centre.',
  },
  {
    title: 'Delivery-First',
    body: 'Engineered to travel. Packed to stay hot, juicy and intact to your door.',
  },
];
