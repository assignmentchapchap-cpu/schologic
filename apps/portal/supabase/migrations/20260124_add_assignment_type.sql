-- Add assignment_type column to distinguish between standard assignments and quizzes
-- The 'rubric' JSONB column will store quiz questions when type is 'quiz'

ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'standard'
CHECK (assignment_type IN ('standard', 'quiz'));

-- Add comment for documentation
COMMENT ON COLUMN assignments.assignment_type IS 'Type of assignment: standard (essay/file submission) or quiz (multiple choice)';
