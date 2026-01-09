-- Add features column to bike_offers table
-- This column will store an array of features/benefits for each offer

ALTER TABLE bike_offers 
ADD COLUMN features TEXT[];

-- Add comment to the column
COMMENT ON COLUMN bike_offers.features IS 'Array of features/benefits included with the offer (e.g., Free Registration, 2 Year Extended Warranty)';

-- Optional: Add index for better query performance if needed for searching within features
-- CREATE INDEX IF NOT EXISTS idx_bike_offers_features ON bike_offers USING GIN (features);

-- Example usage:
-- INSERT INTO bike_offers (title, bike_name, features, ...) 
-- VALUES ('Special Offer', 'Honda Activa', ARRAY['Free Registration', '2 Year Extended Warranty', 'Zero Down Payment'], ...);

-- Query examples:
-- -- Find offers with specific feature
-- SELECT * FROM bike_offers WHERE 'Free Registration' = ANY(features);
-- 
-- -- Find offers with any of multiple features
-- SELECT * FROM bike_offers WHERE features && ARRAY['Free Registration', 'Zero Down Payment'];