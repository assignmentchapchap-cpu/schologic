-- 1. Ensure the user has the correct role (Hard fix)
UPDATE profiles 
SET role = 'institution_admin' 
WHERE email = 'info@schologic.com';

-- 2. Fix RLS Recursion by resetting Profile policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove potentially conflicting/recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile_safe" ON profiles;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;

-- 3. Add the Essential "Read Own Profile" Policy (SAFE, Non-Recursive)
-- This allows the login page to check "Who am I?"
CREATE POLICY "Users can read own profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 4. Add Admin Access Policy (using the safe function if it exists, or just the safe own-profile check is enough for login)
-- We re-add the admin view-all policy using the anti-recursion function we (hopefully) created.
-- If the function doesn't exist, we create it first.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;

CREATE POLICY "Admins can view all profiles" ON profiles 
FOR SELECT 
USING (get_my_role() IN ('superadmin', 'institution_admin'));

CREATE POLICY "Admins can update all profiles" ON profiles 
FOR UPDATE 
USING (get_my_role() IN ('superadmin', 'institution_admin'));
