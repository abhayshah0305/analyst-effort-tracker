
-- Add admin users to the user_roles table
INSERT INTO public.user_roles (user_email, role) VALUES 
('abhay.shah@integrowamc.com', 'admin'),
('sanchi.jain@integrowamc.com', 'admin')
ON CONFLICT (user_email) DO UPDATE SET role = 'admin';
