-- Migration: Backfill is_demo flag for existing demo instructor profiles
-- Date: 2026-02-19
--
-- PROBLEM:
--   /api/demo/start created demo users with is_demo: true in auth metadata,
--   but the subsequent profiles upsert never wrote is_demo, so the column
--   default (false) always won. All existing demo instructor rows therefore
--   have is_demo = false, breaking admin KPIs and the leaderboard Demo badge.
--
-- SOLUTION:
--   Identify demo instructor accounts using the unique fingerprint set by the
--   demo/start route: preferences->>'enable_practicum_management' = 'true'.
--   This value is only ever written by that route, so it reliably identifies
--   demo signups. Only update rows that have never been converted
--   (demo_converted_at IS NULL) to avoid re-flagging converted accounts.
--
-- SAFE TO RE-RUN: All conditions are idempotent (is_demo = false guard, NULL
-- converted_at guard, and the preferences check all naturally exclude already-
-- correct rows).

UPDATE profiles
SET is_demo = true
WHERE role = 'instructor'
  AND is_demo = false
  AND demo_converted_at IS NULL
  AND (preferences->>'enable_practicum_management')::boolean = true;
