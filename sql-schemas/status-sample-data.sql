-- Sample data for status table
-- Insert sample upcoming and new launch bikes

-- First, let's assume we have some sample data in other tables
-- (This is just for reference - you'll need to use actual IDs from your database)

-- Sample upcoming bikes
INSERT INTO public.status (brand_id, model_id, variant_id, status, price_range, expected_launch) VALUES
-- KTM RC 390 (upcoming)
('550e8400-e29b-41d4-a716-446655440001', 1, 1, 'upcoming', '2.77 - 3.20 Lakh', '2024-03-15'),
-- Triumph Trident 660 (upcoming)
('550e8400-e29b-41d4-a716-446655440002', 2, 2, 'upcoming', '6.95 - 7.45 Lakh', '2024-04-20'),
-- Honda CB300R (upcoming)
('550e8400-e29b-41d4-a716-446655440003', 3, 3, 'upcoming', '2.40 - 2.70 Lakh', '2024-05-10'),
-- Royal Enfield Hunter 350 (upcoming)
('550e8400-e29b-41d4-a716-446655440004', 4, 4, 'upcoming', '1.50 - 1.70 Lakh', '2024-02-28');

-- Sample new launch bikes
INSERT INTO public.status (brand_id, model_id, variant_id, status, price_range, expected_launch, launch_date) VALUES
-- Recently launched bikes with actual specs available
('550e8400-e29b-41d4-a716-446655440005', 5, 5, 'new_launch', '1.20 - 1.40 Lakh', '2023-12-15', '2023-12-15'),
('550e8400-e29b-41d4-a716-446655440006', 6, 6, 'new_launch', '85000 - 95000', '2023-11-20', '2023-11-20'),
('550e8400-e29b-41d4-a716-446655440007', 7, 7, 'new_launch', '2.10 - 2.30 Lakh', '2024-01-05', '2024-01-05'),
('550e8400-e29b-41d4-a716-446655440008', 8, 8, 'new_launch', '75000 - 85000', '2023-12-01', '2023-12-01');

-- Query to get upcoming bikes with brand and model details
-- SELECT 
--   s.status_id,
--   b.brand_name,
--   m.model_name,
--   v.variant_name,
--   s.status,
--   s.price_range,
--   s.expected_launch,
--   s.launch_date
-- FROM status s
-- JOIN brands b ON s.brand_id = b.brand_id
-- JOIN models m ON s.model_id = m.model_id
-- JOIN variants v ON s.variant_id = v.variant_id
-- WHERE s.status = 'upcoming'
-- ORDER BY s.expected_launch ASC;

-- Query to get new launch bikes with specs
-- SELECT 
--   s.status_id,
--   b.brand_name,
--   m.model_name,
--   v.variant_name,
--   s.status,
--   s.price_range,
--   s.launch_date,
--   sp.engine_type,
--   sp.displacement,
--   sp.peak_power,
--   sp.city_mileage,
--   sp.body_type
-- FROM status s
-- JOIN brands b ON s.brand_id = b.brand_id
-- JOIN models m ON s.model_id = m.model_id
-- JOIN variants v ON s.variant_id = v.variant_id
-- LEFT JOIN specs sp ON s.variant_id = sp.variant_id
-- WHERE s.status = 'new_launch'
-- ORDER BY s.launch_date DESC;