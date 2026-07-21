alter table public.orders
  alter column currency set default 'BRL';

update public.app_settings
set value = jsonb_build_object(
  'provider', 'stripe',
  'checkout_mode', coalesce(nullif(value->>'checkout_mode', ''), 'payment'),
  'currency', 'brl',
  'subscription_interval', coalesce(nullif(value->>'subscription_interval', ''), 'month')
),
updated_at = now()
where key = 'payment_gateway';

insert into public.app_settings (key, value)
values (
  'payment_gateway',
  jsonb_build_object(
    'provider', 'stripe',
    'checkout_mode', 'payment',
    'currency', 'brl',
    'subscription_interval', 'month'
  )
)
on conflict (key) do nothing;
