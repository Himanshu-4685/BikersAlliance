-- Fix users table to work with Supabase Auth
-- This script will create a proper users table and trigger to sync with auth.users

-- First, let's create a new users table with the correct structure
-- We'll rename the existing one first
ALTER TABLE IF EXISTS public.users RENAME TO users_old;

-- Create the new users table with UUID id to match auth.users
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert any existing auth users into the new users table
-- (This will help if there are already registered users)
INSERT INTO public.users (id, email, full_name, avatar_url, created_at)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'full_name' as full_name,
  au.raw_user_meta_data->>'avatar_url' as avatar_url,
  au.created_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- Now we need to update foreign key references
-- Check which tables reference the old users table and update them

-- Update bookings table
ALTER TABLE IF EXISTS public.bookings 
DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Add a new user_uuid column to bookings
ALTER TABLE IF EXISTS public.bookings 
ADD COLUMN IF NOT EXISTS user_uuid uuid;

-- Add foreign key constraint
ALTER TABLE IF EXISTS public.bookings 
ADD CONSTRAINT bookings_user_uuid_fkey 
FOREIGN KEY (user_uuid) REFERENCES public.users(id);

-- Update comparisons table
ALTER TABLE IF EXISTS public.comparisons 
DROP CONSTRAINT IF EXISTS comparisons_user_id_fkey;

ALTER TABLE IF EXISTS public.comparisons 
ADD COLUMN IF NOT EXISTS user_uuid uuid;

ALTER TABLE IF EXISTS public.comparisons 
ADD CONSTRAINT comparisons_user_uuid_fkey 
FOREIGN KEY (user_uuid) REFERENCES public.users(id);

-- Update favourites table
ALTER TABLE IF EXISTS public.favourites 
DROP CONSTRAINT IF EXISTS favourites_user_id_fkey;

ALTER TABLE IF EXISTS public.favourites 
ADD COLUMN IF NOT EXISTS user_uuid uuid;

ALTER TABLE IF EXISTS public.favourites 
ADD CONSTRAINT favourites_user_uuid_fkey 
FOREIGN KEY (user_uuid) REFERENCES public.users(id);

-- Update reviews table
ALTER TABLE IF EXISTS public.reviews 
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

ALTER TABLE IF EXISTS public.reviews 
ADD COLUMN IF NOT EXISTS user_uuid uuid;

ALTER TABLE IF EXISTS public.reviews 
ADD CONSTRAINT reviews_user_uuid_fkey 
FOREIGN KEY (user_uuid) REFERENCES public.users(id);

-- Note: You may want to migrate existing data from the old integer user_id columns
-- to the new UUID columns if there's existing data.
-- For now, this just creates the structure.

COMMENT ON TABLE public.users IS 'User profiles that sync with Supabase Auth';
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates user profile when someone signs up via Supabase Auth';