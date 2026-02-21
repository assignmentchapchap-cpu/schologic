-- Migration: Lead Form Tracker
-- Date: 2026-02-21

-- 1. Contacts Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Instructor Invites (Rename from referrals)
-- We check if 'referrals' exists, and if it does, we rename it to 'instructor_invites'.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals') THEN
    ALTER TABLE referrals RENAME TO instructor_invites;
  END IF;
END $$;

-- In case 'instructor_invites' didn't exist (because 'referrals' didn't exist to rename):
CREATE TABLE IF NOT EXISTS instructor_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add new columns to instructor_invites
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'instructor_invites' AND COLUMN_NAME = 'recipient_name') THEN
    ALTER TABLE instructor_invites ADD COLUMN recipient_name TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'instructor_invites' AND COLUMN_NAME = 'recipient_phone') THEN
    ALTER TABLE instructor_invites ADD COLUMN recipient_phone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'instructor_invites' AND COLUMN_NAME = 'message') THEN
    ALTER TABLE instructor_invites ADD COLUMN message TEXT;
  END IF;
END $$;

-- 3. Row Level Security

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_invites ENABLE ROW LEVEL SECURITY;

-- 4. Superadmin Policies

-- Contact Submissions
DROP POLICY IF EXISTS "Superadmin full access to contact_submissions" ON contact_submissions;
CREATE POLICY "Superadmin full access to contact_submissions" ON contact_submissions 
  FOR SELECT 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');

-- Instructor Invites
-- Drop the old referral policy if we just renamed the table
DROP POLICY IF EXISTS "Superadmin full access to referrals" ON instructor_invites;

-- Create the new one
DROP POLICY IF EXISTS "Superadmin full access to instructor_invites" ON instructor_invites;
CREATE POLICY "Superadmin full access to instructor_invites" ON instructor_invites 
  FOR SELECT 
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'superadmin');
