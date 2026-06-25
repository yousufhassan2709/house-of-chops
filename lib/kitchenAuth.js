import crypto from 'crypto';

export const KITCHEN_COOKIE = 'hoc_kitchen';

// A cookie value that can't be forged without knowing KITCHEN_PASSWORD.
export function kitchenToken() {
  const secret = process.env.KITCHEN_PASSWORD || '';
  return crypto.createHmac('sha256', secret).update('house-of-chops-kitchen-v1').digest('hex');
}

export function isKitchenAuthed(cookieStore) {
  const val = cookieStore.get(KITCHEN_COOKIE)?.value;
  return !!val && val === kitchenToken();
}
