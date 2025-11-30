-- Create wishlist table for user favorite bikes
-- This replaces/enhances the existing favourites table with better structure

-- Drop existing favourites table if needed and create new wishlist table
DROP TABLE IF EXISTS public.favourites CASCADE;

CREATE TABLE public.wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL, -- Using text to match Supabase auth.users.id type
  bike_id text NOT NULL, -- Reference to bike slug or ID 
  bike_name text NOT NULL,
  bike_image_url text,
  bike_price numeric,
  bike_slug text NOT NULL,
  brand_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT wishlist_pkey PRIMARY KEY (id),
  -- Unique constraint to prevent duplicate wishlist entries
  CONSTRAINT wishlist_user_bike_unique UNIQUE (user_id, bike_slug)
);

-- Create indexes for better performance
CREATE INDEX idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX idx_wishlist_bike_slug ON public.wishlist(bike_slug);
CREATE INDEX idx_wishlist_created_at ON public.wishlist(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own wishlist items
CREATE POLICY "Users can view their own wishlist items" ON public.wishlist
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own wishlist items" ON public.wishlist
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own wishlist items" ON public.wishlist
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own wishlist items" ON public.wishlist
  FOR DELETE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT ALL ON public.wishlist TO authenticated;
GRANT SELECT ON public.wishlist TO anon;

-- Comment for documentation
COMMENT ON TABLE public.wishlist IS 'User wishlist/favorites for bikes - stores user preferred bikes';
COMMENT ON COLUMN public.wishlist.user_id IS 'References auth.users.id - the user who added to wishlist';
COMMENT ON COLUMN public.wishlist.bike_id IS 'Bike identifier (could be slug or UUID)';
COMMENT ON COLUMN public.wishlist.bike_slug IS 'URL-friendly bike identifier for routing';
COMMENT ON COLUMN public.wishlist.bike_name IS 'Cached bike name for quick display';
COMMENT ON COLUMN public.wishlist.bike_image_url IS 'Cached bike image URL for quick display';
COMMENT ON COLUMN public.wishlist.bike_price IS 'Cached bike price for quick display';