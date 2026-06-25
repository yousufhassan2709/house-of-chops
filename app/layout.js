import './globals.css';

export const metadata = {
  metadataBase: new URL('https://house-of-chops.vercel.app'),
  title: 'House of Chops — Premium Lamb Chops, Delivered',
  description:
    'Dubai’s delivery-only lamb chop specialists. Marinated 24 hours, fired over open flame, packed to arrive hot. Order on WhatsApp.',
  openGraph: {
    title: 'House of Chops — Premium Lamb Chops, Delivered',
    description: 'Chops Only. That’s the House Rule. Order on WhatsApp across Dubai.',
    type: 'website',
    images: ['/images/hero.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'House of Chops — Premium Lamb Chops, Delivered',
    description: 'Chops Only. That’s the House Rule.',
    images: ['/images/hero.jpg'],
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
