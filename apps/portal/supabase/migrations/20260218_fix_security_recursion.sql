-- Migration: Secure RLS & Role Synchronization (Final)
-- Date: 2026-02-18
-- Description: 
-- 1. Uses auth.jwt() -> app_metadata to avoid recursion SAFELY (satisfies Lint 0015).
-- 2. Implements automatic sync of roles to raw_app_meta_data (admin-only).

-- 1. Fix Profiles Table RLS
DROP POLICY IF EXISTS "Superadmin manage all profiles" ON public.profiles;
CREATE POLICY "Superadmin manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
);

-- Ensure fallback visibility for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (true);

-- 2. Fix Messages Table RLS
DROP POLICY IF EXISTS "Messaging permissions" ON public.messages;
CREATE POLICY "Messaging permissions" 
ON public.messages
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
  OR
  (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'instructor'
    AND
    (
      EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = receiver_id AND p.role = 'superadmin')
      OR
      EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.classes c ON e.class_id = c.id
        WHERE e.student_id = receiver_id AND c.instructor_id = auth.uid()
      )
    )
  )
  OR
  (
    parent_id IS NOT NULL
    AND
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = parent_id AND m.receiver_id = auth.uid()
    )
  )
);

-- Superadmin full access to messages
DROP POLICY IF EXISTS "Superadmin full access to messages" ON public.messages;
CREATE POLICY "Superadmin full access to messages" 
ON public.messages 
FOR SELECT 
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
);

-- 3. Fix Telemetry & Feedback recursive checks
DROP POLICY IF EXISTS "Superadmin full access to telemetry" ON public.api_usage_logs;
CREATE POLICY "Superadmin full access to telemetry" ON public.api_usage_logs FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to errors" ON public.system_errors;
CREATE POLICY "Superadmin full access to errors" ON public.system_errors FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

DROP POLICY IF EXISTS "Superadmin manage feedback" ON public.feedback;
CREATE POLICY "Superadmin manage feedback" ON public.feedback FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to referrals" ON public.referrals;
CREATE POLICY "Superadmin full access to referrals" ON public.referrals FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

DROP POLICY IF EXISTS "Superadmin manage pilot requests" ON public.pilot_requests;
CREATE POLICY "Superadmin manage pilot requests" ON public.pilot_requests FOR ALL USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin');

-- 4. Role Synchronization Trigger (Sync Profile -> app_metadata)
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users app_metadata when profile role changes
  -- raw_app_meta_data is the secure alternative to raw_user_meta_data
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS "on_profile_role_sync" ON public.profiles;
CREATE TRIGGER "on_profile_role_sync"
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role_to_metadata();

-- 5. Backfill: Sync existing roles to app_metadata for security
UPDATE auth.users u
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE u.id = p.id 
AND (u.raw_app_meta_data->>'role' IS DISTINCT FROM p.role);
