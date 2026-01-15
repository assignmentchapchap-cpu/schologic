-- Add registration_number to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Add short_code to assignments (e.g., CAT1, MID)
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS short_code TEXT;

-- Add class_code to classes (e.g., BIO101)
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS class_code TEXT;
