
-- Migration: Add 'draft' status to practicum_logs
-- Purpose: Enable Draft -> Submitted -> Verified workflow for logs.

DO $$
BEGIN
    -- Drop the existing check constraint for supervisor_status
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'practicum_logs_supervisor_status_check') THEN
        ALTER TABLE practicum_logs DROP CONSTRAINT practicum_logs_supervisor_status_check;
    END IF;

    -- Re-add the constraint with 'draft' included
    ALTER TABLE practicum_logs 
    ADD CONSTRAINT practicum_logs_supervisor_status_check 
    CHECK (supervisor_status IN ('draft', 'pending', 'verified', 'rejected'));
    
    -- Also ensure we have a 'submitted_at' or we just use updated_at/created_at logic. 
    -- For now, status is sufficient.

END $$;
