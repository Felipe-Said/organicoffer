-- Execute uma vez no SQL Editor do Supabase.
create table if not exists public.site_presence (
  session_id uuid primary key,
  path text not null default '/',
  active boolean not null default true,
  last_seen timestamptz not null default now()
);

create index if not exists site_presence_active_last_seen_idx
  on public.site_presence(active, last_seen desc);

alter table public.site_presence enable row level security;

-- A presença é gravada e consultada apenas pelas funções protegidas do servidor.
revoke all on public.site_presence from anon, authenticated;
