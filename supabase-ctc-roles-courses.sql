-- ============================================================
-- BAII CTC — roles (add tutor), cohort↔course links, schedule, payments
-- Run in Supabase SQL editor (after supabase-ctc-schema.sql).
-- ============================================================

-- 1. Allow a 'tutor' role alongside admin/student.
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin','tutor','student'));

-- 2. Cohort program start date (Monday of Sem 1, Week 1) — auto-derives the schedule.
alter table cohorts add column if not exists start_date date;

-- 3. A cohort runs one or more courses (course codes from the in-app catalogue, e.g. 'CTC').
create table if not exists cohort_courses (
  id uuid default gen_random_uuid() primary key,
  cohort_id uuid references cohorts(id) on delete cascade,
  course_code text not null,
  unique(cohort_id, course_code)
);
alter table cohort_courses enable row level security;
drop policy if exists "read cohort_courses" on cohort_courses;
create policy "read cohort_courses" on cohort_courses for select using (true);
drop policy if exists "admin write cohort_courses" on cohort_courses;
create policy "admin write cohort_courses" on cohort_courses for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- 4. Cohort membership for students uses the existing student_cohorts table
--    (student_id, cohort_id) — students assigned to a cohort get access; pods are a subset.

-- 5. Payments / fees.
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  cohort_id uuid references cohorts(id) on delete set null,
  amount numeric not null default 0,
  currency text default 'INR',
  status text default 'pending' check (status in ('pending','paid','partial','waived')),
  note text,
  created_at timestamptz default now()
);
alter table payments enable row level security;
drop policy if exists "read own payments" on payments;
create policy "read own payments" on payments for select using (student_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role in ('admin','tutor')));
drop policy if exists "admin write payments" on payments;
create policy "admin write payments" on payments for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
