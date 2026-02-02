-- Create progress table
create table if not exists progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  lesson_id uuid references course_lessons(id) not null,
  course_id uuid references courses(id) not null,
  is_completed boolean default false,
  completed_at timestamp with time zone,
  last_position_seconds integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, lesson_id)
);

-- RLS
alter table progress enable row level security;

create policy "Users can view their own progress"
on progress for select
using (auth.uid() = user_id);

create policy "Users can insert/update their own progress"
on progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
