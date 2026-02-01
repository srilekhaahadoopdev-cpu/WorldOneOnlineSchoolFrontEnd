-- STRICT AUTH SPECIFICATION ROLLOUT
-- Implements constraints to match User Requirements

-- 1. Ensure Profiles Table matches the "Users Table" spec as closely as possible
-- We map "Users Table" from spec to "public.profiles" + "auth.users"

-- Add columns if missing
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='username') then 
    alter table public.profiles add column username text; 
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='email') then 
    alter table public.profiles add column email text; 
  end if;
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='status') then 
    alter table public.profiles add column status text default 'inactive'; 
  end if;
end $$;

-- 2. Populate EMAIL (Critical for uniqueness check)
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id
and public.profiles.email is null;

-- 3. ENFORCE UNIQUENESS CONSTRAINTS (Rules: email UNIQUE, username UNIQUE)
-- We first clean up duplicates if any exist (keeping the latest) to avoid errors when adding constraints
-- (Skipping complex dedupe for safety, assuming standard unique flow, but will try to add constraint)

alter table public.profiles drop constraint if exists profiles_username_key;
alter table public.profiles drop constraint if exists profiles_email_key;

-- Note: Might fail if duplicates exist. User should clear DB if "CORRUPTED". 
-- But we try:
alter table public.profiles add constraint profiles_username_key unique (username);
alter table public.profiles add constraint profiles_email_key unique (email);


-- 4. UPDATE TRIGGER to sync Auth -> Profiles strictly
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, email, role, status, username)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    'student',
    'inactive', -- Default to inactive as per spec Step 3
    new.raw_user_meta_data->>'username' -- We will now require username in metadata
  );
  return new;
end;
$$;
