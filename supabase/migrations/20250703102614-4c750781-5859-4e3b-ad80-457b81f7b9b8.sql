
-- Create the is_admin function that checks if a user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_email = COALESCE(is_admin.user_email, current_setting('request.jwt.claims', true)::json->>'email')
    AND role = 'admin'
  );
$$;
