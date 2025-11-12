-- Fix naming and data issues in database
-- Run this SQL in your Supabase SQL Editor

-- First, let's see what we currently have
SELECT 
    s.status_id,
    s.status,
    s.price_range,
    b.brand_name,
    m.model_name,
    v.variant_name,
    v.on_road_price
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id;

-- Update variant names to be more complete and descriptive
-- Based on your screenshot showing "Yezdi Scrambler Single Tone" and "KTM RC 390 STD"

-- For Yezdi Scrambler
UPDATE variants 
SET variant_name = 'Scrambler Single Tone'
WHERE variant_name = 'Single Tone' 
AND variant_id IN (
    SELECT v.variant_id 
    FROM variants v
    JOIN models m ON v.model_id = m.model_id
    JOIN brands b ON v.brand_id = b.brand_id
    WHERE b.brand_name = 'Yezdi' AND m.model_name = 'Scrambler'
);

-- For KTM RC 390
UPDATE variants 
SET variant_name = 'RC 390 STD'
WHERE variant_name = 'STD' 
AND variant_id IN (
    SELECT v.variant_id 
    FROM variants v
    JOIN models m ON v.model_id = m.model_id
    JOIN brands b ON v.brand_id = b.brand_id
    WHERE b.brand_name = 'KTM' AND (m.model_name = 'RC 390' OR m.model_name = 'RC')
);

-- Add proper pricing if missing
UPDATE variants 
SET on_road_price = 245493
WHERE variant_name LIKE '%Scrambler%' AND on_road_price IS NULL;

UPDATE variants 
SET on_road_price = 372324
WHERE variant_name LIKE '%RC 390%' AND on_road_price IS NULL;

-- Ensure we have proper demo images for testing
INSERT INTO images (variant_id, url, alt_text)
SELECT 
    v.variant_id,
    '/demo.avif',
    CONCAT(b.brand_name, ' ', v.variant_name)
FROM variants v
JOIN brands b ON v.brand_id = b.brand_id
WHERE v.variant_id NOT IN (SELECT DISTINCT variant_id FROM images WHERE variant_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Verify the final result
SELECT 
    s.status_id,
    s.status,
    s.price_range,
    b.brand_name,
    m.model_name,
    v.variant_name,
    v.on_road_price,
    COUNT(i.image_id) as image_count
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
LEFT JOIN images i ON v.variant_id = i.variant_id
GROUP BY s.status_id, s.status, s.price_range, b.brand_name, m.model_name, v.variant_name, v.on_road_price
ORDER BY s.status;