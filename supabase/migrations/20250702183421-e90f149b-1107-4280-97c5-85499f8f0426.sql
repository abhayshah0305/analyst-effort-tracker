
-- Drop existing policies that allow everyone to see all submissions
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.analyst_submissions;
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.analyst_submissions;

-- Create proper RLS policies that restrict access to own data only
CREATE POLICY "Users can view own submissions" 
  ON public.analyst_submissions 
  FOR SELECT 
  USING (analyst_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert own submissions" 
  ON public.analyst_submissions 
  FOR INSERT 
  WITH CHECK (analyst_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Update leadership ratings policies to be more restrictive
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Anyone can insert ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON public.leadership_ratings;

-- Only allow viewing ratings for admin users or for their own submissions
CREATE POLICY "Admin can view all ratings" 
  ON public.leadership_ratings 
  FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR EXISTS (
      SELECT 1 FROM public.analyst_submissions 
      WHERE id = submission_id 
      AND analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Admin can insert ratings" 
  ON public.leadership_ratings 
  FOR INSERT 
  WITH CHECK (current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com');

CREATE POLICY "Admin can update ratings" 
  ON public.leadership_ratings 
  FOR UPDATE 
  USING (current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com');
