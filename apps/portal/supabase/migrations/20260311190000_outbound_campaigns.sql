-- Create prospects table
CREATE TABLE IF NOT EXISTS public.prospects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    location TEXT,
    type TEXT CHECK (type IN ('tvet', 'college', 'university', 'other')),
    ownership TEXT CHECK (ownership IN ('private', 'public', 'NGO', 'other')),
    campuses TEXT,
    has_elearning BOOLEAN,
    contact_name TEXT,
    job_title TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'drafted', 'scheduled', 'contacted', 'replied', 'bounced')),
    research_data JSONB DEFAULT '{}'::jsonb,
    list_id UUID REFERENCES public.platform_audiences(id) ON DELETE CASCADE,
    reply_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for prospects
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- Policies for prospects (Superadmin access only, based on assumed platform architecture)
CREATE POLICY "Superadmins can read prospects" ON public.prospects
    FOR SELECT USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
    );

CREATE POLICY "Superadmins can insert prospects" ON public.prospects
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
    );

CREATE POLICY "Superadmins can update prospects" ON public.prospects
    FOR UPDATE USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
    );

CREATE POLICY "Superadmins can delete prospects" ON public.prospects
    FOR DELETE USING (
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'superadmin' OR
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
    );

-- Trigger for prospects updated_at
CREATE OR REPLACE FUNCTION update_prospects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prospects_updated_at
    BEFORE UPDATE ON public.prospects
    FOR EACH ROW
    EXECUTE FUNCTION update_prospects_updated_at();

-- Add outbound / ai tracking columns to platform_emails
ALTER TABLE public.platform_emails 
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS ai_generated_from_template_id UUID REFERENCES public.platform_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS thread_message_id TEXT,
    ADD COLUMN IF NOT EXISTS in_reply_to TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prospects_list_id ON public.prospects(list_id);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON public.prospects(status);
CREATE INDEX IF NOT EXISTS idx_emails_scheduled_at ON public.platform_emails(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_emails_in_reply_to ON public.platform_emails(in_reply_to);
CREATE INDEX IF NOT EXISTS idx_emails_thread_message_id ON public.platform_emails(thread_message_id);
CREATE INDEX IF NOT EXISTS idx_emails_prospect_id ON public.platform_emails(prospect_id);
