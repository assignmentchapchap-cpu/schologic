-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE LOGIN ISSUE
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
