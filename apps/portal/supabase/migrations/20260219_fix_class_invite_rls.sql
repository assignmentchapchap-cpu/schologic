-- Migration: Fix Student Class Join via Invite Code
-- Date: 2026-02-19
-- Fix: The invite_code join flow is handled server-side via the verifyUnifiedInvite
-- server action (uses service-role key, bypasses RLS). The enrollment INSERT itself
-- is done via the enrollStudent server action (also service-role). No RLS change needed.
-- 
-- This file is intentionally a no-op. The code fix was applied in the dashboard
-- component to call server actions instead of client-side Supabase queries.
SELECT 1; -- no-op
