import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import { getSupabase } from '@/lib/supabase';
import { ORDER_STATUS, KITCHEN_ACTIVE_STATUSES } from '@/lib/orderStatus';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only what the board renders — this endpoint is polled every 5s per device.
const BOARD_COLUMNS =
  'id, order_number, created_at, status, customer_name, customer_phone, customer_address, latitude, longitude, items, total';

export async function GET() {
  if (!isKitchenAuthed(cookies())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [active, today] = await Promise.all([
    supabase
      .from('orders')
      .select(BOARD_COLUMNS)
      .in('status', KITCHEN_ACTIVE_STATUSES)
      .order('created_at', { ascending: true }),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString())
      .neq('status', ORDER_STATUS.PENDING_PAYMENT),
  ]);

  if (active.error) {
    return NextResponse.json({ error: active.error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: active.data || [], totalToday: today.count || 0 });
}
