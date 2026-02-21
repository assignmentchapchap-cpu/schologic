-- Add instructor_notes column to practicum_enrollments
-- This field will be used to store rejection reasons or general comments about the student's application

ALTER TABLE practicum_enrollments
ADD COLUMN IF NOT EXISTS instructor_notes text;
