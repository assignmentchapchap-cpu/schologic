-- Migration: Email Infrastructure
-- Date: 2026-03-10
-- Description:
--   Creates the core tables for the integrated email system:
--   platform_emails, platform_audiences, platform_contacts, platform_templates.
--   Supports inbound/outbound email tracking, mailing lists, and reusable templates.

-- ═══════════════════════════════════════════════════════════════════
-- 1. platform_emails
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_emails (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resend_id       text UNIQUE,                        -- null for drafts
    message_id      text,                               -- from Resend webhook, used for threading
    direction       text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_email      text NOT NULL,
    to_emails       text[] NOT NULL DEFAULT '{}',
    cc_emails       text[] NOT NULL DEFAULT '{}',
    bcc_emails      text[] NOT NULL DEFAULT '{}',
    reply_to        text,                               -- for routing replies back into dashboard
    subject         text NOT NULL DEFAULT '',
    body_text       text,
    body_html       text,
    status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'sent', 'delivered', 'bounced', 'complained')),
    thread_id       uuid REFERENCES platform_emails(id) ON DELETE SET NULL,
    is_read         boolean NOT NULL DEFAULT false,
    attachments_jsonb jsonb DEFAULT '[]'::jsonb,         -- [{id, filename, content_type, storage_path}]
    metadata_jsonb  jsonb DEFAULT '{}'::jsonb,           -- open/click tracking
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_emails_direction   ON platform_emails (direction);
CREATE INDEX idx_platform_emails_status      ON platform_emails (status);
CREATE INDEX idx_platform_emails_thread_id   ON platform_emails (thread_id);
CREATE INDEX idx_platform_emails_created_at  ON platform_emails (created_at DESC);
CREATE INDEX idx_platform_emails_resend_id   ON platform_emails (resend_id) WHERE resend_id IS NOT NULL;
CREATE INDEX idx_platform_emails_from        ON platform_emails (from_email);

-- ═══════════════════════════════════════════════════════════════════
-- 2. platform_audiences
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_audiences (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resend_audience_id  text UNIQUE NOT NULL,            -- synced with Resend API
    name                text NOT NULL,
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- 3. platform_contacts
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_contacts (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resend_contact_id   text UNIQUE NOT NULL,            -- synced with Resend API
    audience_id         uuid NOT NULL REFERENCES platform_audiences(id) ON DELETE CASCADE,
    email               text NOT NULL,
    first_name          text,
    last_name           text,
    unsubscribed        boolean NOT NULL DEFAULT false,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_platform_contacts_audience  ON platform_contacts (audience_id);
CREATE INDEX idx_platform_contacts_email     ON platform_contacts (email);

-- ═══════════════════════════════════════════════════════════════════
-- 4. platform_templates
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS platform_templates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name            text NOT NULL,
    subject         text NOT NULL DEFAULT '',
    content_html    text NOT NULL DEFAULT '',
    variables       text[] NOT NULL DEFAULT '{}',        -- expected variable keys, e.g. {'firstName','institution'}
    category        text,                                -- 'transactional', 'marketing', etc.
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- 5. RLS Policies (superadmin-only access)
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE platform_emails    ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_audiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_templates ENABLE ROW LEVEL SECURITY;

-- platform_emails: superadmin full access
CREATE POLICY "superadmin_emails_select" ON platform_emails
    FOR SELECT USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );
CREATE POLICY "superadmin_emails_insert" ON platform_emails
    FOR INSERT WITH CHECK (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );
CREATE POLICY "superadmin_emails_update" ON platform_emails
    FOR UPDATE USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );
CREATE POLICY "superadmin_emails_delete" ON platform_emails
    FOR DELETE USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );

-- platform_audiences: superadmin full access
CREATE POLICY "superadmin_audiences_all" ON platform_audiences
    FOR ALL USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );

-- platform_contacts: superadmin full access
CREATE POLICY "superadmin_contacts_all" ON platform_contacts
    FOR ALL USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );

-- platform_templates: superadmin full access
CREATE POLICY "superadmin_templates_all" ON platform_templates
    FOR ALL USING (
        (SELECT (raw_app_meta_data ->> 'role') FROM auth.users WHERE id = auth.uid()) = 'superadmin'
    );

-- Allow the webhook API route (service_role) to insert/update emails without auth
-- The webhook handler uses the service_role key, which bypasses RLS by default.
-- No additional policy needed for the webhook endpoint.
