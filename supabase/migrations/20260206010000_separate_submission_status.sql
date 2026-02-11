-- 1. Create 'submission_status' (Draft vs Submitted)
ALTER TABLE practicum_logs 
ADD COLUMN submission_status text NOT NULL DEFAULT 'draft' 
CHECK (submission_status IN ('draft', 'submitted'));

-- 2. Create 'instructor_status' (Read vs Unread)
ALTER TABLE practicum_logs 
ADD COLUMN instructor_status text NOT NULL DEFAULT 'unread' 
CHECK (instructor_status IN ('unread', 'read'));

-- 3. Reset 'supervisor_status' to strictly verification (Pending/Verified/Rejected)
-- First drop the old constraint if exists (safe retry)
ALTER TABLE practicum_logs DROP CONSTRAINT IF EXISTS practicum_logs_supervisor_status_check;

-- Re-add the proper constraint
ALTER TABLE practicum_logs 
ADD CONSTRAINT practicum_logs_supervisor_status_check 
CHECK (supervisor_status IN ('pending', 'verified', 'rejected'));
