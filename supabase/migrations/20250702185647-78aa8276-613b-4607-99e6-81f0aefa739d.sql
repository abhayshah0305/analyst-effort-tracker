
-- Add analyst_name and deal_name columns to leadership_ratings table for easier identification
ALTER TABLE public.leadership_ratings 
ADD COLUMN analyst_name TEXT,
ADD COLUMN deal_name TEXT;

-- Update existing records with analyst and deal information
UPDATE public.leadership_ratings 
SET 
  analyst_name = (
    SELECT analyst_email 
    FROM public.analyst_submissions 
    WHERE analyst_submissions.id = leadership_ratings.submission_id
  ),
  deal_name = (
    SELECT analyst_submissions.deal_name 
    FROM public.analyst_submissions 
    WHERE analyst_submissions.id = leadership_ratings.submission_id
  );

-- Make these columns NOT NULL for future inserts
ALTER TABLE public.leadership_ratings 
ALTER COLUMN analyst_name SET NOT NULL,
ALTER COLUMN deal_name SET NOT NULL;
