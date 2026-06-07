-- ============================================================
-- BAII — Add AI grade columns to lesson_responses
-- Run in Supabase SQL editor after supabase-lesson-responses.sql
-- ============================================================

alter table lesson_responses add column if not exists score integer;        -- 0-100 (null = ungraded / no AI key)
alter table lesson_responses add column if not exists level text;           -- Developing | Proficient | Excellent
alter table lesson_responses add column if not exists strength text;        -- one thing the student did well
alter table lesson_responses add column if not exists tip text;             -- one concrete improvement
