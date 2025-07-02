
-- Update the RLS policies for leadership_ratings to ensure admin can insert ratings
DROP POLICY IF EXISTS "Admin can insert ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can update ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can view all ratings" ON public.leadership_ratings;

-- Create new policies that allow admin to insert, update and view ratings
CREATE POLICY "Admin can insert ratings" 
  ON public.leadership_ratings 
  FOR INSERT 
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
  );

CREATE POLICY "Admin can update ratings" 
  ON public.leadership_ratings 
  FOR UPDATE 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
  );

CREATE POLICY "Admin can view all ratings" 
  ON public.leadership_ratings 
  FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR EXISTS (
      SELECT 1 FROM analyst_submissions 
      WHERE analyst_submissions.id = leadership_ratings.submission_id 
      AND analyst_submissions.analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
