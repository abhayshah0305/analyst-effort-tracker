
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'analyst');

-- Create enum for departments to enforce valid values
CREATE TYPE public.department_type AS ENUM (
  'Technology',
  'AMP', 
  'Sales/Fundraise',
  'Debrief',
  'Coverage',
  'Asset Monitoring',
  'CRE',
  'Residental',
  'Equity Enhancer Product',
  'Co-Investments'
);

-- Create enum for work types
CREATE TYPE public.work_type AS ENUM ('Administrative', 'Research', 'Analysis', 'Meetings', 'Documentation');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert existing admin users
INSERT INTO public.user_roles (user_email, role) VALUES 
('abhay.shah@integrowamc.com', 'admin'),
('sanchi.jain@integrowamc.com', 'admin');

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS policy for user_roles - users can see their own role, admins can see all
CREATE POLICY "Users can view own role or admins can view all" 
ON public.user_roles 
FOR SELECT 
USING (
  user_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email' 
    AND role = 'admin'
  )
);

-- Only admins can insert/update user roles
CREATE POLICY "Only admins can manage user roles"
ON public.user_roles 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_email = current_setting('request.jwt.claims', true)::json->>'email' 
    AND role = 'admin'
  )
);

-- Create security definer function to check if user is admin
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

-- Add server-side validation constraints to analyst_submissions
ALTER TABLE public.analyst_submissions 
ADD CONSTRAINT check_hours_worked CHECK (hours_worked > 0 AND hours_worked <= 24),
ADD CONSTRAINT check_deal_name_length CHECK (char_length(deal_name) >= 1 AND char_length(deal_name) <= 100),
ADD CONSTRAINT check_description_length CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
ADD CONSTRAINT check_task_date_reasonable CHECK (task_date >= '2020-01-01' AND task_date <= CURRENT_DATE + INTERVAL '1 day');

-- Update department column to use enum
ALTER TABLE public.analyst_submissions 
ALTER COLUMN department TYPE department_type USING department::department_type;

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to analyst_submissions
ALTER TABLE public.analyst_submissions 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE TRIGGER update_analyst_submissions_updated_at
  BEFORE UPDATE ON public.analyst_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update RLS policies to use the new admin function
DROP POLICY IF EXISTS "Users can view own submissions or admin can view all" ON public.analyst_submissions;
DROP POLICY IF EXISTS "Admin can insert ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can update ratings" ON public.leadership_ratings;
DROP POLICY IF EXISTS "Admin can view all ratings" ON public.leadership_ratings;

-- Updated analyst_submissions policies
CREATE POLICY "Users can view own submissions or admin can view all" 
ON public.analyst_submissions 
FOR SELECT 
USING (
  analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
  OR public.is_admin()
);

-- Updated leadership_ratings policies
CREATE POLICY "Admin can insert ratings" 
ON public.leadership_ratings 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update ratings" 
ON public.leadership_ratings 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Admin can view all ratings" 
ON public.leadership_ratings 
FOR SELECT 
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM analyst_submissions 
    WHERE analyst_submissions.id = leadership_ratings.submission_id 
    AND analyst_submissions.analyst_email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Update department column in leadership_ratings to use enum
ALTER TABLE public.leadership_ratings 
ALTER COLUMN department TYPE department_type USING department::department_type;

-- Add audit trail for rating changes
CREATE TABLE public.rating_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID REFERENCES public.leadership_ratings(id) ON DELETE CASCADE,
  old_rating INTEGER,
  new_rating INTEGER,
  changed_by TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  action TEXT NOT NULL -- 'INSERT', 'UPDATE', 'DELETE'
);

-- Enable RLS on audit log
ALTER TABLE public.rating_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit log
CREATE POLICY "Only admins can view audit log"
ON public.rating_audit_log 
FOR SELECT 
USING (public.is_admin());

-- Create audit trigger function
CREATE OR REPLACE FUNCTION public.log_rating_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.rating_audit_log (rating_id, new_rating, changed_by, action)
    VALUES (NEW.id, NEW.rating, NEW.rated_by, 'INSERT');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.rating_audit_log (rating_id, old_rating, new_rating, changed_by, action)
    VALUES (NEW.id, OLD.rating, NEW.rating, NEW.rated_by, 'UPDATE');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.rating_audit_log (rating_id, old_rating, changed_by, action)
    VALUES (OLD.id, OLD.rating, current_setting('request.jwt.claims', true)::json->>'email', 'DELETE');
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit trigger
CREATE TRIGGER rating_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.leadership_ratings
  FOR EACH ROW EXECUTE FUNCTION public.log_rating_changes();
