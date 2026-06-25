import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import KitchenBoard from '@/components/KitchenBoard';

export const dynamic = 'force-dynamic';

export default function KitchenPage() {
  if (!isKitchenAuthed(cookies())) redirect('/kitchen/login');
  return <KitchenBoard />;
}
