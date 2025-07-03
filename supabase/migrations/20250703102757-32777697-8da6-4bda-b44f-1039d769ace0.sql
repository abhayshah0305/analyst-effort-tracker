
-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'analyst');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'analyst',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert the admin users
INSERT INTO public.user_roles (user_email, role) VALUES 
('abhay.shah@integrowamc.com', 'admin'),
('sanchi.jain@integrowamc.com', 'admin')
ON CONFLICT (user_email) DO UPDATE SET role = 'admin';

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
