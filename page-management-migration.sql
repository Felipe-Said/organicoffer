alter table public.site_events
  add column if not exists event_data jsonb not null default '{}'::jsonb;

alter table public.site_events
  drop constraint if exists site_events_event_type_check;

alter table public.site_events
  add constraint site_events_event_type_check
  check (event_type in ('page_view','checkout_click','heartbeat','click','scroll_depth'));

create table if not exists public.page_content (
  selector text primary key,
  content_type text not null check (content_type in ('text','image')),
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.page_content enable row level security;

drop policy if exists "public reads page content" on public.page_content;
create policy "public reads page content"
  on public.page_content for select to anon, authenticated using (true);

drop policy if exists "admins manage page content" on public.page_content;
create policy "admins manage page content"
  on public.page_content for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.page_content to anon;
grant select, insert, update, delete on public.page_content to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-assets',
  'page-assets',
  true,
  8388608,
  array['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public reads page assets" on storage.objects;
create policy "public reads page assets"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'page-assets');

drop policy if exists "admins upload page assets" on storage.objects;
create policy "admins upload page assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'page-assets' and (select public.is_admin()));

drop policy if exists "admins update page assets" on storage.objects;
create policy "admins update page assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'page-assets' and (select public.is_admin()))
  with check (bucket_id = 'page-assets' and (select public.is_admin()));

drop policy if exists "admins delete page assets" on storage.objects;
create policy "admins delete page assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'page-assets' and (select public.is_admin()));
