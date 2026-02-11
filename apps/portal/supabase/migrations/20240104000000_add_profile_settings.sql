-- Add settings column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"model": "PirateXX/AI-Content-Detector", "granularity": "paragraph", "scoring_method": "weighted"}'::jsonb;

-- Update existing profiles that have no settings
UPDATE profiles 
SET settings = '{"model": "PirateXX/AI-Content-Detector", "granularity": "paragraph", "scoring_method": "weighted"}'::jsonb 
WHERE settings IS NULL;
