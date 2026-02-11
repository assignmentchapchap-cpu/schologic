-- Migration: Data Integrity Remediation
-- Description: Enforces NOT NULL constraints and default values for critical fields to prevent type errors.

-- 1. assignments table
-- Backfill existing NULL titles (just in case)
UPDATE assignments SET title = 'Untitled Assignment' WHERE title IS NULL;
ALTER TABLE assignments ALTER COLUMN title SET NOT NULL;

-- Backfill NULL max_points
UPDATE assignments SET max_points = 100 WHERE max_points IS NULL;
ALTER TABLE assignments ALTER COLUMN max_points SET DEFAULT 100;
ALTER TABLE assignments ALTER COLUMN max_points SET NOT NULL;

-- Backfill NULL due_date (Set to 1 week from now to be safe/visible)
UPDATE assignments SET due_date = (NOW() + interval '7 days') WHERE due_date IS NULL;
ALTER TABLE assignments ALTER COLUMN due_date SET NOT NULL;

-- 2. submissions table
-- Backfill NULL created_at
UPDATE submissions SET created_at = NOW() WHERE created_at IS NULL;
ALTER TABLE submissions ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE submissions ALTER COLUMN created_at SET NOT NULL;
