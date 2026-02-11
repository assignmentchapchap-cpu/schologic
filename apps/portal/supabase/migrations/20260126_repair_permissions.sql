-- Migration: Repair Permissions & Data Integrity
-- Description: Fixes missing RLS policies for Classes, Profiles, and Submissions. Adds Cascade Deletion for Users.

-- ============================================================================
-- 1. PROFILES: Fix Deletion, Permissions & Auto-Creation
-- ============================================================================

-- 1.0 Trigger & Backfill ("The Fix" for missing profiles)
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    COALESCE(new.raw_user_meta_data->>'role', 'student') -- Default to student if not set
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on Signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill: Fix any existing users who have NO profile
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  COALESCE(raw_user_meta_data->>'role', 'student') 
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;


ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1.1 FK Integrity: Allow deleting a User to automatically delete their Profile
-- We attempt to drop the generic name. If it fails due to naming differences, this might need manual intervention,
-- but standard Supabase setups use profiles_id_fkey.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 1.2 RLS Policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles 
  FOR DELETE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Any authenticated user can view profiles" ON profiles;
CREATE POLICY "Any authenticated user can view profiles" ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (true);


-- ============================================================================
-- 2. CLASSES: Fix Creation, Visibility & Integrity
-- ============================================================================
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 2.1 FK Integrity: Allow needing a Profile to automatically delete their Classes
ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_instructor_id_fkey;
ALTER TABLE classes 
  ADD CONSTRAINT classes_instructor_id_fkey 
  FOREIGN KEY (instructor_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 2.2 RLS Policies
DROP POLICY IF EXISTS "Instructors can create classes" ON classes;
CREATE POLICY "Instructors can create classes" ON classes 
  FOR INSERT 
  WITH CHECK (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can update own classes" ON classes;
CREATE POLICY "Instructors can update own classes" ON classes 
  FOR UPDATE 
  USING (auth.uid() = instructor_id);

DROP POLICY IF EXISTS "Instructors can delete own classes" ON classes;
CREATE POLICY "Instructors can delete own classes" ON classes 
  FOR DELETE 
  USING (auth.uid() = instructor_id);

-- Combined Visibility: Instructors view own OR Students view via Enrollment
DROP POLICY IF EXISTS "Class visibility" ON classes;
CREATE POLICY "Class visibility" ON classes 
  FOR SELECT 
  USING (
    auth.uid() = instructor_id 
    OR 
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = classes.id AND enrollments.student_id = auth.uid())
  );


-- ============================================================================
-- 3. ASSETS: Fix Integrity (User -> Assets)
-- ============================================================================
-- 3.1 FK Integrity: Allow needing a Profile to automatically delete their Assets
-- Standard naming convention: assets_instructor_id_fkey
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_instructor_id_fkey;
ALTER TABLE assets 
  ADD CONSTRAINT assets_instructor_id_fkey 
  FOREIGN KEY (instructor_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;


-- ============================================================================
-- 4. SUBMISSIONS: Fix Student Submission & Integrity
-- ============================================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- 4.1 FK Integrity: Allow deleting Student/Class to delete Submissions
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_student_id_fkey;
ALTER TABLE submissions 
  ADD CONSTRAINT submissions_student_id_fkey 
  FOREIGN KEY (student_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_class_id_fkey;
ALTER TABLE submissions 
  ADD CONSTRAINT submissions_class_id_fkey 
  FOREIGN KEY (class_id) 
  REFERENCES classes(id) 
  ON DELETE CASCADE;

-- 4.2 RLS Policies
DROP POLICY IF EXISTS "Students can submit work" ON submissions;
CREATE POLICY "Students can submit work" ON submissions 
  FOR INSERT 
  WITH CHECK (
     auth.uid() = student_id
     -- Optional: Check if enrolled, but usually implied by logic. Let's enforce it for security.
     AND EXISTS (SELECT 1 FROM enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.class_id = submissions.class_id)
  );

DROP POLICY IF EXISTS "Students view own submissions" ON submissions;
CREATE POLICY "Students view own submissions" ON submissions 
  FOR SELECT 
  USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Instructors view class submissions" ON submissions;
CREATE POLICY "Instructors view class submissions" ON submissions 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = submissions.class_id AND classes.instructor_id = auth.uid())
  );


-- ============================================================================
-- 5. ASSIGNMENTS: Refresh & Safeguard
-- ============================================================================
-- Ensure Instructors can manage assignments (Explicit refresh)
DROP POLICY IF EXISTS "Instructors can manage assignments" ON assignments;
CREATE POLICY "Instructors can manage assignments" ON assignments 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = auth.uid())
  );
