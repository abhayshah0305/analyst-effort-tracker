
-- Add rating column to analyst_submissions table
ALTER TABLE public.analyst_submissions 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 10);
