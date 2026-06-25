import { createClient } from '@supabase/supabase-js';

// Server-only client using the service-role key. Never import into client components.
let client;
export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars are missing.');
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}
