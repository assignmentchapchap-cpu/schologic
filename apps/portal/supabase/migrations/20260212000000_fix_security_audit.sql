-- ============================================================================
-- Migration: Security Audit Fix
-- Date: 2026-02-12
-- Description: Comprehensive fix for all Supabase linter security warnings.
--   A. Drop unused objects (kb_embeddings, match_kb_documents, vector extension)
--   B. Fix function search_path (handle_new_user, is_student_of_class)
--   C. Fix permissive always-true INSERT policies (notifications, tags)
--   D. Add TO authenticated to all policies (fix anonymous access warnings)
--   E. Consolidate duplicate/overlapping policies
--   F. Prevent privilege escalation (lock profiles.role column)
-- ============================================================================


-- ============================================================================
-- SECTION A: DROP UNUSED OBJECTS
-- ============================================================================

-- A1: Drop match_kb_documents function (no app-level references)
DROP FUNCTION IF EXISTS public.match_kb_documents;

-- A2: Drop kb_embeddings table and its policies (no app-level references)
DROP POLICY IF EXISTS "kb_embeddings_select" ON public.kb_embeddings;
DROP POLICY IF EXISTS "kb_embeddings_update" ON public.kb_embeddings;
DROP POLICY IF EXISTS "kb_embeddings_delete" ON public.kb_embeddings;
DROP TABLE IF EXISTS public.kb_embeddings;

-- A3: Move vector extension to extensions schema (no remaining consumers)
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;


-- ============================================================================
-- SECTION B: FIX FUNCTION SEARCH PATH
-- Pin search_path on SECURITY DEFINER functions to prevent search path hijacking.
-- ============================================================================

-- B1: handle_new_user — Auth trigger (auto-creates profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- B2: is_student_of_class — RLS helper (breaks enrollment recursion)
CREATE OR REPLACE FUNCTION public.is_student_of_class(lookup_class_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM enrollments
    WHERE class_id = lookup_class_id
    AND student_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;


-- ============================================================================
-- SECTION C: FIX PERMISSIVE ALWAYS-TRUE INSERT POLICIES
-- Replace WITH CHECK (true) with proper ownership/role checks.
-- ============================================================================

-- C1: notifications — scope INSERT to authenticated users only
-- NOTE: WITH CHECK (true) is intentionally kept because instructors insert
-- notifications for students (e.g., grade_posted) using the browser client.
-- See: apps/portal/src/app/instructor/assignment/[assignmentId]/page.tsx:205
-- The linter warning (rls_policy_always_true) will remain, but this is an
-- accepted trade-off. Anonymous access is blocked by TO authenticated.
DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Authenticated users can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- C2: tags — restrict INSERT to instructors only
DROP POLICY IF EXISTS "Authenticated users can create tags" ON tags;
CREATE POLICY "Instructors can create tags" ON tags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'instructor')
  );


-- ============================================================================
-- SECTION D: ADD TO authenticated TO ALL POLICIES
-- Recreate every flagged policy with explicit TO authenticated role grant.
-- Grouped by table. USING/WITH CHECK logic is preserved from originals.
-- ============================================================================


-- ────────────────────────────────────────────────────────────────────────────
-- D1: profiles (6 policies → 4 clean policies after consolidation)
-- ────────────────────────────────────────────────────────────────────────────

-- Drop all existing policies (includes ghost names from base_schema.sql)
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;
DROP POLICY IF EXISTS "Any authenticated user can view profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Consolidated: Single broad SELECT (needed for class rosters, name lookups)
CREATE POLICY "Authenticated users can view profiles" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Own profile management
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- INSERT policy for signup trigger (from FIX_RLS.sql)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);


-- ────────────────────────────────────────────────────────────────────────────
-- D2: classes (6 policies → 4 clean policies after consolidation)
-- ────────────────────────────────────────────────────────────────────────────

-- Drop all existing policies (includes ghost names from base_schema.sql)
DROP POLICY IF EXISTS "Class visibility" ON classes;
DROP POLICY IF EXISTS "Public classes read" ON classes;
DROP POLICY IF EXISTS "Instructors manage classes" ON classes;
DROP POLICY IF EXISTS "Authenticated users can read classes" ON classes;
DROP POLICY IF EXISTS "Admins can do everything on classes" ON classes;
DROP POLICY IF EXISTS "Instructors can create classes" ON classes;
DROP POLICY IF EXISTS "Instructors can manage own classes" ON classes;
DROP POLICY IF EXISTS "Instructors can update own classes" ON classes;
DROP POLICY IF EXISTS "Instructors can delete own classes" ON classes;

-- SELECT: Instructor sees own OR student sees enrolled
CREATE POLICY "Class visibility" ON classes
  FOR SELECT TO authenticated
  USING (
    auth.uid() = instructor_id
    OR public.is_student_of_class(id)
  );

