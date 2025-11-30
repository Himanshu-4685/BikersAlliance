-- Disable Row Level Security (RLS) on status table for testing
-- Run these commands in your Supabase SQL editor to allow API access

-- Disable RLS on status table
ALTER TABLE public.status DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on related tables if needed
ALTER TABLE public.brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.images DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.specs DISABLE ROW LEVEL SECURITY;

-- Verify tables don't have RLS enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('status', 'brands', 'models', 'variants', 'images', 'specs')
AND schemaname = 'public';

-- Check if there are any RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('status', 'brands', 'models', 'variants', 'images', 'specs')
AND schemaname = 'public';