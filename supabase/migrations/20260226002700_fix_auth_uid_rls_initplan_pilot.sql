-- Migration: fix_auth_uid_rls_initplan_robust
-- Description: Optimizes RLS policies by replacing auth.uid() with (SELECT auth.uid()) and leverages SECURITY DEFINER functions to prevent infinite recursion on join tables (pilot_team_members).

-- 1. Create robust utility functions to bypass RLS recursion safely
CREATE OR REPLACE FUNCTION public.get_my_pilot_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- (SELECT auth.uid()) satisfies the auth_rls_initplan linter perfectly
  SELECT pilot_request_id FROM pilot_team_members WHERE user_id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_my_champion_pilot_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pilot_request_id FROM pilot_team_members WHERE user_id = (SELECT auth.uid()) AND is_champion = true;
$$;

-- 2. pilot_team_members policies
DROP POLICY IF EXISTS "Users can view team members of their pilot" ON public.pilot_team_members;
CREATE POLICY "Users can view team members of their pilot" 
ON public.pilot_team_members 
FOR SELECT 
TO authenticated 
USING (
  pilot_request_id IN (SELECT public.get_my_pilot_ids())
);

DROP POLICY IF EXISTS "Champions can invite team members" ON public.pilot_team_members;
CREATE POLICY "Champions can invite team members" 
ON public.pilot_team_members 
FOR INSERT 
TO authenticated 
WITH CHECK (
  pilot_request_id IN (SELECT public.get_my_champion_pilot_ids())
);

DROP POLICY IF EXISTS "Champions can update team permissions" ON public.pilot_team_members;
CREATE POLICY "Champions can update team permissions" 
ON public.pilot_team_members 
FOR UPDATE 
TO authenticated 
USING (
  pilot_request_id IN (SELECT public.get_my_champion_pilot_ids())
);

DROP POLICY IF EXISTS "Champions can remove members" ON public.pilot_team_members;
CREATE POLICY "Champions can remove members" 
ON public.pilot_team_members 
FOR DELETE 
TO authenticated 
USING (
  pilot_request_id IN (SELECT public.get_my_champion_pilot_ids())
);

-- 3. pilot_requests policies
DROP POLICY IF EXISTS "Team members can view their pilot request" ON public.pilot_requests;
CREATE POLICY "Team members can view their pilot request" 
ON public.pilot_requests 
FOR SELECT 
TO authenticated 
USING (
  id IN (SELECT public.get_my_pilot_ids())
);

DROP POLICY IF EXISTS "Team members can update their pilot request" ON public.pilot_requests;
CREATE POLICY "Team members can update their pilot request" 
ON public.pilot_requests 
FOR UPDATE 
TO authenticated 
USING (
  id IN (SELECT public.get_my_pilot_ids())
);
