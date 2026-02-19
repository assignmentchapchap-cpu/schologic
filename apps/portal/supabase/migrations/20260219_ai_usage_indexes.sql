-- Migration: AI Usage Analytics Performance Indexes
-- Date: 2026-02-19
-- Description: Adds indexes to support efficient querying on api_usage_logs
-- for the /admin/ai-usage dashboard. Without these, the date-range aggregations
-- and instructor-level groupings scan the full table on every dashboard load.

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_instructor_id 
  ON api_usage_logs(instructor_id);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at 
  ON api_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_instructor_created 
  ON api_usage_logs(instructor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_usage_logs_model 
  ON api_usage_logs(model);
