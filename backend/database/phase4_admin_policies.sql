-- Phase 4: Admin Policies
-- Run this in Supabase SQL Editor to enable Admin Writes via API (if not using Service Key)

-- Allow authenticated users to insert courses
create policy "Authenticated users can create courses"
  on public.courses for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update their own courses
create policy "Authenticated users can update their own courses"
  on public.courses for update
  to authenticated
  using ( instructor_id = auth.uid() or instructor_id is null )
  with check ( instructor_id = auth.uid() or instructor_id is null );

-- Allow authenticated users to delete their own courses (Optional for now)
create policy "Authenticated users can delete their own courses"
  on public.courses for delete
  to authenticated
  using ( instructor_id = auth.uid() or instructor_id is null );
