-- Migration: Strict Ping-Pong Messaging Model
-- Date: 2026-02-18
-- Description: 
-- 1. Students can only reply to messages they received.
-- 2. Students can only send ONE reply per received message (anti-spam).
-- 3. Aligns with app_metadata role claims.

-- Drop existing messaging permissions
DROP POLICY IF EXISTS "Messaging permissions" ON public.messages;

CREATE POLICY "Messaging permissions" 
ON public.messages
FOR INSERT 
TO authenticated
WITH CHECK (
  -- 1. Superadmins can message anyone
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin'
  OR
  -- 2. Instructors can message superadmins or their own students
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
  -- 3. Students: Ping-Pong Reply Model
  (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'student'
    AND
    parent_id IS NOT NULL 
    AND
    -- Condition A: The parent message was sent TO the student
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.id = parent_id AND m.receiver_id = auth.uid()
    )
    AND
    -- Condition B: The student has NOT already replied to this message
    -- (Enforces the "Pong" must be followed by an instructor "Ping")
    NOT EXISTS (
      SELECT 1 FROM public.messages m
      WHERE m.parent_id = parent_id AND m.sender_id = auth.uid()
    )
  )
);

-- Ensure sender_id always matches the authenticated user
DROP POLICY IF EXISTS "Ensure sender_id is auth.uid" ON public.messages;
CREATE POLICY "Ensure sender_id is auth.uid" 
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);
