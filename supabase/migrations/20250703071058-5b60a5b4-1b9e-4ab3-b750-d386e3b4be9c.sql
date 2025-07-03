
-- Add task_date column to leadership_ratings table
ALTER TABLE public.leadership_ratings 
ADD COLUMN task_date DATE;

-- Update existing records to set task_date from the corresponding analyst_submissions
UPDATE public.leadership_ratings 
SET task_date = analyst_submissions.task_date
FROM public.analyst_submissions 
WHERE leadership_ratings.submission_id = analyst_submissions.id;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.leadership_ratings 
ALTER COLUMN task_date SET NOT NULL;
