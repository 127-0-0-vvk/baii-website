-- ============================================================
-- BAII — Pillar 5 courses + cohort start threshold
-- Run this ONCE in your Supabase SQL editor (after supabase-schema.sql)
-- ============================================================

-- 1. Allow the 'pillar5' track on the courses table
alter table courses drop constraint if exists courses_track_check;
alter table courses
  add constraint courses_track_check
  check (track in ('energy', 'semiconductor', 'pillar5'));

-- 2. Seed the 7 Pillar 5 courses (Class 6 → Class 12)
--    Codes here MUST match ALL_COURSES in the admin dashboard (P5-C6 … P5-C12)
insert into courses (code, title, track, description, order_index, duration) values
  ('P5-C6',  'The Truth Detective',  'pillar5', 'Class 6 — evaluate any claim, trace sources, spot logical fallacies, build fact-checked arguments.', 6,  '35 weeks'),
  ('P5-C7',  'The Data Journalist',  'pillar5', 'Class 7 — find real government data, interpret it honestly, spot manipulation, tell a data story.',    7,  '35 weeks'),
  ('P5-C8',  'The Debater',          'pillar5', 'Class 8 — build structured arguments, steel-man the opposition, rebut clearly, hold positions.',       8,  '35 weeks'),
  ('P5-C9',  'The Researcher',       'pillar5', 'Class 9 — design a methodology, collect and analyse evidence, produce a 5-page research paper.',       9,  '35 weeks'),
  ('P5-C10', 'The Strategist',       'pillar5', 'Class 10 — diagnose complex problems, map stakeholders, evaluate solutions, present a proposal.',      10, '35 weeks'),
  ('P5-C11', 'The Communicator',     'pillar5', 'Class 11 — professional communication: a public talk and a published article.',                      11, '35 weeks'),
  ('P5-C12', 'The Builder',          'pillar5', 'Class 12 — integration year: turn five thinking skills into one real-world output.',                  12, '35 weeks')
on conflict (code) do update set
  title = excluded.title,
  track = excluded.track,
  description = excluded.description,
  duration = excluded.duration;

-- 3. Cohort start threshold.
--    A cohort "starts" (lessons unlock) once enrolled students >= min_students_to_start.
--    Default 1 for testing — raise it later for real cohorts.
alter table cohorts add column if not exists min_students_to_start integer default 1;
update cohorts set min_students_to_start = 1 where min_students_to_start is null;
