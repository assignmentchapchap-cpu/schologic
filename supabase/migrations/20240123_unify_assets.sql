-- 1. Create Junction Table for M:N relationship between Classes and Assets
CREATE TABLE IF NOT EXISTS class_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, asset_id)
);

-- 2. Enable RLS on Junction Table
ALTER TABLE class_assets ENABLE ROW LEVEL SECURITY;

-- 3. Junction Table Policies

-- Instructor: Can manage (add/remove) links for their classes
CREATE POLICY "Instructors manage class assets" ON class_assets 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = auth.uid())
  );

-- Student: Can view links only for classes they are enrolled in
CREATE POLICY "Students view class assets" ON class_assets 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = auth.uid())
  );

-- 4. Update Assets Table Policies (Indirect Access)

-- Allow users (Students/Instructors) to read the actual ASSET content if they have access via a class link
-- This effectively "shares" the asset with the class members
CREATE POLICY "View assets via class link" ON assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM class_assets 
      WHERE class_assets.asset_id = assets.id 
      AND (
        -- User is the instructor of the class (redundant if they own the asset, but covers shared cases)
        EXISTS (SELECT 1 FROM classes WHERE classes.id = class_assets.class_id AND classes.instructor_id = auth.uid())
        OR
        -- User is a student in the class
        EXISTS (SELECT 1 FROM enrollments WHERE enrollments.class_id = class_assets.class_id AND enrollments.student_id = auth.uid())
      )
    )
  );

-- 5. Drop Legacy Table (Clean Slate Strategy)
DROP TABLE IF EXISTS class_resources;
