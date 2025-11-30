-- Simple fix for users table to work with Supabase Auth
-- This creates a trigger to automatically insert users into the users table
-- Only creates profile AFTER email is confirmed (if email confirmation is enabled)

-- Create function to handle new user creation and email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if email is confirmed OR if email confirmation is disabled
  IF NEW.email_confirmed_at IS NOT NULL OR NEW.confirmation_sent_at IS NULL THEN
    INSERT INTO public.users (full_name, email, created_at)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.email,
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle email confirmation
CREATE OR REPLACE FUNCTION public.handle_user_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- If email was just confirmed, create the user profile
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.users (full_name, email, created_at)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      NEW.email,
      NOW()
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user profile on confirmation: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create trigger for email confirmation
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_confirmation();

-- Clean up any existing entries that were created manually
DELETE FROM public.users WHERE password_hash IS NOT NULL OR email NOT IN (
  SELECT email FROM auth.users WHERE email IS NOT NULL
);

-- Insert existing confirmed auth users
INSERT INTO public.users (full_name, email, created_at)
SELECT 
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name') as full_name,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.email_confirmed_at IS NOT NULL 
  AND au.email NOT IN (SELECT email FROM public.users WHERE email IS NOT NULL)
ON CONFLICT (email) DO NOTHING;