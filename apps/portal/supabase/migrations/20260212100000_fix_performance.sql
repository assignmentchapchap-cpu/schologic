-- ==========================================================================
-- PERFORMANCE FIX MIGRATION
-- ==========================================================================
-- Fixes 40 auth_rls_initplan warnings: wrap auth.uid() in (select auth.uid())
-- Fixes 5 multiple_permissive_policies warnings via SELECT consolidation
--
-- 9 multiple_permissive_policies warnings for practicum_enrollments/practicum_logs
-- are inherent (two user roles need FOR ALL) and accepted as-is.
-- ==========================================================================

BEGIN;

-- ══════════════════════════════════════════════════════════════════════════
-- 1. profiles (3 policies: UPDATE, DELETE, INSERT)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- profiles SELECT stays as USING(true) — no auth.uid() call, no initplan issue.


-- ══════════════════════════════════════════════════════════════════════════
-- 2. classes (4 policies)
--    Also fixes multiple_permissive_policies: split FOR ALL into per-op
--    + merge instructor SELECT into "Class visibility"
-- ══════════════════════════════════════════════════════════════════════════

-- Drop existing
DROP POLICY IF EXISTS "Class visibility" ON classes;
DROP POLICY IF EXISTS "Instructors can create classes" ON classes;
DROP POLICY IF EXISTS "Instructors can update own classes" ON classes;
DROP POLICY IF EXISTS "Instructors can delete own classes" ON classes;

-- Unified SELECT: Instructor sees own OR student sees enrolled
-- (No multiple_permissive_policies issue since this is the only SELECT policy)
CREATE POLICY "Class visibility" ON classes
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = instructor_id
    OR public.is_student_of_class(id)
  );

-- Instructor write ops (separate policies, each with initplan fix)
CREATE POLICY "Instructors can create classes" ON classes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can update own classes" ON classes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can delete own classes" ON classes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = instructor_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 3. enrollments (3 policies → 3 policies, consolidate 2 SELECTs into 1)
--    Fixes multiple_permissive_policies: merge student + instructor SELECT
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Instructors can view class enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can insert own enrollment" ON enrollments;

-- Unified SELECT: student sees own OR instructor sees via class ownership
CREATE POLICY "View enrollments" ON enrollments
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = student_id
    OR EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = enrollments.class_id
      AND classes.instructor_id = (select auth.uid())
    )
  );

-- Students can enroll themselves
CREATE POLICY "Students can insert own enrollment" ON enrollments
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = student_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 4. assignments (2 policies → 3 policies, split FOR ALL + consolidate SELECT)
--    Fixes multiple_permissive_policies: remove implicit SELECT from FOR ALL
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Enrolled students can view assignments" ON assignments;

-- Unified SELECT: instructor sees via class ownership OR enrolled student sees
CREATE POLICY "View assignments" ON assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = assignments.class_id
      AND classes.instructor_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.class_id = assignments.class_id
      AND enrollments.student_id = (select auth.uid())
    )
  );

-- Instructor write ops
CREATE POLICY "Instructors can create assignments" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = (select auth.uid()))
  );

CREATE POLICY "Instructors can update assignments" ON assignments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = (select auth.uid()))
  );

CREATE POLICY "Instructors can delete assignments" ON assignments
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = (select auth.uid()))
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 5. submissions (4 policies → 4 policies, consolidate 2 SELECTs into 1)
--    Fixes multiple_permissive_policies: merge student + instructor SELECT
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Students view own submissions" ON submissions;
DROP POLICY IF EXISTS "Students can submit work" ON submissions;
DROP POLICY IF EXISTS "Instructors view class submissions" ON submissions;
DROP POLICY IF EXISTS "Instructors can grade submissions" ON submissions;

-- Unified SELECT: student sees own OR instructor sees via class
CREATE POLICY "View submissions" ON submissions
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = student_id
    OR EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = submissions.class_id
      AND classes.instructor_id = (select auth.uid())
    )
  );

-- Students INSERT with enrollment check
CREATE POLICY "Students can submit work" ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = student_id
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.student_id = (select auth.uid())
      AND enrollments.class_id = submissions.class_id
    )
  );

-- Instructors UPDATE (grade) via class ownership
CREATE POLICY "Instructors can grade submissions" ON submissions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = submissions.class_id
      AND classes.instructor_id = (select auth.uid())
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 6. assets (2 policies → 4 policies, split FOR ALL + consolidate SELECT)
--    Fixes multiple_permissive_policies: remove implicit SELECT from FOR ALL
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage own assets" ON assets;
DROP POLICY IF EXISTS "View assets via class link" ON assets;

-- Unified SELECT: instructor sees own assets OR anyone sees via class link
CREATE POLICY "View assets" ON assets
  FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = instructor_id
    OR EXISTS (
      SELECT 1 FROM class_assets
      WHERE class_assets.asset_id = assets.id
      AND (
        EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = (select auth.uid()))
        OR
        EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = (select auth.uid()))
      )
    )
  );

-- Instructor write ops
CREATE POLICY "Instructors can create assets" ON assets
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can update own assets" ON assets
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can delete own assets" ON assets
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = instructor_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 7. class_assets (2 policies → 4 policies, split FOR ALL + consolidate SELECT)
--    Fixes multiple_permissive_policies: remove implicit SELECT from FOR ALL
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors manage class assets" ON class_assets;
DROP POLICY IF EXISTS "Students view class assets" ON class_assets;

-- Unified SELECT: instructor via class ownership OR enrolled student
CREATE POLICY "View class assets" ON class_assets
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = (select auth.uid()))
    OR
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = (select auth.uid()))
  );

