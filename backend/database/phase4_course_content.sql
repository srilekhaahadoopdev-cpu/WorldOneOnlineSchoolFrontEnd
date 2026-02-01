-- Phase 4: Course Content Schema

-- Modules Table
create table if not exists public.course_modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Lessons Table
create table if not exists public.course_lessons (
  id uuid default gen_random_uuid() primary key,
  module_id uuid references public.course_modules(id) on delete cascade not null,
  title text not null,
  lesson_type text check (lesson_type in ('video', 'text', 'quiz', 'pdf')) not null,
  content text, -- For text content or description
  video_url text, -- For video lessons
  resource_url text, -- For PDFs or other resources
  duration integer default 0, -- In minutes
  is_free_preview boolean default false,
  "order" integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies

-- Enable RLS
alter table public.course_modules enable row level security;
alter table public.course_lessons enable row level security;

-- Public read access for published courses (via course_id)
-- We need to check if the parent course is published.
-- This can be complex in RLS for deep nesting. 
-- For now, allow public read if authenticated or just public for simplicity in prototyping, 
-- but ideally we join with courses table.

create policy "Public can view modules for published courses"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.courses
      where public.courses.id = public.course_modules.course_id
      and public.courses.is_published = true
    )
  );

create policy "Public can view lessons for published courses"
  on public.course_lessons for select
  using (
    exists (
      select 1 from public.course_modules
      join public.courses on public.courses.id = public.course_modules.course_id
      where public.course_modules.id = public.course_lessons.module_id
      and public.courses.is_published = true
    )
  );

-- Admin/Instructor Access
-- Allow authenticated users to manage content for now (will refine to instructor_id match later)
create policy "Authenticated users can manage modules"
  on public.course_modules
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage lessons"
  on public.course_lessons
  to authenticated
  using (true)
  with check (true);
