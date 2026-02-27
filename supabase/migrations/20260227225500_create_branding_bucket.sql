-- Create the bucket for branding assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pilot-branding', 'pilot-branding', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS is already enabled on storage.objects by default in Supabase

-- 1. Anyone can view the branding assets (since they are shown on the login page)
CREATE POLICY "Pilot branding assets are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'pilot-branding');

-- 2. Users can upload/insert assets if they belong to the pilot team for the given pilot_request_id folder
CREATE POLICY "Pilot members can upload branding assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'pilot-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT pilot_request_id::text 
    FROM public.pilot_team_members 
    WHERE user_id = auth.uid()
  )
);

-- 3. Users can update assets if they belong to the pilot team
CREATE POLICY "Pilot members can update branding assets" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'pilot-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT pilot_request_id::text 
    FROM public.pilot_team_members 
    WHERE user_id = auth.uid()
  )
);

-- 4. Users can delete assets if they belong to the pilot team
CREATE POLICY "Pilot members can delete branding assets" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'pilot-branding' AND
  (storage.foldername(name))[1] IN (
    SELECT pilot_request_id::text 
    FROM public.pilot_team_members 
    WHERE user_id = auth.uid()
  )
);
