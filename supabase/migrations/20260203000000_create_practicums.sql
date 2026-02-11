-- Create practicums table
create table if not exists practicums (
  id uuid primary key default gen_random_uuid(),
  instructor_id uuid references auth.users(id) not null,
  title text not null,
  cohort_code text unique not null,
  invite_code text unique not null,
  
  -- Schedule & Config
  start_date date not null,
  end_date date not null,
  log_interval text check (log_interval in ('daily', 'weekly')) not null,
  geolocation_required boolean default false,
  final_report_required boolean default true,
  
  -- Templates & Content
  log_template text check (log_template in ('teaching_practice', 'industrial_attachment', 'custom')) not null,
  custom_template jsonb, -- Used when log_template is 'custom'
  
  -- Rubrics (Separated for clarity as per Master Spec)
  logs_rubric jsonb not null default '{}'::jsonb,
  supervisor_report_template jsonb not null default '{}'::jsonb,
  student_report_template jsonb not null default '{}'::jsonb,
  
  -- Configuration & Timeline
  grading_config jsonb not null default '{}'::jsonb, -- Weights, penalties
  timeline jsonb not null default '{}'::jsonb, -- Milestones
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for practicums
alter table practicums enable row level security;

-- Policies for practicums
create policy "Instructors can manage their own practicums"
  on practicums
  for all
  using (auth.uid() = instructor_id);

create policy "Public/Students can read practicums by cohort_code"
  on practicums
  for select
  using (true); 


-- Create practicum_enrollments table
create table if not exists practicum_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) not null,
  practicum_id uuid references practicums(id) not null,
  
  -- Workflow
  status text check (status in ('pending', 'approved', 'rejected')) not null default 'pending',
  
  -- Info Buckets
  academic_data jsonb not null default '{}'::jsonb, -- course, level, year
  workplace_data jsonb not null default '{}'::jsonb, -- company, building
  supervisor_data jsonb not null default '{}'::jsonb, -- name, title, phone, email
  
  -- Logistics
  schedule jsonb default '[]'::jsonb,
  location_coords jsonb, -- Frozen reference for geofencing
  
  -- Timestamps
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone,
  
  -- Assessment State
  supervisor_report jsonb,
  student_report_url text, -- Vercel Blob URL
  student_report_grades jsonb, -- Section-wise scores
  final_grade float,
  
  unique(student_id, practicum_id)
);

-- Enable RLS for enrollments
alter table practicum_enrollments enable row level security;

-- Policies for enrollments
create policy "Students can manage own enrollments"
  on practicum_enrollments
  for all
  using (auth.uid() = student_id);

create policy "Instructors can manage enrollments in their practicums"
  on practicum_enrollments
  for all
  using (
    exists (
      select 1 from practicums
      where practicums.id = practicum_enrollments.practicum_id
      and practicums.instructor_id = auth.uid()
    )
  );

-- Indexes for enrollments
create index enrollments_student_id_idx on practicum_enrollments(student_id);
create index enrollments_practicum_id_idx on practicum_enrollments(practicum_id);


-- Create practicum_logs table
create table if not exists practicum_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users(id) not null,
  practicum_id uuid references practicums(id) not null,
  
  -- Timing & Sequence
  log_date date not null,
  week_number int, -- Links to timeline milestones
  clock_in timestamptz,
  clock_out timestamptz,
  
  -- Content
  entries jsonb not null default '{}'::jsonb, -- Main log content
  weekly_reflection text,
  file_urls text[], -- Array of blob URLs for attached images
  
  -- Location Verification
  location_data jsonb, -- {lat, lng, accuracy, distance_from_ref}
  
  -- Supervisor Verification
  supervisor_status text check (supervisor_status in ('pending', 'verified', 'rejected')) not null default 'pending',
  supervisor_comment text, -- Confidential comment
  supervisor_verified_at timestamp with time zone,
  verification_token uuid default gen_random_uuid(), -- For external email link
  
  -- Grading
  grade float,
  feedback text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for logs
alter table practicum_logs enable row level security;

-- Policies for logs
create policy "Students can manage their own logs"
  on practicum_logs
  for all
  using (auth.uid() = student_id);

create policy "Instructors can view and grade logs for their cohorts"
  on practicum_logs
  for all
  using (
    exists (
      select 1 from practicums
      where practicums.id = practicum_logs.practicum_id
      and practicums.instructor_id = auth.uid()
    )
  );

-- Indexes for logs
create index logs_student_practicum_idx on practicum_logs(student_id, practicum_id);
create index logs_verification_token_idx on practicum_logs(verification_token);
create index logs_log_date_idx on practicum_logs(log_date);


-- Create practicum_resources table
-- Mirrors 'class_resources' structure for consistency: notes (content), uploads (file_url), library integration ready.
create table if not exists practicum_resources (
  id uuid primary key default gen_random_uuid(),
  practicum_id uuid references practicums(id) not null,
  
  title text not null,
  content text, -- For Notes/Descriptions
  file_url text, -- Vercel Blob URL or Link
  mime_type text,
  size_bytes bigint,
  
  uploaded_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for resources
alter table practicum_resources enable row level security;

-- Policies for resources
-- 1. Instructors can fully manage resources for their practicums
create policy "Instructors can manage resources in their practicums"
  on practicum_resources
  for all
  using (
    exists (
      select 1 from practicums
      where practicums.id = practicum_resources.practicum_id
      and practicums.instructor_id = auth.uid()
    )
  );

-- 2. Students can READ resources ONLY if they have an APPROVED enrollment
create policy "Students can view resources for enrolled practicums"
  on practicum_resources
  for select
  using (
    exists (
      select 1 from practicum_enrollments
      where practicum_enrollments.practicum_id = practicum_resources.practicum_id
      and practicum_enrollments.student_id = auth.uid()
      and practicum_enrollments.status = 'approved'
    )
  );

-- Indexes for resources
create index resources_practicum_id_idx on practicum_resources(practicum_id);
