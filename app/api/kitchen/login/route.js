import { NextResponse } from 'next/server';
import { kitchenToken, verifyKitchenPassword, KITCHEN_COOKIE } from '@/lib/kitchenAuth';

export const runtime = 'nodejs';

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));
  if (!verifyKitchenPassword(password)) {
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(KITCHEN_COOKIE, kitchenToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
