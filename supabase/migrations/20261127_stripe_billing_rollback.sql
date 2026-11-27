-- JapanOffer AI — Stripe billing migration ROLLBACK
-- File: supabase/migrations/20261127_stripe_billing_rollback.sql
-- Companion to: 20261127_stripe_billing.sql (2026-11-27)
--
-- !!! READ BEFORE RUNNING !!!
-- This rollback DROPS the tables and columns created by the billing
-- migration. It permanently deletes order history and webhook event
-- records. Only run it if Stripe billing is being removed entirely and
-- the data loss has been explicitly approved by the project owner.
-- Never run it on production without a fresh database backup.
-- This file has never been executed; it exists only as a documented
-- rollback path.

-- Drop the tables created by the migration (CASCADE is not needed: no
-- other table references them).
DROP TABLE IF EXISTS public.stripe_events;
DROP TABLE IF EXISTS public.orders;

-- Drop the billing columns added to users.
-- Note: dropping subscription_status also removes the DEFAULT 'none'.
ALTER TABLE public.users
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS subscription_status,
  DROP COLUMN IF EXISTS subscription_current_period_end,
  DROP COLUMN IF EXISTS premium_credits_used,
  DROP COLUMN IF EXISTS premium_credits_reset_at;

-- Drop the helper index (dropped automatically with the column, but kept
-- here for explicitness if the column drop is ever split out).
DROP INDEX IF EXISTS public.users_stripe_customer_id_idx;
