-- Add settings column if it doesn't exist, or update defaults if it does
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"model": "PirateXX/AI-Content-Detector", "granularity": "paragraph", "scoring_method": "weighted"}'::jsonb;

-- Update existing rows that have no settings or where settings are null
UPDATE classes 
SET settings = '{"model": "PirateXX/AI-Content-Detector", "granularity": "paragraph", "scoring_method": "weighted"}'::jsonb 
WHERE settings IS NULL;

-- Ensure future rows get this default (redundant if ADD COLUMN successfully set default, but good for safety if column existed without default)
ALTER TABLE classes 
ALTER COLUMN settings SET DEFAULT '{"model": "PirateXX/AI-Content-Detector", "granularity": "paragraph", "scoring_method": "weighted"}'::jsonb;
