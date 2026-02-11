-- Fix Grading Persistence
-- Instructors need UPDATE permission to grade submissions.

CREATE POLICY "Instructors can grade class submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = submissions.class_id 
      AND classes.instructor_id = auth.uid()
    )
  );
