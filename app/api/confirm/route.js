import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';
import { getPaymentIntent } from '@/lib/ziina';
import { ORDER_STATUS } from '@/lib/orderStatus';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const cookieStore = cookies();
    const pi = cookieStore.get('hoc_pi')?.value;
    if (!pi) return NextResponse.json({ error: 'No pending order found.' }, { status: 400 });

    const supabase = getSupabase();

    // Look up the pending order so we can verify the amount Ziina captured.
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, total, status')
      .eq('ziina_payment_id', pi)
      .maybeSingle();

    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const intent = await getPaymentIntent(pi);

    // Defense in depth: when Ziina returns an amount, it must match what we charged (in fils).
    const expectedFils = Number(order.total) * 100;
    if (Number.isFinite(intent?.amount) && intent.amount !== expectedFils) {
      return NextResponse.json({ status: 'amount_mismatch' }, { status: 409 });
    }

    if (intent?.status === 'completed') {
      // Flip to "new" only on the first confirmation (idempotent via the status guard).
      const { data: updated } = await supabase
        .from('orders')
        .update({ status: ORDER_STATUS.NEW })
        .eq('ziina_payment_id', pi)
        .eq('status', ORDER_STATUS.PENDING_PAYMENT)
        .select('order_number')
        .maybeSingle();

      const orderNumber = updated?.order_number || order.order_number || null;
      const res = NextResponse.json({ status: 'paid', order_number: orderNumber });
      res.cookies.delete('hoc_pi');
      return res;
    }

    return NextResponse.json({ status: intent?.status || 'pending' });
  } catch (err) {
    return NextResponse.json({ error: 'Could not confirm payment.' }, { status: 502 });
  }
}
