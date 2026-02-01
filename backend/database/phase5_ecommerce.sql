-- Phase 5: E-commerce & Payments Schema

-- 1. Enrollments Table
-- Tracks which users have access to which courses
create table if not exists public.enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate enrollments
  unique(user_id, course_id)
);

-- 2. Orders Table
-- Tracks financial transactions (Stripe)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  course_id uuid references public.courses(id) on delete set null,
  amount decimal(10, 2) not null, -- Amount paid
  currency text default 'USD',
  status text default 'pending', -- pending, completed, failed, refunded
  stripe_session_id text, -- link to Stripe
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS Policies

-- Enable RLS
alter table public.enrollments enable row level security;
alter table public.orders enable row level security;

-- Enrollments Policies
-- Users can see their own enrollments
create policy "Users can view own enrollments" 
  on public.enrollments for select 
  using (auth.uid() = user_id);

-- Admins/Service Role can do everything (handled by service role key usually, but good to have)
-- (Note: Service Role bypasses RLS, so explicit admin policy is for admin user accounts)
-- Assuming we have a public.profiles role check or similar. For now, let's keep it simple.

-- Orders Policies
-- Users can view their own orders
create policy "Users can view own orders" 
  on public.orders for select 
  using (auth.uid() = user_id);

-- 4. Indexes for Performance
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_orders_user on public.orders(user_id);
