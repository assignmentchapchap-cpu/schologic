-- Migration: Add pilot_requests table for institutional lead capture
-- Created: 2026-01-30

CREATE TABLE IF NOT EXISTS pilot_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  job_title TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution_size TEXT NOT NULL,
  current_lms TEXT NOT NULL,
  primary_interest TEXT[] NOT NULL,
  virtual_learning BOOLEAN NOT NULL DEFAULT false,
  other_info TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (admin-only access via service role)
ALTER TABLE pilot_requests ENABLE ROW LEVEL SECURITY;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_pilot_requests_status ON pilot_requests(status);
CREATE INDEX IF NOT EXISTS idx_pilot_requests_created_at ON pilot_requests(created_at DESC);
