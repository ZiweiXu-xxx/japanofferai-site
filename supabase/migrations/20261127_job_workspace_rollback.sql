-- JapanOffer AI — Rollback for 20261127_job_workspace.sql (Pillar 2)
-- Date: 2026-11-27
-- Run in: Supabase Dashboard -> SQL Editor, ONLY with the user's explicit
-- approval and after a backup. This drops the status/deadline columns the
-- Pillar 2 migration added. Any statuses or deadlines stored in them are
-- lost (statuses also live in application_drafts.status, which this file
-- does NOT touch, so draft statuses survive).
--
-- Note: dropping saved_jobs.status also removes the CHECK constraint.
-- The frontend keeps working after this rollback: status changes still
-- persist to application_drafts, deadlines stay in memory only (see
-- applications.js `persistWorkspace`).

ALTER TABLE public.saved_jobs
  DROP COLUMN IF EXISTS deadline,
  DROP COLUMN IF EXISTS status;

ALTER TABLE public.application_drafts
  DROP COLUMN IF EXISTS deadline;

DROP INDEX IF EXISTS public.saved_jobs_user_deadline_idx;
