-- Execute uma vez no SQL Editor do Supabase.
alter table public.orders add column if not exists state text;

create index if not exists orders_state_city_idx
  on public.orders(state, city)
  where status = 'success';
