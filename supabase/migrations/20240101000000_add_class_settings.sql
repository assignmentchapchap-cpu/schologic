-- Add settings column to classes table
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"granularity": "paragraph", "model": "roberta-large", "scoring_method": "weighted"}'::jsonb;

-- Comment on column
COMMENT ON COLUMN classes.settings IS 'Stores AI configuration: granularity, model, and scoring logic.';
