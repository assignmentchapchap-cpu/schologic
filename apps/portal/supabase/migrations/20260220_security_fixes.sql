-- Migration: Secure Function Search Path, Security Events, and Notifications
-- Date: 2026-02-20
-- Impact: Fixes multiple security warnings (Lints 0011, 0024)

-- ============================================================================
-- PART 1: Secure Function Search Path (Lint 0011)
-- ============================================================================
-- Context: 
-- The function `sync_profile_role_to_metadata` is SECURITY DEFINER.
-- Setting `search_path = public` prevents malicious schema hijacking.

ALTER FUNCTION public.sync_profile_role_to_metadata() SET search_path = public;


-- ============================================================================
-- PART 2: Secure Security Events (Lint 0024)
-- ============================================================================
-- Context: 
-- Remove public (anonymous) insert access to `security_events`.
-- The Service Role automatically bypasses RLS, so it does NOT need a policy.

DROP POLICY IF EXISTS "Service role can insert security_events" ON public.security_events;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- PART 3: Secure Notifications & Optimizations (Lint 0024 + Performance)
-- ============================================================================
-- Context: 
-- Remove policy allowing "Any Authenticated User" to insert notifications.
-- Replace with a Scoped Policy allowing only Class Participants (Instructor<->Student).
--
-- Performance:
-- Added indexes on `messages(sender_id)` and `classes(instructor_id)` to speed up RLS checks.

-- 3.1 Create Indexes for RLS Performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_instructor_id ON public.classes(instructor_id);

-- 3.2 Drop Insecure Policies
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Class participants can send notifications" ON public.notifications;

-- 3.3 Create Scoped Policy
CREATE POLICY "Class participants can send notifications" ON public.notifications
FOR INSERT WITH CHECK (
  -- 1. Instructor notifying their Student
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN classes c ON e.class_id = c.id
    WHERE e.student_id = notifications.user_id -- Recipient is student
    AND c.instructor_id = auth.uid()         -- Sender is instructor
  )
  OR
  -- 2. Student notifying their Instructor
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN classes c ON e.class_id = c.id
    WHERE c.instructor_id = notifications.user_id -- Recipient is instructor
    AND e.student_id = auth.uid()             -- Sender is student
  )
  OR
  -- 3. Self-notification (e.g. reminders)
  auth.uid() = user_id
);

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
