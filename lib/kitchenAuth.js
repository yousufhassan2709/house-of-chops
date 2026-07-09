import crypto from 'crypto';

export const KITCHEN_COOKIE = 'hoc_kitchen';

// Constant-time string comparison — never leak how many characters matched.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// A cookie value that can't be forged without knowing KITCHEN_PASSWORD.
export function kitchenToken() {
  const secret = process.env.KITCHEN_PASSWORD || '';
  return crypto.createHmac('sha256', secret).update('house-of-chops-kitchen-v1').digest('hex');
}

// Rejects everything when KITCHEN_PASSWORD is unset — fail closed.
export function verifyKitchenPassword(password) {
  const expected = process.env.KITCHEN_PASSWORD;
  return Boolean(expected) && safeEqual(password || '', expected);
}

export function isKitchenAuthed(cookieStore) {
  const val = cookieStore.get(KITCHEN_COOKIE)?.value;
  return Boolean(val) && safeEqual(val, kitchenToken());
}
