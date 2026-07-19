-- Execute uma vez no SQL Editor do Supabase.
alter table public.orders add column if not exists billing_type text not null default 'payment';
alter table public.orders add column if not exists stripe_customer_id text;
alter table public.orders add column if not exists stripe_subscription_id text;
alter table public.orders add column if not exists subscription_status text;

do $$ begin
  alter table public.orders add constraint orders_billing_type_check
    check (billing_type in ('payment','subscription'));
exception when duplicate_object then null;
end $$;

create index if not exists orders_stripe_subscription_idx
  on public.orders(stripe_subscription_id)
  where stripe_subscription_id is not null;

insert into public.app_settings(key,value)
values ('payment_gateway', jsonb_build_object(
  'provider','stripe',
  'checkout_mode','payment',
  'payment_price_id','',
  'subscription_price_id',''
))
on conflict (key) do nothing;
