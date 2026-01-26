-- Fix Infinite Recursion in Classes RLS

-- 1. Create Helper Function (Security Definer to break loop)
-- "SECURITY DEFINER" means this function runs with the privileges of the creator (superuser/admin),
-- NOT the user calling it. This allows it to query 'enrollments' without triggering the recursion-causing RLS on that table.
CREATE OR REPLACE FUNCTION public.is_student_of_class(lookup_class_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments 
    WHERE class_id = lookup_class_id 
    AND student_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Class Visibility Policy
DROP POLICY IF EXISTS "Class visibility" ON classes;

CREATE POLICY "Class visibility" ON classes 
  FOR SELECT 
  USING (
    auth.uid() = instructor_id 
    OR 
    public.is_student_of_class(id)
  );
