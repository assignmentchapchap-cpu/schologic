-- Add administrative management fields to feedback
ALTER TABLE "public"."feedback" ADD COLUMN IF NOT EXISTS "admin_notes" TEXT;
ALTER TABLE "public"."feedback" ADD COLUMN IF NOT EXISTS "message_thread_id" UUID;
ALTER TABLE "public"."feedback" ADD COLUMN IF NOT EXISTS "priority" TEXT DEFAULT 'medium';

-- Ensure RLS is enabled
ALTER TABLE "public"."feedback" ENABLE ROW LEVEL SECURITY;

-- 1. All authenticated users can submit feedback
CREATE POLICY "Authenticated users can submit feedback" 
ON "public"."feedback" FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 2. Users can view their own feedback submissions
CREATE POLICY "Users can view own feedback" 
ON "public"."feedback" FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 3. Superadmins have total management access (Full CRUD)
CREATE POLICY "Superadmins have full feedback access" 
ON "public"."feedback" FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);
