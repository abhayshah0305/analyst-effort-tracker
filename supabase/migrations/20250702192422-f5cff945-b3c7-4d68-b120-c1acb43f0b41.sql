
-- Add department and type columns to leadership_ratings table
ALTER TABLE public.leadership_ratings 
ADD COLUMN department TEXT NOT NULL DEFAULT '',
ADD COLUMN type TEXT NOT NULL DEFAULT '';

-- Update existing records with department and type information from analyst_submissions
UPDATE public.leadership_ratings 
SET 
  department = (
    SELECT analyst_submissions.department 
    FROM public.analyst_submissions 
    WHERE analyst_submissions.id = leadership_ratings.submission_id
  ),
  type = (
    SELECT analyst_submissions.type 
    FROM public.analyst_submissions 
    WHERE analyst_submissions.id = leadership_ratings.submission_id
  );

-- Remove the default values now that existing records are updated
ALTER TABLE public.leadership_ratings 
ALTER COLUMN department DROP DEFAULT,
ALTER COLUMN type DROP DEFAULT;
