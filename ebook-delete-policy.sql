-- Execute uma vez no SQL Editor do Supabase para permitir a exclusão pelo painel.
drop policy if exists "admins delete ebooks" on storage.objects;

create policy "admins delete ebooks"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'ebooks'
    and (select public.is_admin())
  );
