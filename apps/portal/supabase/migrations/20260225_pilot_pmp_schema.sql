-- Migration: Extend pilot_requests and create pilot_team_members for Pilot Management Portal
-- Created: 2026-02-25

-- 1. Extend existing pilot_requests table
ALTER TABLE public.pilot_requests
ADD COLUMN IF NOT EXISTS champion_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS branding_jsonb JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS scope_jsonb JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS modules_jsonb JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS permissions_jsonb JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS kpis_jsonb JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS completed_tabs_jsonb JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS is active (already added in previous migration, but good practice)
ALTER TABLE public.pilot_requests ENABLE ROW LEVEL SECURITY;

-- 2. Create pilot_team_members table
CREATE TABLE IF NOT EXISTS public.pilot_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_request_id UUID NOT NULL REFERENCES public.pilot_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_champion BOOLEAN NOT NULL DEFAULT false,
  tab_permissions_jsonb JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pilot_request_id, user_id),
  status TEXT DEFAULT 'invited',
  joined_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ
);

-- Enable RLS for team members
ALTER TABLE public.pilot_team_members ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pilot_team_members_pilot_request_id ON public.pilot_team_members(pilot_request_id);
CREATE INDEX IF NOT EXISTS idx_pilot_team_members_user_id ON public.pilot_team_members(user_id);

-- 3. Row Level Security Policies

-- pilot_requests: 
-- Superadmin can do everything (assumes existing superadmin policy covers or we add one explicit)
-- Team members can view the request they belong to.
CREATE POLICY "Team members can view their pilot request"
ON public.pilot_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.pilot_team_members 
    WHERE pilot_request_id = public.pilot_requests.id 
    AND user_id = auth.uid()
  )
);

-- Team members can update the request they belong to.
-- NOTE: Granular RBAC validation (parsing jsonb per tab) should ideally be handled via 
-- backend logic/RPCs rather than pure SQL RLS to prevent massive complexity, but this
-- ensures they can only touch their *own* pilot_request.
CREATE POLICY "Team members can update their pilot request"
ON public.pilot_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pilot_team_members 
    WHERE pilot_request_id = public.pilot_requests.id 
    AND user_id = auth.uid()
  )
);

-- pilot_team_members:
-- Users can view their own membership records (and probably others in the same pilot)
CREATE POLICY "Users can view team members of their pilot"
ON public.pilot_team_members FOR SELECT
USING (
  pilot_request_id IN (
    SELECT pilot_request_id FROM public.pilot_team_members 
    WHERE user_id = auth.uid()
  )
);

-- Only Champions can insert new team members into their pilot
CREATE POLICY "Champions can invite team members"
ON public.pilot_team_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pilot_team_members 
    WHERE pilot_request_id = pilot_team_members.pilot_request_id 
    AND user_id = auth.uid()
    AND is_champion = true
  )
);

-- Only Champions can update team member permissions within their pilot
CREATE POLICY "Champions can update team permissions"
ON public.pilot_team_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.pilot_team_members 
    WHERE pilot_request_id = public.pilot_team_members.pilot_request_id 
    AND user_id = auth.uid()
    AND is_champion = true
  )
);

-- Only Champions can remove members
CREATE POLICY "Champions can remove members"
ON public.pilot_team_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.pilot_team_members 
    WHERE pilot_request_id = public.pilot_team_members.pilot_request_id 
    AND user_id = auth.uid()
    AND is_champion = true
  )
);

-- 4. Initialization
-- Update existing members (Champions) to 'joined' status
UPDATE public.pilot_team_members 
SET status = 'joined', 
    joined_at = created_at,
    last_active_at = now()
WHERE is_champion = true AND status = 'invited';
