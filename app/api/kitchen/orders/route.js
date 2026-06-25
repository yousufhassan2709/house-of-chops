import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isKitchenAuthed(cookies())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .in('status', ['new', 'cooking', 'ready'])
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', startOfDay.toISOString())
    .neq('status', 'pending_payment');

  return NextResponse.json({ orders: data || [], totalToday: count || 0 });
}
