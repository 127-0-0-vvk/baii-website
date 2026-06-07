-- ============================================================
-- BAII — Track redo attempts per lesson day (max 3)
-- Run in Supabase SQL editor after supabase-lesson-grades.sql
-- ============================================================

alter table lesson_responses add column if not exists attempts integer not null default 1;
update lesson_responses set attempts = 1 where attempts is null;
