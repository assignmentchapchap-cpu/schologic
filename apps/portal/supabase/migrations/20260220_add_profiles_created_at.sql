-- Migration: Add created_at to profiles & Sync with Auth
-- Date: 2026-02-20

-- 1. Add the column if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 2. Backfill existing data from auth.users
UPDATE profiles p
SET created_at = u.created_at
FROM auth.users u
WHERE p.id = u.id
  AND p.created_at IS NULL; -- Only update if not already set

-- 3. Update the handle_new_user function to sync created_at for NEW users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    professional_affiliation,
    phone,
    country,
    is_active,
    is_demo,
    created_at  -- <--- NEW
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'professional_affiliation',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    CASE 
      WHEN (new.raw_user_meta_data->>'is_active')::boolean IS FALSE THEN false 
      ELSE true 
    END,
    CASE 
      WHEN (new.raw_user_meta_data->>'is_demo')::boolean IS TRUE THEN true 
      ELSE false 
    END,
    new.created_at -- <--- NEW: Syncs timestamp from Auth
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
