
-- Create table for analyst submissions
CREATE TABLE public.analyst_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analyst_email TEXT NOT NULL,
  deal_name TEXT NOT NULL,
  department TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Core', 'Project')),
  hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked >= 0),
  description TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for senior leadership ratings
CREATE TABLE public.leadership_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.analyst_submissions(id) ON DELETE CASCADE,
  rated_by TEXT NOT NULL, -- email of the person giving the rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  rated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(submission_id, rated_by) -- One rating per submission per rater
);

-- Enable Row Level Security
ALTER TABLE public.analyst_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analyst_submissions
CREATE POLICY "Anyone can view submissions" 
  ON public.analyst_submissions 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert submissions" 
  ON public.analyst_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for leadership_ratings
CREATE POLICY "Anyone can view ratings" 
  ON public.leadership_ratings 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert ratings" 
  ON public.leadership_ratings 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update ratings" 
  ON public.leadership_ratings 
  FOR UPDATE 
  USING (true);
