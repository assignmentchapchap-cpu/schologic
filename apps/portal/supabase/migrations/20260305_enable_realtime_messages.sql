-- Migration: Enable Supabase Realtime for the messages table
-- Date: 2026-03-05
-- Description:
--   The `messages` table was never added to the `supabase_realtime` publication.
--   Without this, all `postgres_changes` listeners on the client are silently ignored,
--   making real-time DM delivery impossible via the native Postgres CDC mechanism.
--   This single statement enables instant, reliable real-time messaging.

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
