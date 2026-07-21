-- Execute uma vez no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.blog_categories(id) on delete set null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  category_id uuid references public.blog_categories(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published')),
  desktop_image_url text not null default '',
  mobile_image_url text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_settings (
  id text primary key default 'main',
  title text not null default 'Conteúdos de Vovó Tereza',
  subtitle text not null default 'Informação prática para uma vida mais natural.',
  blog_url text not null default '/blog.html',
  primary_color text not null default '#245438',
  background_color text not null default '#f7f2e8',
  hero_desktop_url text not null default '',
  hero_mobile_url text not null default '',
  custom_css text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.blog_settings add column if not exists custom_css text not null default '';

insert into public.blog_settings(id) values ('main') on conflict (id) do nothing;

alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_settings enable row level security;

drop policy if exists "public reads blog categories" on public.blog_categories;
create policy "public reads blog categories" on public.blog_categories for select to anon,authenticated using (active or public.is_admin());
drop policy if exists "admins manage blog categories" on public.blog_categories;
create policy "admins manage blog categories" on public.blog_categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "public reads published posts" on public.blog_posts;
create policy "public reads published posts" on public.blog_posts for select to anon,authenticated using (status='published' or public.is_admin());
drop policy if exists "admins manage blog posts" on public.blog_posts;
create policy "admins manage blog posts" on public.blog_posts for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "public reads blog settings" on public.blog_settings;
create policy "public reads blog settings" on public.blog_settings for select to anon,authenticated using (true);
drop policy if exists "admins manage blog settings" on public.blog_settings;
create policy "admins manage blog settings" on public.blog_settings for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

grant select on public.blog_categories,public.blog_posts,public.blog_settings to anon;
grant select,insert,update,delete on public.blog_categories,public.blog_posts,public.blog_settings to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('blog-assets','blog-assets',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "public reads blog assets" on storage.objects;
create policy "public reads blog assets" on storage.objects for select to anon,authenticated using (bucket_id='blog-assets');
drop policy if exists "admins upload blog assets" on storage.objects;
create policy "admins upload blog assets" on storage.objects for insert to authenticated with check (bucket_id='blog-assets' and (select public.is_admin()));
drop policy if exists "admins update blog assets" on storage.objects;
create policy "admins update blog assets" on storage.objects for update to authenticated using (bucket_id='blog-assets' and (select public.is_admin())) with check (bucket_id='blog-assets' and (select public.is_admin()));
drop policy if exists "admins delete blog assets" on storage.objects;
create policy "admins delete blog assets" on storage.objects for delete to authenticated using (bucket_id='blog-assets' and (select public.is_admin()));
