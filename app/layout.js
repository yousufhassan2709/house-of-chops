import './globals.css';

export const metadata = {
  title: 'House of Chops — Premium Lamb Chops, Delivered',
  description:
    'Flame-kissed, premium lamb chops delivered to your door in Dubai. Order House of Chops on Talabat.',
  openGraph: {
    title: 'House of Chops — Premium Lamb Chops, Delivered',
    description: 'Flame-kissed, premium lamb chops delivered across Dubai.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0C0A09',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
