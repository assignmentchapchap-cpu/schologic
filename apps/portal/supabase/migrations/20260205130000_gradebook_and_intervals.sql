-- Migration: Add Gradebook Fields & Monthly Log Interval

-- 1. Add explicitly typed columns to practicum_enrollments for Gradebook/Reporting
-- Note: These are nullable initially to support existing data, but UI will enforce them.
ALTER TABLE practicum_enrollments
ADD COLUMN IF NOT EXISTS course_code text,
ADD COLUMN IF NOT EXISTS program_level text CHECK (program_level IN ('postgrad', 'degree', 'diploma', 'artisan')),
ADD COLUMN IF NOT EXISTS student_email text,
ADD COLUMN IF NOT EXISTS student_phone text,
ADD COLUMN IF NOT EXISTS student_registration_number text;

-- 2. Update practicums log_interval check constraint to include 'monthly'
-- First, drop the existing constraint (Postgres auto-names it usually, but we check existence)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'practicums_log_interval_check'
  ) THEN
    ALTER TABLE practicums DROP CONSTRAINT practicums_log_interval_check;
  END IF;
END $$;

-- Re-add the constraint with 'monthly' included
ALTER TABLE practicums 
ADD CONSTRAINT practicums_log_interval_check 
CHECK (log_interval IN ('daily', 'weekly', 'monthly'));

-- 3. Comment on new columns
COMMENT ON COLUMN practicum_enrollments.course_code IS 'Explicit course code (e.g., CS101) for gradebook sorting';
COMMENT ON COLUMN practicum_enrollments.program_level IS 'Academic level for gradebook grouping';
COMMENT ON COLUMN practicum_enrollments.student_email IS 'Snapshot of student email at enrollment time';
COMMENT ON COLUMN practicum_enrollments.student_phone IS 'Contact phone for this specific enrollment';
COMMENT ON COLUMN practicum_enrollments.student_registration_number IS 'Snapshot of registration number at enrollment time';
