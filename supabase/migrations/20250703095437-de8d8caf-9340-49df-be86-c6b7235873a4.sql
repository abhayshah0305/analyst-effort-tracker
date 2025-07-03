
-- Update the RLS policies to include both admin users

-- Update analyst_submissions policies
DROP POLICY IF EXISTS "Users can view own submissions or admin can view all" ON public.analyst_submissions;

CREATE POLICY "Users can view own submissions or admin can view all" 
  ON public.analyst_submissions 
  FOR SELECT 
  USING (
    analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'sanchi.jain@integrowamc.com'
  );

-- Update leadership_ratings policies
DROP POLICY IF EXISTS "Admin can insert ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can update ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can view all ratings" ON public.leadership_ratings;

CREATE POLICY "Admin can insert ratings" 
  ON public.leadership_ratings 
  FOR INSERT 
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'sanchi.jain@integrowamc.com'
  );

CREATE POLICY "Admin can update ratings" 
  ON public.leadership_ratings 
  FOR UPDATE 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'sanchi.jain@integrowamc.com'
  );

CREATE POLICY "Admin can view all ratings" 
  ON public.leadership_ratings 
  FOR SELECT 
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'sanchi.jain@integrowamc.com'
    OR EXISTS (
      SELECT 1 FROM analyst_submissions 
      WHERE analyst_submissions.id = leadership_ratings.submission_id 
      AND analyst_submissions.analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
