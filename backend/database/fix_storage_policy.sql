
-- Relaxed Storage Policies for Development
-- This ensures that both the Python backend (Service Role) AND the Client (Admin User) can upload.

-- 1. Allow Public Read (Essential for viewing course content)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'course-content' );

-- 2. Allow Service Role Full Access (Should be default, but good to be explicit just in case)
-- Note: Service Role usually bypasses RLS, but if something is weird, this helps.
-- Actually, policies are for 'public' schema or 'storage' schema. 
-- For storage, we need to be careful.

-- 3. Allow Authenticated & Anon Uploads (For seamless dev testing)
drop policy if exists "Allow Uploads" on storage.objects;
create policy "Allow Uploads"
on storage.objects for insert
with check ( bucket_id = 'course-content' );

-- 4. Allow Updates/Deletes (So you can replace videos)
drop policy if exists "Allow Updates" on storage.objects;
create policy "Allow Updates"
on storage.objects for update
using ( bucket_id = 'course-content' );

drop policy if exists "Allow Deletes" on storage.objects;
create policy "Allow Deletes"
on storage.objects for delete
using ( bucket_id = 'course-content' );
