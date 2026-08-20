import './globals.css';
import { BranchPickerProvider } from '@/components/BranchPicker';

export const metadata = {
  metadataBase: new URL('https://house-of-chops.vercel.app'),
  title: 'House of Chops — Premium Lamb Chops, Delivered',
  description:
    'Dubai’s delivery-only lamb chop specialists. A secret family marinade over ten years in the making, fired over open flame, packed to arrive hot. Order online across Dubai.',
  openGraph: {
    title: 'House of Chops — Premium Lamb Chops, Delivered',
    description: 'Chops Only. That’s the House Rule. Order online across Dubai.',
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
      <body>
        <BranchPickerProvider>{children}</BranchPickerProvider>
      </body>
    </html>
  );
}
