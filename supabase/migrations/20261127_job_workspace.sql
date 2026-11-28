-- JapanOffer AI — Job hunt workspace migration (Pillar 2)
-- Date: 2026-11-27
-- Run in: Supabase Dashboard -> SQL Editor (once, on the production project)
-- DO NOT run blindly: review the statements and back up first.
--
-- What it adds: application status + deadline tracking on the existing
-- `saved_jobs` and `application_drafts` tables. No new table is needed —
-- both tables already exist and already hold one row per user + job.
--
-- Status values used by the frontend (applications.js / jobs.js):
--   'saved'     — saved, not applied yet (default)
--   'drafting'  — preparing application materials
--   'ready'     — ready to submit
--   'applied'   — application submitted
--   'interview' — in interviews
--   'offer'     — offer received
--   'rejected'  — rejected / closed without offer
--
-- Idempotent: safe to run twice (IF NOT EXISTS everywhere).
-- No existing data is changed: existing rows get status 'saved' and a
-- NULL deadline. No data is deleted.
--
-- IMPORTANT — run this before the deadline feature fully works: until it
-- is applied, the frontend still saves statuses (application_drafts.status
-- already exists) but deadlines are kept in memory only and the UI says
-- the database update is needed. See applications.js `persistWorkspace`.
--
-- RLS: both tables are user-scoped (user_id = auth.uid()). After running
-- this, confirm in the Supabase Dashboard that RLS is still enabled on
-- both tables and that the existing per-user policies cover the new
-- columns (new columns inherit the table's policies — no new policy is
-- needed, but verify rather than assume; see AUDIT.md §3.1 checklist).

-- ---------------------------------------------------------------------------
-- 1. saved_jobs: the canonical workspace row (one per user + job).
-- ---------------------------------------------------------------------------
ALTER TABLE public.saved_jobs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'saved'
    CHECK (status IN ('saved', 'drafting', 'ready', 'applied', 'interview', 'offer', 'rejected')),
  ADD COLUMN IF NOT EXISTS deadline date;

-- ---------------------------------------------------------------------------
-- 2. application_drafts: mirror of the deadline for the editor panel.
--    (Its `status` column already exists — nothing to add for status.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.application_drafts
  ADD COLUMN IF NOT EXISTS deadline date;

-- Helpful index: list a user's applications by nearest deadline.
CREATE INDEX IF NOT EXISTS saved_jobs_user_deadline_idx
  ON public.saved_jobs (user_id, deadline);

-- ---------------------------------------------------------------------------
-- Verification queries (run after applying, confirm the shape):
--   SELECT column_name, data_type, column_default
--     FROM information_schema.columns
--     WHERE table_schema = 'public'
--       AND table_name IN ('saved_jobs', 'application_drafts')
--       AND column_name IN ('status', 'deadline')
--     ORDER BY table_name, column_name;
--   SELECT status, count(*) FROM public.saved_jobs GROUP BY status;
-- ---------------------------------------------------------------------------
