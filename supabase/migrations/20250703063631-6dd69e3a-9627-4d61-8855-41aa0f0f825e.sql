
-- Add task_date column to analyst_submissions table
ALTER TABLE public.analyst_submissions 
ADD COLUMN task_date DATE NOT NULL DEFAULT CURRENT_DATE;
