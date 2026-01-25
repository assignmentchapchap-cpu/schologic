-- Add is_active column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Enable RLS for Admins on key tables
DO $$ 
BEGIN
-- Profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

-- Classes
DROP POLICY IF EXISTS "Admins can do everything on classes" ON classes;
CREATE POLICY "Admins can do everything on classes" ON classes FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

-- Assignments
DROP POLICY IF EXISTS "Admins can do everything on assignments" ON assignments;
CREATE POLICY "Admins can do everything on assignments" ON assignments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

-- Submissions
DROP POLICY IF EXISTS "Admins can do everything on submissions" ON submissions;
CREATE POLICY "Admins can do everything on submissions" ON submissions FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

-- Enrollments
DROP POLICY IF EXISTS "Admins can do everything on enrollments" ON enrollments;
CREATE POLICY "Admins can do everything on enrollments" ON enrollments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

-- Events
DROP POLICY IF EXISTS "Admins can do everything on instructor_events" ON instructor_events;
CREATE POLICY "Admins can do everything on instructor_events" ON instructor_events FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('superadmin', 'institution_admin')
);

END $$;
