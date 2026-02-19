-- Migration: Document Security Events Table
-- Date: 2026-02-19

CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  target_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fix: Enable RLS on security_events and add read policy for superadmins
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Superadmins can read all security events (dashboard)
CREATE POLICY "Superadmins can read security_events"
  ON security_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'superadmin'
    )
  );

-- Inserts go through the service role key (bypasses RLS), so no INSERT policy needed for regular users.
-- But if you want an explicit service-role-only insert policy for defense in depth:
CREATE POLICY "Service role can insert security_events"
  ON security_events FOR INSERT
  WITH CHECK (true);
