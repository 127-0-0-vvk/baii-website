-- ============================================================
-- BAII — Lesson responses (student day-by-day submissions)
-- Run in Supabase SQL editor after supabase-pillar5-courses.sql
-- ============================================================

create table if not exists lesson_responses (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  course_code text not null,
  year_id text not null,
  module_id text not null,
  week_num text not null,
  day_num integer not null,
  response text not null,
  submitted_at timestamptz default now(),
  unique(student_id, course_code, year_id, module_id, week_num, day_num)
);

alter table lesson_responses enable row level security;

-- Students can insert and read their own responses
drop policy if exists "Students can manage own responses" on lesson_responses;
create policy "Students can manage own responses" on lesson_responses
  for all using (student_id = auth.uid());

-- Admins can read all responses
drop policy if exists "Admins can read all responses" on lesson_responses;
create policy "Admins can read all responses" on lesson_responses
  for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
