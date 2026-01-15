-- LMS Schema Transformation (Phase 2)

-- 1. Update Profiles with Identity Features
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true}'::jsonb;

-- 2. Update Classes with Timeline
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE;

-- 3. Create Enrollments Table (Students <-> Classes)
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, class_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- 4. Create Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- 5. Create Class Resources (Notes)
CREATE TABLE IF NOT EXISTS class_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT, -- For markdown or description
  file_url TEXT, -- For attached PDFs etc
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE class_resources ENABLE ROW LEVEL SECURITY;

-- 6. Create Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_assignment', 'grade_posted', etc
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 7. Update Submissions for Grading & Assignments
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES assignments(id),
ADD COLUMN IF NOT EXISTS grade FLOAT, -- The Score given by instructor
ADD COLUMN IF NOT EXISTS feedback TEXT; -- Instructor feedback

-- --- RLS POLICIES ---

-- Enrollments Policies
-- Students can see their own enrollments
CREATE POLICY "Students can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Students can join classes (Insert own)
CREATE POLICY "Students can enroll themselves" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Instructors can view enrollments for their classes
CREATE POLICY "Instructors can view class enrollments" ON enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = enrollments.class_id AND classes.instructor_id = auth.uid()
    )
  );

-- Assignments Policies
-- Everyone in the class (Instructor + Enrolled Students) can view assignments
CREATE POLICY "Class participants can view assignments" ON assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = auth.uid()) -- Instructor
    OR 
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = assignments.class_id AND enrollments.student_id = auth.uid()) -- Student
  );

-- Only Instructors can CRUD assignments
CREATE POLICY "Instructors can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.instructor_id = auth.uid())
  );

-- Class Resources Policies (Same as assignments)
CREATE POLICY "Class participants can view resources" ON class_resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_resources.class_id AND classes.instructor_id = auth.uid())
    OR 
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_resources.class_id AND enrollments.student_id = auth.uid())
  );

CREATE POLICY "Instructors can manage resources" ON class_resources
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_resources.class_id AND classes.instructor_id = auth.uid())
  );

-- Notifications Policies
-- Users can only see/edit their own notifications
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
  
-- Allow system/functions to insert notifications (or any auth user for triggered events)
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true); 
