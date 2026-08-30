import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';

// Deliberately loose: one @, a dot in the domain, no spaces. Anything
// stricter starts rejecting real addresses, and the only cost of a bad one
// here is a row nobody mails.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim();
    const path = typeof body?.path === 'string' ? body.path.slice(0, 200) : null;

    if (!EMAIL.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from('newsletter_subscribers')
      .insert({ email, path, source: 'site_footer' });

    // 23505 is a unique violation — they are already on the list. That is a
    // success from the reader's side, and saying otherwise would leak who has
    // signed up to anyone who wanted to probe the list.
    if (error && error.code !== '23505') {
      console.error('newsletter insert failed', error);
      return NextResponse.json({ error: 'Could not sign you up. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('newsletter route failed', err);
    return NextResponse.json({ error: 'Could not sign you up. Please try again.' }, { status: 500 });
  }
}
