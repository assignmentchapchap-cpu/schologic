-- Add grading columns to practicum_enrollments table
-- Run this in your Supabase SQL Editor

ALTER TABLE practicum_enrollments
ADD COLUMN IF NOT EXISTS logs_grade numeric,       -- Aggregated/Manual score for Logs & Other
ADD COLUMN IF NOT EXISTS report_grade numeric,     -- Score for the final student report
ADD COLUMN IF NOT EXISTS supervisor_grade numeric, -- Score from the supervisor's evaluation
ADD COLUMN IF NOT EXISTS final_grade numeric;      -- Total calculated grade

-- Optional: Add comments for clarity
COMMENT ON COLUMN practicum_enrollments.logs_grade IS 'Grade for verified logs and other activities';
COMMENT ON COLUMN practicum_enrollments.report_grade IS 'Grade for the submitted student final report';
COMMENT ON COLUMN practicum_enrollments.supervisor_grade IS 'Grade derived from the supervisor evaluation form';
COMMENT ON COLUMN practicum_enrollments.final_grade IS 'Final computed grade for the practicum unit';
