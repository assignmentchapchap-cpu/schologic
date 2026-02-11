ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS word_count integer DEFAULT 500,
ADD COLUMN IF NOT EXISTS reference_style text DEFAULT 'APA';
