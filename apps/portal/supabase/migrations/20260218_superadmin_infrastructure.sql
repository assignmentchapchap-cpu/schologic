-- Migration: Superadmin Infrastructure & Profile Enhancements
-- Date: 2026-02-18

-- 1. Profile Schema Updates
DO $$ 
BEGIN 
  -- Add new columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'professional_affiliation') THEN
    ALTER TABLE profiles ADD COLUMN professional_affiliation TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'is_active') THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'is_demo') THEN
    ALTER TABLE profiles ADD COLUMN is_demo BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'demo_converted_at') THEN
    ALTER TABLE profiles ADD COLUMN demo_converted_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'referred_by') THEN
    ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id);
  END IF;

  -- Update Role Check Constraint
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('instructor', 'student', 'superadmin'));
END $$;

-- 1.5 Sync Trigger for Profile Enhancements
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    professional_affiliation,
    phone,
    country,
    is_active,
    is_demo
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'professional_affiliation',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    CASE 
      WHEN (new.raw_user_meta_data->>'is_active')::boolean IS FALSE THEN false 
      ELSE true 
    END,
    CASE 
      WHEN (new.raw_user_meta_data->>'is_demo')::boolean IS TRUE THEN true 
      ELSE false 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- 2. Telemetry Tables
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES profiles(id),
  endpoint TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Engagement Tables
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  subject TEXT, -- New subject column
  content TEXT NOT NULL,
  parent_id UUID REFERENCES messages(id),
  broadcast_id UUID, -- For grouping bulk messages for reports
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT DEFAULT 'general',
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in-progress, resolved, planned
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- sent, signed-up, converted
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Performance Indexes (Critical)
CREATE INDEX IF NOT EXISTS idx_enrollments_student_class ON enrollments(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_is_demo ON api_usage_logs(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_demo ON profiles(is_demo);
CREATE INDEX IF NOT EXISTS idx_profiles_converted_at ON profiles(demo_converted_at);

-- 5. Row Level Security (RLS)

-- Enable RLS on new tables
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Messages Policies
-- 1. Everyone can read messages where they are sender or receiver
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can mark own messages as read" ON messages;
CREATE POLICY "Users can mark own messages as read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- 2. Insert Policy (Role-Based Logic)
DROP POLICY IF EXISTS "Messaging permissions" ON messages;
CREATE POLICY "Messaging permissions" ON messages
  FOR INSERT WITH CHECK (
    -- Superadmin can message anyone
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin'
    OR
    -- Instructors can message superadmins or their own students
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'instructor'
      AND
      (
        ((SELECT role FROM profiles WHERE id = receiver_id) = 'superadmin')
        OR
        EXISTS (
          -- Check if the receiver is a student enrolled in one of the instructor's classes
          SELECT 1 FROM enrollments e
          JOIN classes c ON e.class_id = c.id
          WHERE e.student_id = receiver_id AND c.instructor_id = auth.uid()
        )
      )
    )
    OR
    -- Students (and others) can REPLY to messages sent TO them
    (
      parent_id IS NOT NULL
      AND
      EXISTS (
        SELECT 1 FROM messages m
        WHERE m.id = parent_id AND m.receiver_id = auth.uid()
      )
    )
  );

-- Admin Overrides (Allow Superadmins to see everything)
DROP POLICY IF EXISTS "Superadmin manage all profiles" ON profiles;
CREATE POLICY "Superadmin manage all profiles" ON profiles FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to telemetry" ON api_usage_logs;
CREATE POLICY "Superadmin full access to telemetry" ON api_usage_logs FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to errors" ON system_errors;
CREATE POLICY "Superadmin full access to errors" ON system_errors FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to messages" ON messages;
CREATE POLICY "Superadmin full access to messages" ON messages FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin manage feedback" ON feedback;
CREATE POLICY "Superadmin manage feedback" ON feedback FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin full access to referrals" ON referrals;
CREATE POLICY "Superadmin full access to referrals" ON referrals FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

DROP POLICY IF EXISTS "Superadmin manage pilot requests" ON pilot_requests;
CREATE POLICY "Superadmin manage pilot requests" ON pilot_requests FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

-- Feedback Policy (Users can see and insert own feedback)
DROP POLICY IF EXISTS "Users manage own feedback" ON feedback;
CREATE POLICY "Users manage own feedback" ON feedback
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
