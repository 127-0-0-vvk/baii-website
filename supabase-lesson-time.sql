-- ============================================================
-- BAII — Track real time-on-lesson (seconds) per submission
-- Run in Supabase SQL editor after supabase-lesson-attempts.sql
-- ============================================================

-- Seconds the student actually spent on the lesson (open → submit), counted only
-- for submitted answers. Dashboard "Hours" sums this.
alter table lesson_responses add column if not exists time_seconds integer not null default 0;
