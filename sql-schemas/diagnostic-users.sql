-- Comprehensive diagnostic script for user registration issues

-- 1. Check auth.users table (Supabase Auth)
SELECT 
  'AUTH USERS:' as table_name,
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'name' as name_field,
  email_confirmed_at,
  confirmation_sent_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    WHEN confirmation_sent_at IS NOT NULL THEN 'Awaiting Confirmation'
    ELSE 'No Confirmation Required'
  END as status
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check public.users table (App users)
SELECT 
  'PUBLIC USERS:' as table_name,
  user_id,
  full_name,
  email,
  password_hash,
  created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check for orphaned users (in public.users but not in auth.users)
SELECT 
  'ORPHANED USERS:' as issue,
  u.user_id,
  u.full_name,
  u.email,
  u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
WHERE au.email IS NULL;

-- 4. Check for users in auth but not in public
SELECT 
  'MISSING PROFILES:' as issue,
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.email_confirmed_at,
  au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.email = u.email
WHERE u.email IS NULL
  AND au.email_confirmed_at IS NOT NULL; -- Only show confirmed users

-- 5. Check if triggers exist
SELECT 
  'TRIGGERS:' as info,
  trigger_name,
  event_manipulation,
  event_object_table,
  trigger_schema
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'on_auth_user_confirmed');

-- 6. Check if functions exist
SELECT 
  'FUNCTIONS:' as info,
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines 
WHERE routine_name IN ('handle_new_user', 'handle_user_confirmation');

-- 7. Check for users with password_hash (shouldn't exist with Supabase Auth)
SELECT 
  'USERS WITH PASSWORD HASH:' as issue,
  user_id,
  email,
  full_name,
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Has Password Hash (PROBLEM)'
    ELSE 'No Password Hash (Good)'
  END as password_status
FROM public.users
WHERE password_hash IS NOT NULL;