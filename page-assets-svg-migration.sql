update storage.buckets
set allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif','image/avif','image/svg+xml']
where id = 'page-assets';
