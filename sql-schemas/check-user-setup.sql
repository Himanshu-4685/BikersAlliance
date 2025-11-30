-- Test script to check the current auth users and public users tables

-- Check what users exist in auth.users (Supabase Auth)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- Check what users exist in public.users (your app's users table)
SELECT 
  user_id,
  full_name,
  email,
  created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_type = 'FUNCTION';