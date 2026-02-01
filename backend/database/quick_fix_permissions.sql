-- EMERGENCY FIX: Allow Anon (Public) to create courses for testing
-- Use this ONLY if you haven't set up the Service Role Key in backend/.env

-- 1. Grant usage on sequence (if any, uuid doesn't need it)

-- 2. Allow Anon Insert
create policy "Allow anon insert for courses"
  on public.courses for insert
  to anon
  with check (true);

-- 3. Allow Anon Select (Already exists via "Public courses are viewable")
-- But we want to see Drafts too in Admin Dashboard:
create policy "Allow anon access to all courses"
  on public.courses for select
  to anon
  using (true);
