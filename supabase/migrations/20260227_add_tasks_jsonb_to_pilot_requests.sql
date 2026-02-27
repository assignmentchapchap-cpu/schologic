-- Migration: add tasks_jsonb and changelog_jsonb to pilot_requests
-- Description: Adds JSONB columns for per-tab activity checklists and edit history.

ALTER TABLE public.pilot_requests
ADD COLUMN IF NOT EXISTS tasks_jsonb JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.pilot_requests
ADD COLUMN IF NOT EXISTS changelog_jsonb JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.pilot_requests.tasks_jsonb IS 'Stores per-tab activity checklists as a JSON array. Each entry has id, tab, title, status, assigned_to, dates, and sort_order.';
COMMENT ON COLUMN public.pilot_requests.changelog_jsonb IS 'Stores per-tab edit history as a JSON object. Keys are tab names, values are arrays of {time, user, action} entries.';
