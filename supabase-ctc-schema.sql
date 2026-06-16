-- ============================================================
-- BAII CTC (Pillar 1) — pods, roles, submissions, defenses, calendar
-- The 2-year / 4-semester / weekly-mission + live-defense model.
-- Run in Supabase SQL editor. Curriculum content lives in code (src/data/ctc/curriculum.ts).
-- ============================================================

-- A cohort's position + calendar. (cohorts table already exists.)
alter table cohorts add column if not exists program text default 'CTC';
alter table cohorts add column if not exists current_sem  integer default 1;  -- 1..4 (authoritative "now")
alter table cohorts add column if not exists current_week integer default 1;  -- 1..18

-- Per-semester start date (Monday of Week 1) — used to render the calendar / deadlines.
create table if not exists cohort_semesters (
  id uuid default gen_random_uuid() primary key,
  cohort_id uuid references cohorts(id) on delete cascade,
  sem integer not null check (sem between 1 and 4),
  start_date date,
  unique(cohort_id, sem)
);

-- Pods — a team of (usually) 4 students within a cohort.
create table if not exists pods (
  id uuid default gen_random_uuid() primary key,
  cohort_id uuid references cohorts(id) on delete cascade,
  name text not null,
  discord_url text,
  charter text,
  created_at timestamptz default now()
);

create table if not exists pod_members (
  id uuid default gen_random_uuid() primary key,
  pod_id uuid references pods(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(pod_id, student_id)
);

-- Four rotating roles, assigned per pod per week.
-- Default role set (editable): Lead, Researcher, Builder, Skeptic.
create table if not exists pod_roles (
  id uuid default gen_random_uuid() primary key,
  pod_id uuid references pods(id) on delete cascade,
  sem integer not null,
  week integer not null,
  student_id uuid references profiles(id) on delete cascade,
  role text not null,
  unique(pod_id, sem, week, student_id)
);

-- One deliverable submission per pod per week (the thing they defend).
create table if not exists submissions (
  id uuid default gen_random_uuid() primary key,
  pod_id uuid references pods(id) on delete cascade,
  sem integer not null,
  week integer not null,
  deliverable_url text,            -- link to the recorded explainer / file
  notes text,
  submitted_by uuid references profiles(id),
  submitted_at timestamptz default now(),
  unique(pod_id, sem, week)
);

-- The live Friday defense = the assessment. Recorded by the lecturer.
create table if not exists defenses (
  id uuid default gen_random_uuid() primary key,
  submission_id uuid references submissions(id) on delete cascade,
  outcome text check (outcome in ('strong','passed','revise','not_defended')),
  feedback text,
  qa jsonb,                        -- [{question, note}] from the live defense
  recorded_by uuid references profiles(id),
  defended_at timestamptz default now(),
  unique(submission_id)
);

-- ── RLS ─────────────────────────────────────────────────────
alter table pods enable row level security;
alter table pod_members enable row level security;
alter table pod_roles enable row level security;
alter table submissions enable row level security;
alter table defenses enable row level security;
alter table cohort_semesters enable row level security;

-- Helper: is the current user an admin?
-- (Admin API routes use the service role and bypass RLS; these policies cover direct client reads.)
drop policy if exists "read pods" on pods;
create policy "read pods" on pods for select using (true);
drop policy if exists "admin write pods" on pods;
create policy "admin write pods" on pods for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "read pod_members" on pod_members;
create policy "read pod_members" on pod_members for select using (true);
drop policy if exists "admin write pod_members" on pod_members;
create policy "admin write pod_members" on pod_members for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "read pod_roles" on pod_roles;
create policy "read pod_roles" on pod_roles for select using (true);
drop policy if exists "admin write pod_roles" on pod_roles;
create policy "admin write pod_roles" on pod_roles for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "read submissions" on submissions;
create policy "read submissions" on submissions for select using (true);
drop policy if exists "members write submissions" on submissions;
create policy "members write submissions" on submissions for all using (
  exists (select 1 from pod_members m where m.pod_id = submissions.pod_id and m.student_id = auth.uid())
  or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "read defenses" on defenses;
create policy "read defenses" on defenses for select using (true);
drop policy if exists "admin write defenses" on defenses;
create policy "admin write defenses" on defenses for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "read cohort_semesters" on cohort_semesters;
create policy "read cohort_semesters" on cohort_semesters for select using (true);
drop policy if exists "admin write cohort_semesters" on cohort_semesters;
create policy "admin write cohort_semesters" on cohort_semesters for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
