-- Add size_bytes column to assets table for quota tracking
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS size_bytes BIGINT DEFAULT 0;

-- Optional: Index for faster summation if needed (likely not critical for small scale yet)
-- CREATE INDEX IF NOT EXISTS idx_assets_size ON assets(size_bytes);
