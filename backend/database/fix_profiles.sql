-- Phase 2: Auth & Profiles Setup (FIXED & RETROACTIVE)
-- Run this in Supabase SQL Editor to enable automatic profile creation and fix missing profiles.

-- 1. Create Profiles Table (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text default 'student' check (role in ('student', 'instructor', 'admin')),
  avatar_url text,
  website text,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Policies for Profiles
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 4. Trigger to create profile on signup
-- Function to handle new user insertion
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing; -- Prevent duplicate error on retroactive run
  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;

-- 6. RETROACTIVE FIX: Create profiles for existing users who don't have one
insert into public.profiles (id, full_name, role, avatar_url)
select 
    id, 
    raw_user_meta_data->>'full_name', 
    coalesce(raw_user_meta_data->>'role', 'student'), 
    raw_user_meta_data->>'avatar_url'
from auth.users
where id not in (select id from public.profiles);
