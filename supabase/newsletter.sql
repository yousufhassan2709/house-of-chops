-- House of Chops newsletter subscribers. Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  email        text not null,
  source       text not null default 'site_footer',
  -- Where they were when they signed up, for nothing more than knowing which
  -- page earns sign-ups. No tracking beyond the referring path.
  path         text
);

-- One row per address, case-insensitively: someone typing Name@x.com after
-- name@x.com is the same person, and a second sign-up should be a no-op
-- rather than a duplicate.
create unique index if not exists newsletter_subscribers_email_key
  on public.newsletter_subscribers (lower(email));

-- Lock the table down. The server uses the service-role key, which bypasses
-- RLS. With RLS on and no policies, anon/public keys can read or write nothing
-- — the subscriber list is never reachable from the browser.
alter table public.newsletter_subscribers enable row level security;
