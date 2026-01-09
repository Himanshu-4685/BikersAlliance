-- Add image column to bike_offers table
ALTER TABLE bike_offers 
ADD COLUMN image TEXT;

-- Add comment to the column
COMMENT ON COLUMN bike_offers.image IS 'URL to the offer image stored in Supabase storage';

-- Optional: Add index for better query performance if needed
-- CREATE INDEX IF NOT EXISTS idx_bike_offers_image ON bike_offers(image);

-- Update existing records to have NULL image initially
-- (This is automatically handled by ALTER TABLE ADD COLUMN)