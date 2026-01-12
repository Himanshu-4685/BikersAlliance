-- Migration to fix bookings table user_id type mismatch
-- This script updates the bookings table to use UUID for user_id instead of integer

-- Step 1: Drop existing foreign key constraint
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Step 2: Change user_id column type from integer to uuid
ALTER TABLE public.bookings ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- Step 3: Add new foreign key constraint to auth.users
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Optional: Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);