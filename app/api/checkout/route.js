import { NextResponse } from 'next/server';
import { calculateOrder } from '@/lib/products';
import { buildOrderLocation } from '@/lib/location';
import { getSupabase } from '@/lib/supabase';
import { createPaymentIntent } from '@/lib/ziina';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json();
    const customer = body?.customer || {};
    const name = String(customer.name || '').trim();
    const phone = String(customer.phone || '').trim();
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }
    // Validates coordinates and composes a readable address server-side (throws on bad input).
    const location = buildOrderLocation(customer);

    // Server-authoritative total — the browser's numbers are ignored.
    const order = calculateOrder(body?.items);

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;
    const intent = await createPaymentIntent({
      amountFils: order.amountFils,
      successUrl: `${origin}/order/success`,
      cancelUrl: `${origin}/order?status=cancelled`,
      failureUrl: `${origin}/order?status=failed`,
    });

    if (!intent?.id || !intent?.redirect_url) {
      throw new Error('Ziina did not return a valid payment intent.');
    }

    const supabase = getSupabase();
    const { error } = await supabase.from('orders').insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: location.customer_address,
      latitude: location.latitude,
      longitude: location.longitude,
      address_details: location.address_details,
      items: order.lineItems,
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      status: 'pending_payment',
      ziina_payment_id: intent.id,
    });
    if (error) throw new Error(error.message);

    // Remember which intent this browser is paying, so /api/confirm can verify it on return.
    const res = NextResponse.json({ redirect_url: intent.redirect_url });
    res.cookies.set('hoc_pi', intent.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Checkout failed.' }, { status: 400 });
  }
}
