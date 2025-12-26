ALTER TABLE public.assignments 
ADD COLUMN word_count integer DEFAULT 500,
ADD COLUMN reference_style text DEFAULT 'APA';
