-- Add delivery-location columns. Run once in the Supabase SQL editor.
alter table public.orders
  add column if not exists latitude numeric,
  add column if not exists longitude numeric,
  add column if not exists address_details jsonb;
