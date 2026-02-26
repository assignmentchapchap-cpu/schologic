-- Migration: add_institution_type_to_pilot_requests 
-- Description: Adds the institution_type column to track whether a requested pilot is for a University, College, TVET, etc.

-- 1. Add the column (allowing nulls initially to avoid breaking existing rows) 
ALTER TABLE public.pilot_requests ADD COLUMN institution_type text;

-- 2. Optional: Set a default value for existing rows if desired (e.g., 'Unknown' or 'University') 
-- UPDATE public.pilot_requests SET institution_type = 'University' WHERE institution_type IS NULL;

-- 3. Add a comment for traceability 
COMMENT ON COLUMN public.pilot_requests.institution_type IS 'Tracks the type of institution (e.g., University, College, TVET) captured during lead inquiry.';