import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';
import { getPaymentIntent } from '@/lib/ziina';

export const runtime = 'nodejs';

export async function POST() {
  const cookieStore = cookies();
  const pi = cookieStore.get('hoc_pi')?.value;
  if (!pi) return NextResponse.json({ error: 'No pending order found.' }, { status: 400 });

  const intent = await getPaymentIntent(pi);
  const supabase = getSupabase();

  if (intent.status === 'completed') {
    await supabase.from('orders')
      .update({ status: 'new' })
      .eq('ziina_payment_id', pi)
      .eq('status', 'pending_payment');

    const { data } = await supabase.from('orders')
      .select('order_number')
      .eq('ziina_payment_id', pi)
      .maybeSingle();

    const res = NextResponse.json({ status: 'paid', order_number: data?.order_number || null });
    res.cookies.delete('hoc_pi');
    return res;
  }

  return NextResponse.json({ status: intent.status || 'pending' });
}
