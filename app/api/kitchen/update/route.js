import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isKitchenAuthed } from '@/lib/kitchenAuth';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const ALLOWED = ['new', 'cooking', 'ready', 'delivered'];

export async function POST(request) {
  if (!isKitchenAuthed(cookies())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id, status } = await request.json();
  if (!id || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  const supabase = getSupabase();
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
