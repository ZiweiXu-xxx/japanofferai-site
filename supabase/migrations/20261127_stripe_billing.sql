-- JapanOffer AI — Stripe billing migration
-- Date: 2026-11-27
-- Run in: Supabase Dashboard -> SQL Editor (once, on the production project)
-- DO NOT run blindly: review the statements, back up first, and confirm
-- the `users` table actually has an `id` column holding the Supabase auth
-- user id. If your `users` table is email-only (no `id` column), the
-- `ADD COLUMN IF NOT EXISTS` statements still apply, but the server code
-- falls back to email lookups (see api/analyze.js) — fix the table first
-- for id-based lookups to work.
--
-- Idempotent: safe to run twice (IF NOT EXISTS everywhere).
-- No existing table is altered except `users`, which only gains columns.
-- No data is deleted.

-- ---------------------------------------------------------------------------
-- 1. Orders created when a Checkout Session is started.
--    `status`: pending -> completed (paid, credits granted) / expired.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Supabase auth user id (uuid). If your users.id is not uuid, change this
  -- column to text before running.
  user_id uuid NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_customer_id text,
  product text NOT NULL CHECK (product IN ('single', 'pack', 'premium')),
  amount_gbp numeric(10, 2) NOT NULL,
  credits_granted integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

-- Only the server (service role key) may read/write orders. RLS is enabled
-- and no permissive policy is created on purpose: the service role bypasses
-- RLS, while the public anon key gets no access at all.
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 2. Processed Stripe webhook events (duplicate-delivery protection).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. New billing columns on the existing users table.
-- ---------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS premium_credits_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS premium_credits_reset_at timestamptz;

-- subscription_status values used by the server code:
--   'none'                — never subscribed
--   'active'              — Premium active for the current period
--   'cancel_at_period_end'— Premium active until the period ends, then stops
--   'past_due'            — last Premium payment failed (renewal pending)
--   'cancelled'           — subscription deleted

-- Helpful index for the webhook's customer -> user lookup.
CREATE INDEX IF NOT EXISTS users_stripe_customer_id_idx
  ON public.users (stripe_customer_id);

-- ---------------------------------------------------------------------------
-- Verification queries (run after applying, confirm the shape):
--   SELECT column_name, data_type FROM information_schema.columns
--     WHERE table_schema = 'public' AND table_name = 'users'
--     AND column_name IN ('stripe_customer_id','subscription_status',
--       'subscription_current_period_end','premium_credits_used',
--       'premium_credits_reset_at');
--   SELECT count(*) FROM public.orders;
--   SELECT count(*) FROM public.stripe_events;
-- ---------------------------------------------------------------------------
