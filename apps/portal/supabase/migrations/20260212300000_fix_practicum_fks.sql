-- ============================================================================
-- Migration: Harmonize practicum_enrollments FK to enable PostgREST joins
-- ============================================================================
-- Problem: practicum_enrollments.student_id references auth.users(id),
--          but PostgREST can only resolve nested joins through profiles(id).
--          The enrollments table already references profiles(id) and works.
--
-- Fix: Re-point the FK to profiles(id). Safe because profiles.id = auth.users.id.
-- ============================================================================

DO $$ 
BEGIN
  -- Drop the existing FK pointing to auth.users
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'practicum_enrollments_student_id_fkey'
      AND table_name = 'practicum_enrollments'
  ) THEN
    ALTER TABLE practicum_enrollments DROP CONSTRAINT practicum_enrollments_student_id_fkey;
  END IF;
  
  -- Add new FK pointing to profiles(id) with ON DELETE CASCADE
  ALTER TABLE practicum_enrollments 
    ADD CONSTRAINT practicum_enrollments_student_id_fkey 
    FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;
