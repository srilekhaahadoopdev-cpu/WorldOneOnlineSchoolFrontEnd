-- Create a table for Courses
create table if not exists public.courses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text,
  price decimal(10, 2) default 0.00,
  thumbnail_url text,
  instructor_id uuid references auth.users(id),
  level text check (level in ('Primary School', 'Middle School', 'High School')),
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.courses enable row level security;

-- Policy: Anyone can view published courses
create policy "Public courses are viewable by everyone"
  on public.courses for select
  using ( is_published = true );

-- Policy: Only authenticated users (instructors/admins) can insert/update (Refined in later phases)
-- For now, allow authenticated users to view all (drafts included)
create policy "Authenticated users can see all courses"
  on public.courses for select
  to authenticated
  using ( true );

-- Seed Data (Mock Courses)
insert into public.courses (title, slug, description, price, level, is_published, thumbnail_url)
values
  ('Introduction to Artificial Intelligence', 'intro-to-ai', 'Learn the basics of AI, Machine Learning, and Neural Networks.', 199.00, 'High School', true, 'bg-gradient-to-br from-indigo-500 to-purple-600'),
  ('Creative Writing Workshop', 'creative-writing', 'Unlock your imagination and master the art of storytelling.', 149.00, 'Middle School', true, 'bg-gradient-to-br from-orange-400 to-pink-500'),
  ('Foundations of Mathematics', 'math-foundations', 'Build a strong math foundation with interactive lessons.', 129.00, 'Primary School', true, 'bg-gradient-to-br from-blue-400 to-cyan-500'),
  ('Advanced Physics', 'advanced-physics', 'Explore the laws of the universe from mechanics to quantum physics.', 249.00, 'High School', true, 'bg-gradient-to-br from-red-500 to-yellow-500'),
  ('World History', 'world-history', 'A comprehensive journey through human history.', 119.00, 'Middle School', true, 'bg-gradient-to-br from-green-400 to-emerald-600')
on conflict (slug) do nothing;
