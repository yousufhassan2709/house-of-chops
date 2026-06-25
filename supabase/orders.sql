-- House of Chops orders table. Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create sequence if not exists hoc_order_seq start 1;

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text unique not null
                      default 'HOC-' || lpad(nextval('hoc_order_seq')::text, 2, '0'),
  created_at        timestamptz not null default now(),
  customer_name     text not null,
  customer_phone    text not null,
  customer_address  text not null,
  items             jsonb not null,
  subtotal          numeric not null,
  delivery_fee      numeric not null,
  total             numeric not null,
  status            text not null default 'pending_payment',
  ziina_payment_id  text
);

-- Lock the table down. The server uses the service-role key, which bypasses RLS.
-- With RLS on and no policies, anon/public keys can read or write nothing.
alter table public.orders enable row level security;
