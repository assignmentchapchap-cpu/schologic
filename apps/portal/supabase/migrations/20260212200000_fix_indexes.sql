-- =============================================================================
-- Migration: Fix Unindexed Foreign Keys & Drop Unused Indexes
-- Date: 2026-02-12
-- Purpose: Address Supabase linter warnings:
--   - 20x unindexed_foreign_keys (performance)
--   - 2x unused_index (cleanup)
--
-- Impact: Zero-risk — indexes only affect query performance, not behavior.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Section 1: Create missing FK indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- asset_tags
CREATE INDEX IF NOT EXISTS idx_asset_tags_tag_id
  ON asset_tags (tag_id);

-- assets (3 FKs)
CREATE INDEX IF NOT EXISTS idx_assets_collection_id
  ON assets (collection_id);

CREATE INDEX IF NOT EXISTS idx_assets_instructor_id
  ON assets (instructor_id);

CREATE INDEX IF NOT EXISTS idx_assets_parent_asset_id
  ON assets (parent_asset_id);

-- assignments
CREATE INDEX IF NOT EXISTS idx_assignments_class_id
  ON assignments (class_id);

-- class_assets (asset_id — class_id already covered by UNIQUE(class_id, asset_id))
CREATE INDEX IF NOT EXISTS idx_class_assets_asset_id
  ON class_assets (asset_id);

-- classes
CREATE INDEX IF NOT EXISTS idx_classes_instructor_id
  ON classes (instructor_id);

-- collections (2 FKs)
CREATE INDEX IF NOT EXISTS idx_collections_instructor_id
  ON collections (instructor_id);

CREATE INDEX IF NOT EXISTS idx_collections_parent_id
  ON collections (parent_id);

-- enrollments (class_id — student_id already covered by UNIQUE(student_id, class_id))
CREATE INDEX IF NOT EXISTS idx_enrollments_class_id
  ON enrollments (class_id);

-- instructor_events
CREATE INDEX IF NOT EXISTS idx_instructor_events_user_id
  ON instructor_events (user_id);

-- instructor_todos
CREATE INDEX IF NOT EXISTS idx_instructor_todos_user_id
  ON instructor_todos (user_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON notifications (user_id);

-- practicum_logs (practicum_id — student_id covered by composite)
CREATE INDEX IF NOT EXISTS idx_practicum_logs_practicum_id
  ON practicum_logs (practicum_id);

-- practicum_resources (uploaded_by — practicum_id already has resources_practicum_id_idx)
CREATE INDEX IF NOT EXISTS idx_practicum_resources_uploaded_by
  ON practicum_resources (uploaded_by);

-- practicums
CREATE INDEX IF NOT EXISTS idx_practicums_instructor_id
  ON practicums (instructor_id);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_institution_id
  ON profiles (institution_id);

-- submissions (3 FKs)
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id
  ON submissions (assignment_id);

CREATE INDEX IF NOT EXISTS idx_submissions_class_id
  ON submissions (class_id);

CREATE INDEX IF NOT EXISTS idx_submissions_student_id
  ON submissions (student_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Section 2: Drop unused indexes
-- ─────────────────────────────────────────────────────────────────────────────

-- pilot_requests: Both indexes have zero scans since creation.
-- Table is low-traffic and queries are rare.
DROP INDEX IF EXISTS idx_pilot_requests_status;
DROP INDEX IF EXISTS idx_pilot_requests_created_at;
