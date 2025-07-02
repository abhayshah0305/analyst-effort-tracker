
-- Update the RLS policy to allow admin users to view all submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON public.analyst_submissions;

-- Create new policy that allows users to view their own submissions OR allows admin to view all
CREATE POLICY "Users can view own submissions or admin can view all" 
  ON public.analyst_submissions 
  FOR SELECT 
  USING (
    analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR current_setting('request.jwt.claims', true)::json->>'email' = 'abhay.shah@integrowamc.com'
  );
