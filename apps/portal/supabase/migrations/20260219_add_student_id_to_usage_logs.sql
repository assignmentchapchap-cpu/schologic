-- Migration: Add student_id to api_usage_logs for proper attribution
-- Date: 2026-02-19
-- When a student submits work, AI detection runs under their session.
-- instructor_id should hold the CLASS instructor (cost owner).
-- student_id tracks who actually triggered the call (for the student breakdown view).

ALTER TABLE api_usage_logs
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_student_id
  ON api_usage_logs(student_id);
-- No RLS change needed: existing policies cover the table; logAiUsage
-- uses the service-role key and bypasses RLS for all inserts.
