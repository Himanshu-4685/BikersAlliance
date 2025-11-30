-- Clean up the current database state
-- Remove any manually created users that don't correspond to Supabase Auth users

-- First, let's see what we have
SELECT 
  u.user_id,
  u.full_name, 
  u.email,
  u.password_hash,
  u.created_at,
  CASE 
    WHEN au.email IS NOT NULL THEN 'Has Auth User'
    ELSE 'No Auth User'
  END as auth_status,
  au.email_confirmed_at
FROM public.users u
LEFT JOIN auth.users au ON u.email = au.email
ORDER BY u.created_at DESC;

-- Clean up users that don't have corresponding auth.users entries
-- OR users that have password_hash (which shouldn't exist since we use Supabase Auth)
DELETE FROM public.users 
WHERE password_hash IS NOT NULL 
   OR email NOT IN (SELECT email FROM auth.users WHERE email IS NOT NULL);

-- Show remaining users
SELECT 
  u.user_id,
  u.full_name, 
  u.email,
  u.created_at,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Unconfirmed'
  END as confirmation_status
FROM public.users u
JOIN auth.users au ON u.email = au.email
ORDER BY u.created_at DESC;