-- Instructor CRUD
CREATE POLICY "Instructors can create classes" ON classes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own classes" ON classes
  FOR UPDATE TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own classes" ON classes
  FOR DELETE TO authenticated
  USING (auth.uid() = instructor_id);


-- ────────────────────────────────────────────────────────────────────────────
-- D3: enrollments (3 policies → 3 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

-- Includes ghost names from base_schema.sql and lms_schema.sql
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can enroll themselves" ON enrollments;
DROP POLICY IF EXISTS "Instructors view enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view class enrollments" ON enrollments;
DROP POLICY IF EXISTS "Admins can do everything on enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollment" ON enrollments;

-- Students see own enrollments
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- Students can enroll themselves
CREATE POLICY "Students can insert own enrollment" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = student_id);

-- Instructors see enrollments for their classes
CREATE POLICY "Instructors can view class enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = enrollments.class_id AND classes.instructor_id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D4: assignments (3 policies → 2 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

-- Includes ghost name from base_schema.sql
DROP POLICY IF EXISTS "Instructors can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Students view assignments" ON assignments;
DROP POLICY IF EXISTS "Class participants can view assignments" ON assignments;
DROP POLICY IF EXISTS "Admins can do everything on assignments" ON assignments;

-- Instructors: full CRUD via class ownership
CREATE POLICY "Instructors can manage assignments" ON assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = auth.uid())
  );

-- Students: read-only via enrollment
CREATE POLICY "Enrolled students can view assignments" ON assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.class_id = assignments.class_id
      AND enrollments.student_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D5: submissions (6 policies → 4 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

-- Includes ghost names from base_schema.sql
DROP POLICY IF EXISTS "Students view own submissions" ON submissions;
DROP POLICY IF EXISTS "Students manage submissions" ON submissions;
DROP POLICY IF EXISTS "Students can manage own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can submit work" ON submissions;
DROP POLICY IF EXISTS "Instructors view submissions" ON submissions;
DROP POLICY IF EXISTS "Instructors view class submissions" ON submissions;
DROP POLICY IF EXISTS "Instructors can view class submissions" ON submissions;
DROP POLICY IF EXISTS "Instructors can grade class submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can do everything on submissions" ON submissions;

-- Students SELECT own submissions
CREATE POLICY "Students view own submissions" ON submissions
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id);

-- Students INSERT with enrollment check
CREATE POLICY "Students can submit work" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND EXISTS (SELECT 1 FROM enrollments WHERE enrollments.student_id = auth.uid() AND enrollments.class_id = submissions.class_id)
  );

-- Instructors SELECT via class ownership
CREATE POLICY "Instructors view class submissions" ON submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = submissions.class_id AND classes.instructor_id = auth.uid())
  );

-- Instructors UPDATE (grade) via class ownership
CREATE POLICY "Instructors can grade submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = submissions.class_id AND classes.instructor_id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D6: assets (2 policies → 2 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors can manage own assets" ON assets;
DROP POLICY IF EXISTS "Instructors manage assets" ON assets;
DROP POLICY IF EXISTS "View assets via class link" ON assets;

-- Instructors manage their own assets
CREATE POLICY "Instructors can manage own assets" ON assets
  FOR ALL TO authenticated
  USING (auth.uid() = instructor_id);

-- View assets via class link (instructor of class OR enrolled student)
CREATE POLICY "View assets via class link" ON assets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_assets
      WHERE class_assets.asset_id = assets.id
      AND (
        EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = auth.uid())
        OR
        EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = auth.uid())
      )
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D7: class_assets (2 policies → 2 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors manage class assets" ON class_assets;
DROP POLICY IF EXISTS "Students view class assets" ON class_assets;

CREATE POLICY "Instructors manage class assets" ON class_assets
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = auth.uid())
  );

CREATE POLICY "Students view class assets" ON class_assets
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D8: collections (1 policy)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors can manage own collections" ON collections;

CREATE POLICY "Instructors can manage own collections" ON collections
  FOR ALL TO authenticated
  USING (auth.uid() = instructor_id);


-- ────────────────────────────────────────────────────────────────────────────
-- D9: asset_tags (1 policy)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors can manage tags on their assets" ON asset_tags;

CREATE POLICY "Instructors can manage tags on their assets" ON asset_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_tags.asset_id AND assets.instructor_id = auth.uid())
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D10: tags (1 SELECT policy — INSERT policy already handled in Section C)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can select tags" ON tags;

CREATE POLICY "Authenticated users can select tags" ON tags
  FOR SELECT TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────────────────────
-- D11: notifications (2 policies — INSERT policy already handled in Section C)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;

CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────────────────
-- D12: instructor_events (4 policies → 3 clean policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own events" ON instructor_events;
DROP POLICY IF EXISTS "Users can update their own events" ON instructor_events;
DROP POLICY IF EXISTS "Users can delete their own events" ON instructor_events;
DROP POLICY IF EXISTS "Admins can do everything on instructor_events" ON instructor_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON instructor_events;

-- Full CRUD for own events
CREATE POLICY "Users can view own events" ON instructor_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- C1/C2 handled INSERT permissions, but we need standard CRUD here too if not covered
CREATE POLICY "Users can insert own events" ON instructor_events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events" ON instructor_events
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events" ON instructor_events
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────────────────
-- D13: instructor_todos (3 policies → 4 clean policies with INSERT)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own todos" ON instructor_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON instructor_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON instructor_todos;
DROP POLICY IF EXISTS "Users can insert their own todos" ON instructor_todos;

CREATE POLICY "Users can view own todos" ON instructor_todos
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos" ON instructor_todos
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos" ON instructor_todos
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos" ON instructor_todos
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────────────────────
-- D14: practicums (2 policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors can manage their own practicums" ON practicums;
DROP POLICY IF EXISTS "Public/Students can read practicums by cohort_code" ON practicums;

-- Instructors: full CRUD on own practicums
CREATE POLICY "Instructors can manage their own practicums" ON practicums
  FOR ALL TO authenticated
  USING (auth.uid() = instructor_id);

-- Authenticated users can read practicums (needed for join-by-code flow)
CREATE POLICY "Authenticated users can read practicums" ON practicums
  FOR SELECT TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────────────────────
-- D15: practicum_enrollments (2 policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Students can manage own enrollments" ON practicum_enrollments;
DROP POLICY IF EXISTS "Instructors can manage enrollments in their practicums" ON practicum_enrollments;

-- Students: full CRUD on own enrollments
CREATE POLICY "Students can manage own enrollments" ON practicum_enrollments
  FOR ALL TO authenticated
  USING (auth.uid() = student_id);

-- Instructors: full CRUD on enrollments in their practicums
CREATE POLICY "Instructors can manage enrollments in their practicums" ON practicum_enrollments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_enrollments.practicum_id
      AND practicums.instructor_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D16: practicum_logs (2 policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Students can manage their own logs" ON practicum_logs;
DROP POLICY IF EXISTS "Instructors can view and grade logs for their cohorts" ON practicum_logs;

-- Students: full CRUD on own logs
CREATE POLICY "Students can manage their own logs" ON practicum_logs
  FOR ALL TO authenticated
  USING (auth.uid() = student_id);

-- Instructors: full CRUD on logs in their practicums
CREATE POLICY "Instructors can view and grade logs for their cohorts" ON practicum_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_logs.practicum_id
      AND practicums.instructor_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────────────────────
-- D17: practicum_resources (2 policies)
-- ────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Instructors can manage resources in their practicums" ON practicum_resources;
DROP POLICY IF EXISTS "Students can view resources for enrolled practicums" ON practicum_resources;

-- Instructors: full CRUD on resources in their practicums
CREATE POLICY "Instructors can manage resources in their practicums" ON practicum_resources
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_resources.practicum_id
      AND practicums.instructor_id = auth.uid()
    )
  );

-- Students: read-only for enrolled practicums (approved status)
CREATE POLICY "Students can view resources for enrolled practicums" ON practicum_resources
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicum_enrollments
      WHERE practicum_enrollments.practicum_id = practicum_resources.practicum_id
      AND practicum_enrollments.student_id = auth.uid()
      AND practicum_enrollments.status = 'approved'
    )
  );


-- ============================================================================
-- SECTION E: ENSURE RLS IS ENABLED ON ALL TABLES
-- Some tables may have been created without RLS enabled.
-- ============================================================================

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS class_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS asset_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instructor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instructor_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pilot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS practicums ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS practicum_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS practicum_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS practicum_resources ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SECTION F: PREVENT PRIVILEGE ESCALATION
-- Protect the 'role' column in profiles from being changed by users.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is not changing, allow update (e.g. updating name/avatar)
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- If the role IS changing, force it back to the original value.
  -- This allows update queries that blindly send the full object (including role) to succeed,
  -- while silently preventing the role escalation.
  -- Note: Service role (admin) bypasses RLS/Triggers via BYPASSRLS if running as superuser,
  -- but if running as explicit service_role via API, we might need a bypass here.
  -- However, since simple client updates are the vector, this silent revert is safest.
  NEW.role := OLD.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

DROP TRIGGER IF EXISTS "prevent_role_change_trigger" ON profiles;
CREATE TRIGGER "prevent_role_change_trigger"
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();


-- ============================================================================
-- END OF SECURITY AUDIT FIX MIGRATION
-- ============================================================================
