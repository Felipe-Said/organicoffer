-- Execute no SQL Editor do Supabase. Este script não contém senhas.
-- Depois, crie o usuário informado em Authentication > Users > Add user.
-- O gatilho ao final concede o perfil admin somente ao e-mail autorizado.
create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('VT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  country text,
  zipcode text,
  session_id uuid,
  amount numeric(12,2) not null default 9.99 check (amount >= 0),
  currency text not null default 'BRL',
  status text not null default 'pending' check (status in ('pending','success','failed','refunded')),
  payment_reference text,
  billing_type text not null default 'payment' check (billing_type in ('payment','subscription')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  ebook_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_email_idx on public.orders(lower(email));
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.offers (
  slug text primary key,
  title text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  sort_order integer not null default 0,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.site_events (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  event_type text not null check (event_type in ('page_view','checkout_click','heartbeat','click','scroll_depth')),
  path text not null default '/',
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.site_presence (
  session_id uuid primary key,
  path text not null default '/',
  active boolean not null default true,
  last_seen timestamptz not null default now()
);
create index if not exists site_presence_active_last_seen_idx on public.site_presence(active,last_seen desc);
alter table public.site_presence enable row level security;
revoke all on public.site_presence from anon,authenticated;
create index if not exists site_events_created_idx on public.site_events(created_at desc);
create index if not exists site_events_type_created_idx on public.site_events(event_type,created_at desc);

create table if not exists public.page_content (
  selector text primary key,
  content_type text not null check (content_type in ('text','image')),
  value text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  parent_id uuid references public.blog_categories(id) on delete set null, sort_order integer not null default 0,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique, excerpt text not null default '', content text not null default '',
  category_id uuid references public.blog_categories(id) on delete set null, status text not null default 'draft' check(status in ('draft','published')),
  desktop_image_url text not null default '', mobile_image_url text not null default '', published_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.blog_settings (
  id text primary key default 'main', title text not null default 'Conteúdos de Vovó Tereza', subtitle text not null default 'Informação prática para uma vida mais natural.',
  blog_url text not null default '/', primary_color text not null default '#245438', background_color text not null default '#f7f2e8',
  hero_desktop_url text not null default '', hero_mobile_url text not null default '', custom_css text not null default '', updated_at timestamptz not null default now()
);
insert into public.blog_settings(id) values('main') on conflict(id) do nothing;

create table if not exists public.email_delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  requested_by uuid default auth.uid() references auth.users(id),
  status text not null default 'queued' check (status in ('queued','processing','sent','failed')),
  provider_reference text,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

insert into public.offers(slug,title,description,price,sort_order) values
('recipe-1','Cuide do seu corpo sem uma única receita médica','Remédios naturais para rins, fígado, intestino e circulação.',37,1),
('recipe-2','Tenha uma aparência mais jovem sem tratamentos caros','Cuidados naturais para dentes, pele, cabelo e manchas.',37,2),
('recipe-3','Recupere o que a indústria disse ser permanente','Cuidados para varizes, inchaço e reparação da pele.',23,3),
('bundle','Livro completo de Remédios Antigos','As três coleções reunidas em um único e-book.',9.99,4)
on conflict (slug) do nothing;

insert into public.app_settings(key,value) values
('funnel',jsonb_build_object('webhook_url','','email_provider','leadconnector','email_sender',''))
on conflict (key) do nothing;
insert into public.app_settings(key,value) values
('payment_gateway',jsonb_build_object('provider','stripe','checkout_mode','payment','currency','brl','subscription_interval','month'))
on conflict (key) do nothing;
insert into public.app_settings(key,value) values
('delivery',jsonb_build_object('provider','download','storage_path','','file_name','','file_size',0))
on conflict (key) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ebooks','ebooks',false,29360128,array['application/pdf'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('page-assets','page-assets',true,8388608,array['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('blog-assets','blog-assets',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admin_profiles where user_id = (select auth.uid())) $$;

drop policy if exists "admins read ebooks" on storage.objects;
create policy "admins read ebooks" on storage.objects for select to authenticated using (bucket_id='ebooks' and (select public.is_admin()));
drop policy if exists "admins upload ebooks" on storage.objects;
create policy "admins upload ebooks" on storage.objects for insert to authenticated with check (bucket_id='ebooks' and (select public.is_admin()));
drop policy if exists "admins update ebooks" on storage.objects;
create policy "admins update ebooks" on storage.objects for update to authenticated using (bucket_id='ebooks' and (select public.is_admin())) with check (bucket_id='ebooks' and (select public.is_admin()));
drop policy if exists "admins delete ebooks" on storage.objects;
create policy "admins delete ebooks" on storage.objects for delete to authenticated using (bucket_id='ebooks' and (select public.is_admin()));
drop policy if exists "public reads page assets" on storage.objects;
create policy "public reads page assets" on storage.objects for select to anon,authenticated using (bucket_id='page-assets');
drop policy if exists "admins upload page assets" on storage.objects;
create policy "admins upload page assets" on storage.objects for insert to authenticated with check (bucket_id='page-assets' and (select public.is_admin()));
drop policy if exists "admins update page assets" on storage.objects;
create policy "admins update page assets" on storage.objects for update to authenticated using (bucket_id='page-assets' and (select public.is_admin())) with check (bucket_id='page-assets' and (select public.is_admin()));
drop policy if exists "admins delete page assets" on storage.objects;
create policy "admins delete page assets" on storage.objects for delete to authenticated using (bucket_id='page-assets' and (select public.is_admin()));
drop policy if exists "public reads blog assets" on storage.objects;
create policy "public reads blog assets" on storage.objects for select to anon,authenticated using (bucket_id='blog-assets');
drop policy if exists "admins upload blog assets" on storage.objects;
create policy "admins upload blog assets" on storage.objects for insert to authenticated with check (bucket_id='blog-assets' and (select public.is_admin()));
drop policy if exists "admins update blog assets" on storage.objects;
create policy "admins update blog assets" on storage.objects for update to authenticated using (bucket_id='blog-assets' and (select public.is_admin())) with check (bucket_id='blog-assets' and (select public.is_admin()));
drop policy if exists "admins delete blog assets" on storage.objects;
create policy "admins delete blog assets" on storage.objects for delete to authenticated using (bucket_id='blog-assets' and (select public.is_admin()));

alter table public.admin_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.offers enable row level security;
alter table public.app_settings enable row level security;
alter table public.site_events enable row level security;
alter table public.page_content enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_settings enable row level security;
alter table public.email_delivery_jobs enable row level security;

drop policy if exists "admin profiles self read" on public.admin_profiles;
create policy "admin profiles self read" on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "admins manage orders" on public.orders;
create policy "admins manage orders" on public.orders for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "public creates pending orders" on public.orders;
create policy "public creates pending orders" on public.orders for insert to anon with check (status = 'pending');
drop policy if exists "public reads active offers" on public.offers;
create policy "public reads active offers" on public.offers for select to anon,authenticated using (active or (select public.is_admin()));
drop policy if exists "admins manage offers" on public.offers;
create policy "admins manage offers" on public.offers for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage settings" on public.app_settings;
create policy "admins manage settings" on public.app_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "public creates site events" on public.site_events;
create policy "public creates site events" on public.site_events for insert to anon,authenticated with check (true);
drop policy if exists "admins read site events" on public.site_events;
create policy "admins read site events" on public.site_events for select to authenticated using ((select public.is_admin()));
drop policy if exists "public reads page content" on public.page_content;
create policy "public reads page content" on public.page_content for select to anon,authenticated using (true);
drop policy if exists "admins manage page content" on public.page_content;
create policy "admins manage page content" on public.page_content for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "public reads blog categories" on public.blog_categories;
create policy "public reads blog categories" on public.blog_categories for select to anon,authenticated using (active or (select public.is_admin()));
drop policy if exists "admins manage blog categories" on public.blog_categories;
create policy "admins manage blog categories" on public.blog_categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "public reads published posts" on public.blog_posts;
create policy "public reads published posts" on public.blog_posts for select to anon,authenticated using (status='published' or (select public.is_admin()));
drop policy if exists "admins manage blog posts" on public.blog_posts;
create policy "admins manage blog posts" on public.blog_posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "public reads blog settings" on public.blog_settings;
create policy "public reads blog settings" on public.blog_settings for select to anon,authenticated using (true);
drop policy if exists "admins manage blog settings" on public.blog_settings;
create policy "admins manage blog settings" on public.blog_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage delivery jobs" on public.email_delivery_jobs;
create policy "admins manage delivery jobs" on public.email_delivery_jobs for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant usage on schema public to anon,authenticated;
grant insert on public.orders,public.site_events to anon;
grant select on public.offers,public.page_content,public.blog_categories,public.blog_posts,public.blog_settings to anon;
grant select,insert,update,delete on public.admin_profiles,public.orders,public.offers,public.app_settings,public.site_events,public.page_content,public.blog_categories,public.blog_posts,public.blog_settings,public.email_delivery_jobs to authenticated;
grant usage,select on sequence public.site_events_id_seq to anon,authenticated;

create or replace function public.admin_dashboard_metrics()
returns table(total_revenue numeric,total_sales bigint,checkout_clicks bigint,page_views bigint,conversion_rate numeric,live_visitors bigint)
language plpgsql security definer set search_path = public
as $$ begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  return query select
    coalesce((select sum(amount) from public.orders where status='success'),0),
    (select count(*) from public.orders where status='success'),
    (select count(*) from public.site_events where event_type='checkout_click'),
    (select count(*) from public.site_events where event_type='page_view'),
    case when (select count(*) from public.site_events where event_type='checkout_click')=0 then 0
      else round((select count(*) from public.orders where status='success')::numeric * 100 /
        (select count(*) from public.site_events where event_type='checkout_click'),2) end,
    (select count(distinct session_id) from public.site_events where event_type='heartbeat' and created_at > now()-interval '2 minutes');
end $$;

create or replace function public.admin_sales_last_7_days()
returns table(day date,revenue numeric)
language plpgsql security definer set search_path = public
as $$ begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  return query with days as (select generate_series(current_date-6,current_date,'1 day')::date as d)
  select d.d,coalesce(sum(o.amount) filter(where o.status='success'),0)
  from days d left join public.orders o on o.created_at::date=d.d group by d.d order by d.d;
end $$;

grant execute on function public.admin_dashboard_metrics() to authenticated;
grant execute on function public.admin_sales_last_7_days() to authenticated;

create or replace function public.register_designated_admin()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if lower(new.email)='saidlabsglobal@gmail.com' then
    insert into public.admin_profiles(user_id,email) values(new.id,lower(new.email)) on conflict do nothing;
  end if;
  return new;
end $$;
drop trigger if exists designated_admin_after_signup on auth.users;
create trigger designated_admin_after_signup after insert or update of email on auth.users
for each row execute function public.register_designated_admin();
insert into public.admin_profiles(user_id,email)
select id,lower(email) from auth.users where lower(email)='saidlabsglobal@gmail.com'
on conflict do nothing;
