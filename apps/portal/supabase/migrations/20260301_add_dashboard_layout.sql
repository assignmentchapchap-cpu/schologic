-- Migration: Add dashboard_layout_jsonb to pilot_requests
-- Created: 2026-03-01

ALTER TABLE public.pilot_requests
ADD COLUMN IF NOT EXISTS dashboard_layout_jsonb JSONB DEFAULT '{}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN public.pilot_requests.dashboard_layout_jsonb IS 'Stores admin dashboard layout (view_type) and selected widgets.';
