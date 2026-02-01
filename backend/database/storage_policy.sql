-- Drop existing policies to avoid conflict errors
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;

-- Allow public read access (so users can see the videos)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'course-content' );

-- Allow uploads (required for the admin panel to work)
-- Note: In production, you might want to restrict this to authenticated users
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'course-content' );
