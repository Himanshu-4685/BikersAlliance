-- Fix for infinite recursion in admin RLS policies
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS temporarily for admin table
ALTER TABLE admin DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS, use a simpler policy
-- ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Admins can view all admin accounts" ON admin;
-- DROP POLICY IF EXISTS "Super admins can modify admin accounts" ON admin;
-- 
-- -- Simple policy that allows access during login (you can improve this later)
-- CREATE POLICY "Allow admin login" ON admin
--     FOR ALL USING (true);

-- For now, just use Option 1 to get login working
-- You can re-enable RLS later with better policies