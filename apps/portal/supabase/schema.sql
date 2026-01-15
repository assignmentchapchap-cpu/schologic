-- Organizations (Institutions)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Profiles (Instructors & Students)
-- Linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('instructor', 'student')),
  full_name TEXT,
  email TEXT,
  institution_id UUID REFERENCES institutions(id)
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  content TEXT, -- Parsed text
  file_url TEXT, -- Blob link if applicable
  ai_score FLOAT, -- 0 to 100
  report_data JSONB, -- Detailed sentence analysis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: 
-- Users can read their own profile.
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile.
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile.
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Instructors can read profiles of students in their classes (simplified for MVP: read public/all profiles or handle via joins)
-- For MVP, let's allow read access to profiles for authenticated users to facilitate class joining/viewing.
CREATE POLICY "Authenticated users can read profiles" ON profiles
  FOR SELECT TO authenticated USING (true);


-- Classes:
-- Instructors can CRUD their own classes.
CREATE POLICY "Instructors can manage own classes" ON classes
  FOR ALL USING (auth.uid() = instructor_id);

-- Students can read classes they have joined or by code (Simplified: Authenticated read)
CREATE POLICY "Authenticated users can read classes" ON classes
  FOR SELECT TO authenticated USING (true);


-- Submissions:
-- Students can CRUD their own submissions.
CREATE POLICY "Students can manage own submissions" ON submissions
  FOR ALL USING (auth.uid() = student_id);

-- Instructors can view submissions for their classes.
CREATE POLICY "Instructors can view class submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = submissions.class_id 
      AND classes.instructor_id = auth.uid()
    )
  );

