-- Execute este script uma vez no SQL Editor do Supabase.
alter table public.orders add column if not exists source_type text not null default 'direct';
alter table public.orders add column if not exists source_platform text not null default 'direct';
alter table public.orders add column if not exists attribution jsonb not null default '{}'::jsonb;

create table if not exists public.checkout_leads (
  session_id uuid primary key,
  customer_name text not null default '', email text not null default '', phone text not null default '',
  address text not null default '', city text not null default '', state text not null default '',
  country text not null default '', zipcode text not null default '',
  status text not null default 'lead' check (status in ('lead','checkout','converted')),
  order_id uuid references public.orders(id) on delete set null,
  source_type text not null default 'direct', source_platform text not null default 'direct',
  attribution jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now()
);
create index if not exists checkout_leads_last_seen_idx on public.checkout_leads(last_seen_at desc);
create index if not exists checkout_leads_email_idx on public.checkout_leads(lower(email));
create index if not exists checkout_leads_status_idx on public.checkout_leads(status);
create index if not exists checkout_leads_source_idx on public.checkout_leads(source_type,source_platform);

alter table public.checkout_leads enable row level security;
revoke all on public.checkout_leads from anon;
grant select on public.checkout_leads to authenticated;
drop policy if exists "admins read checkout leads" on public.checkout_leads;
create policy "admins read checkout leads" on public.checkout_leads for select to authenticated
using ((select public.is_admin()));
notify pgrst, 'reload schema';
