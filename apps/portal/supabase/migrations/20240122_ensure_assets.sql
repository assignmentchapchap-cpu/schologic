-- Fix RLS policies for assets table
-- Description: Ensures instructors can insert, update, and delete their own assets.

-- 1. Ensure RLS is enabled
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 2. Add Policy for Instructors to Manage Own Assets
-- Drops existing if present to avoid conflicts during multiple runs
DROP POLICY IF EXISTS "Instructors manage own assets" ON assets;

CREATE POLICY "Instructors manage own assets" ON assets
  FOR ALL
  USING (auth.uid() = instructor_id)
  WITH CHECK (auth.uid() = instructor_id);

-- 3. Verify/Ensure View Policy (Optional, but good for completeness if missing)
-- This matches the one in 20240123_unify_assets.sql
-- We use DO block to check existence or just rely on the previous migration having succeeded.
-- Safest is just to leave the management policy here.
