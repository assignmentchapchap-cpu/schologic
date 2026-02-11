-- Migration to add JSONB 'rubric' column to assignments table
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS rubric JSONB DEFAULT NULL;

COMMENT ON COLUMN public.assignments.rubric IS 'Structured grading rubric: Array<{criterion, points, levels}>';
