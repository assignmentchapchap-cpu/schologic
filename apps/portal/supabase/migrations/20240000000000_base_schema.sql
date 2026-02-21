-- Organizations (Institutions)
CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL
);

-- Profiles (Instructors & Students)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('instructor', 'student')),
  full_name TEXT, -- Legacy combined name
  email TEXT,
  institution_id UUID REFERENCES institutions(id),
  
  -- Extended Profile Fields
  title TEXT,
  first_name TEXT,
  last_name TEXT,
  honorific TEXT,
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB,
  registration_number TEXT,
  settings JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  class_code TEXT, -- Additional code
  is_locked BOOLEAN DEFAULT FALSE,
  settings JSONB,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points FLOAT DEFAULT 100,
  short_code TEXT,
  word_count INT,
  reference_style TEXT,
  rubric JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id),
  class_id UUID REFERENCES classes(id),
  assignment_id UUID REFERENCES assignments(id),
  
  content TEXT, -- Parsed text
  file_url TEXT, -- Blob link
  
  ai_score FLOAT, 
  report_data JSONB, -- Detailed analysis
  
  grade FLOAT, -- Instructor grade
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class Resources
CREATE TABLE IF NOT EXISTS class_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id),
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Logic: Instructor Events
CREATE TABLE IF NOT EXISTS instructor_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- App Logic: Instructor Todos
CREATE TABLE IF NOT EXISTS instructor_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assets (Library)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID REFERENCES profiles(id),
  collection_id UUID, -- Self-referencing or separate collections table (using simplified self-ref or just standard ID)
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  asset_type TEXT CHECK (asset_type IN ('file', 'cartridge_root', 'document', 'url')),
  mime_type TEXT,
  source TEXT,
  parent_asset_id UUID REFERENCES assets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Simplified for Documentation)

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Examples)

-- Profiles
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles read" ON profiles FOR SELECT TO authenticated USING (true); -- MVP

-- Classes
CREATE POLICY "Instructors manage classes" ON classes FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Public classes read" ON classes FOR SELECT TO authenticated USING (true); -- MVP

-- Enrollments
CREATE POLICY "Students manage enrollments" ON enrollments FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Instructors view enrollments" ON enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = enrollments.class_id AND classes.instructor_id = auth.uid())
);

-- Assignments
CREATE POLICY "Instructors manage assignments" ON assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = auth.uid())
);
CREATE POLICY "Students view assignments" ON assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = assignments.class_id AND enrollments.student_id = auth.uid())
);

-- Submissions
CREATE POLICY "Students manage submissions" ON submissions FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Instructors view submissions" ON submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM classes WHERE classes.id = submissions.class_id AND classes.instructor_id = auth.uid())
);

-- Assets
CREATE POLICY "Instructors manage assets" ON assets FOR ALL USING (auth.uid() = instructor_id);
