-- Execute uma vez no SQL Editor do Supabase.
alter table public.email_delivery_jobs alter column requested_by drop not null;
alter table public.email_delivery_jobs add column if not exists provider_reference text;

create unique index if not exists email_delivery_jobs_order_unique
  on public.email_delivery_jobs(order_id);

insert into public.app_settings(key,value)
values ('delivery', jsonb_build_object(
  'provider','download',
  'storage_path','',
  'file_name','',
  'file_size',0
))
on conflict (key) do nothing;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('ebooks','ebooks',false,29360128,array['application/pdf'])
on conflict (id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "admins read ebooks" on storage.objects;
create policy "admins read ebooks"
  on storage.objects for select to authenticated
  using (bucket_id='ebooks' and (select public.is_admin()));

drop policy if exists "admins upload ebooks" on storage.objects;
create policy "admins upload ebooks"
  on storage.objects for insert to authenticated
  with check (bucket_id='ebooks' and (select public.is_admin()));

drop policy if exists "admins update ebooks" on storage.objects;
create policy "admins update ebooks"
  on storage.objects for update to authenticated
  using (bucket_id='ebooks' and (select public.is_admin()))
  with check (bucket_id='ebooks' and (select public.is_admin()));

drop policy if exists "admins delete ebooks" on storage.objects;
create policy "admins delete ebooks"
  on storage.objects for delete to authenticated
  using (bucket_id='ebooks' and (select public.is_admin()));
