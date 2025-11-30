-- Sample data to fix the issues you're seeing
-- Run this in your Supabase SQL Editor to add proper test data

-- First, let's check what data you currently have
-- SELECT * FROM status;
-- SELECT * FROM brands;
-- SELECT * FROM models;
-- SELECT * FROM variants;

-- Add sample brand if it doesn't exist
INSERT INTO brands (brand_id, brand_name, logo_url, country, description)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Yezdi', '/demo.avif', 'India', 'Yezdi Motorcycles'),
  ('550e8400-e29b-41d4-a716-446655440002', 'KTM', '/demo.avif', 'Austria', 'KTM AG')
ON CONFLICT (brand_id) DO UPDATE SET 
  brand_name = EXCLUDED.brand_name,
  logo_url = EXCLUDED.logo_url;

-- Add sample models
INSERT INTO models (model_id, brand_id, model_name)
VALUES 
  (1, '550e8400-e29b-41d4-a716-446655440001', 'Scrambler'),
  (2, '550e8400-e29b-41d4-a716-446655440002', 'RC 390')
ON CONFLICT (model_id) DO UPDATE SET 
  model_name = EXCLUDED.model_name;

-- Add sample variants with proper pricing
INSERT INTO variants (variant_id, model_id, brand_id, variant_name, on_road_price, url)
VALUES 
  (1, 1, '550e8400-e29b-41d4-a716-446655440001', 'Single Tone', 235000, 'yezdi-scrambler-single-tone'),
  (2, 2, '550e8400-e29b-41d4-a716-446655440002', 'STD', 290000, 'ktm-rc-390-std')
ON CONFLICT (variant_id) DO UPDATE SET 
  variant_name = EXCLUDED.variant_name,
  on_road_price = EXCLUDED.on_road_price,
  url = EXCLUDED.url;

-- Add sample images
INSERT INTO images (variant_id, url, alt_text)
VALUES 
  (1, '/demo.avif', 'Yezdi Scrambler Single Tone'),
  (2, '/demo.avif', 'KTM RC 390 STD')
ON CONFLICT DO NOTHING;

-- Add sample specs for new_launch bikes
INSERT INTO specs (variant_id, engine_type, displacement, peak_power, city_mileage, highway_mileage, body_type, transmission, max_torque)
VALUES 
  (2, 'Single Cylinder', '373.2 cc', '43 PS', '25 kmpl', '30 kmpl', 'Sports', 'Manual', '37 Nm')
ON CONFLICT (variant_id) DO UPDATE SET 
  engine_type = EXCLUDED.engine_type,
  displacement = EXCLUDED.displacement,
  peak_power = EXCLUDED.peak_power,
  city_mileage = EXCLUDED.city_mileage,
  highway_mileage = EXCLUDED.highway_mileage,
  body_type = EXCLUDED.body_type,
  transmission = EXCLUDED.transmission,
  max_torque = EXCLUDED.max_torque;

-- Update your existing status records to use these proper IDs
-- You'll need to replace the IDs with your actual status table IDs
UPDATE status 
SET 
  brand_id = '550e8400-e29b-41d4-a716-446655440001',
  model_id = 1,
  variant_id = 1
WHERE status = 'upcoming';

UPDATE status 
SET 
  brand_id = '550e8400-e29b-41d4-a716-446655440002',
  model_id = 2,
  variant_id = 2
WHERE status = 'new_launch';

-- Verify the data
SELECT 
  s.status_id,
  s.status,
  s.price_range,
  s.expected_launch,
  s.launch_date,
  b.brand_name,
  m.model_name,
  v.variant_name,
  v.on_road_price,
  v.url
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
ORDER BY s.status, s.created_at;