-- Instructor write ops
CREATE POLICY "Instructors can create class assets" ON class_assets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = (select auth.uid()))
  );

CREATE POLICY "Instructors can update class assets" ON class_assets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = (select auth.uid()))
  );

CREATE POLICY "Instructors can delete class assets" ON class_assets
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = (select auth.uid()))
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 8. collections (1 policy — initplan fix only)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage own collections" ON collections;
CREATE POLICY "Instructors can manage own collections" ON collections
  FOR ALL TO authenticated
  USING ((select auth.uid()) = instructor_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 9. asset_tags (1 policy — initplan fix only)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage tags on their assets" ON asset_tags;
CREATE POLICY "Instructors can manage tags on their assets" ON asset_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM assets WHERE assets.id = asset_tags.asset_id AND assets.instructor_id = (select auth.uid()))
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 10. tags (1 policy — initplan fix only on INSERT from Section C)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can create tags" ON tags;
CREATE POLICY "Instructors can create tags" ON tags
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'instructor')
  );

-- tags SELECT stays as USING(true) — no auth.uid() call, no initplan issue.


-- ══════════════════════════════════════════════════════════════════════════
-- 11. notifications (2 policies — initplan fix only)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- notifications INSERT stays as WITH CHECK(true) — no auth.uid() call, no initplan issue.


-- ══════════════════════════════════════════════════════════════════════════
-- 12. instructor_events (4 policies — initplan fix only)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own events" ON instructor_events;
CREATE POLICY "Users can view own events" ON instructor_events
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own events" ON instructor_events;
CREATE POLICY "Users can insert own events" ON instructor_events
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own events" ON instructor_events;
CREATE POLICY "Users can update own events" ON instructor_events
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own events" ON instructor_events;
CREATE POLICY "Users can delete own events" ON instructor_events
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 13. instructor_todos (4 policies — initplan fix only)
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Users can view own todos" ON instructor_todos;
CREATE POLICY "Users can view own todos" ON instructor_todos
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own todos" ON instructor_todos;
CREATE POLICY "Users can insert own todos" ON instructor_todos
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own todos" ON instructor_todos;
CREATE POLICY "Users can update own todos" ON instructor_todos
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own todos" ON instructor_todos;
CREATE POLICY "Users can delete own todos" ON instructor_todos
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 14. practicums (2 policies, split FOR ALL + keep public SELECT)
--     Fixes multiple_permissive_policies: remove implicit SELECT from FOR ALL
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage their own practicums" ON practicums;
DROP POLICY IF EXISTS "Authenticated users can read practicums" ON practicums;

-- Unified SELECT: anyone authenticated can read (join-by-code flow)
-- Instructor's own practicums are included in this broad USING(true)
CREATE POLICY "Authenticated users can read practicums" ON practicums
  FOR SELECT TO authenticated
  USING (true);

-- Instructor write ops only
CREATE POLICY "Instructors can create practicums" ON practicums
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can update own practicums" ON practicums
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = instructor_id);

CREATE POLICY "Instructors can delete own practicums" ON practicums
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = instructor_id);


-- ══════════════════════════════════════════════════════════════════════════
-- 15. practicum_enrollments (2 FOR ALL policies — initplan fix only)
--     multiple_permissive_policies accepted: two roles need full CRUD
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Students can manage own enrollments" ON practicum_enrollments;
CREATE POLICY "Students can manage own enrollments" ON practicum_enrollments
  FOR ALL TO authenticated
  USING ((select auth.uid()) = student_id);

DROP POLICY IF EXISTS "Instructors can manage enrollments in their practicums" ON practicum_enrollments;
CREATE POLICY "Instructors can manage enrollments in their practicums" ON practicum_enrollments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_enrollments.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 16. practicum_logs (2 FOR ALL policies — initplan fix only)
--     multiple_permissive_policies accepted: two roles need full CRUD
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Students can manage their own logs" ON practicum_logs;
CREATE POLICY "Students can manage their own logs" ON practicum_logs
  FOR ALL TO authenticated
  USING ((select auth.uid()) = student_id);

DROP POLICY IF EXISTS "Instructors can view and grade logs for their cohorts" ON practicum_logs;
CREATE POLICY "Instructors can view and grade logs for their cohorts" ON practicum_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_logs.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
  );


-- ══════════════════════════════════════════════════════════════════════════
-- 17. practicum_resources (2 policies → 4 policies, split FOR ALL + consolidate SELECT)
--     Fixes multiple_permissive_policies: remove implicit SELECT from FOR ALL
-- ══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Instructors can manage resources in their practicums" ON practicum_resources;
DROP POLICY IF EXISTS "Students can view resources for enrolled practicums" ON practicum_resources;

-- Unified SELECT: instructor sees via practicum ownership OR approved enrolled student
CREATE POLICY "View practicum resources" ON practicum_resources
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_resources.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM practicum_enrollments
      WHERE practicum_enrollments.practicum_id = practicum_resources.practicum_id
      AND practicum_enrollments.student_id = (select auth.uid())
      AND practicum_enrollments.status = 'approved'
    )
  );

-- Instructor write ops
CREATE POLICY "Instructors can create practicum resources" ON practicum_resources
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_resources.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
  );

CREATE POLICY "Instructors can update practicum resources" ON practicum_resources
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_resources.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
  );

CREATE POLICY "Instructors can delete practicum resources" ON practicum_resources
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM practicums
      WHERE practicums.id = practicum_resources.practicum_id
      AND practicums.instructor_id = (select auth.uid())
    )
  );

COMMIT;
