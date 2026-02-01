-- Add Email to Profiles and Populate it
-- This allows us to check for Duplicate Users easily from the Frontend.

-- 1. Add column
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='profiles' and column_name='email') then 
    alter table public.profiles add column email text; 
  end if; 
end $$;

-- 2. Populate existing profiles with email from auth.users
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id
and public.profiles.email is null;

-- 3. Update Trigger to automatically save email on new signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    new.email -- Save Email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
