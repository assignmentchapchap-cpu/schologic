-- Migration to add 'draft' to the allowable statuses for practicum_enrollments
-- Problem: The original check constraint only allowed ('pending', 'approved', 'rejected')
-- This prevented students from joining with the new V2 'draft' logic.

DO $$
BEGIN
    -- Drop the existing check constraint
    -- Note: The name 'practicum_enrollments_status_check' is the standard auto-generated name 
    -- but if it varies we might need to find it dynamically. Standard Supabase/Postgres naming is typically <table_name>_<column_name>_check.
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'practicum_enrollments_status_check') THEN
        ALTER TABLE practicum_enrollments DROP CONSTRAINT practicum_enrollments_status_check;
    END IF;

    -- Re-add the constraint with 'draft' included
    ALTER TABLE practicum_enrollments 
    ADD CONSTRAINT practicum_enrollments_status_check 
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

END $$;
