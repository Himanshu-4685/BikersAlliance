-- Fix image paths for status table bikes
-- This ensures all bikes have proper image paths

-- Check current image situation for status bikes
SELECT 
    s.status_id,
    s.status,
    b.brand_name,
    m.model_name,
    v.variant_name,
    i.image_path,
    i.alt_text
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
LEFT JOIN images i ON v.variant_id = i.variant_id;

-- Insert demo images for variants that don't have images
INSERT INTO images (variant_id, image_path, alt_text, display_order, is_primary)
SELECT DISTINCT 
    v.variant_id,
    '/demo.avif' as image_path,
    CONCAT(b.brand_name, ' ', m.model_name, ' ', v.variant_name) as alt_text,
    1 as display_order,
    true as is_primary
FROM status s
JOIN variants v ON s.variant_id = v.variant_id
JOIN models m ON s.model_id = m.model_id
JOIN brands b ON s.brand_id = b.brand_id
WHERE NOT EXISTS (
    SELECT 1 FROM images 
    WHERE images.variant_id = v.variant_id 
    AND images.is_primary = true
);

-- Update existing null/empty image paths to demo image
UPDATE images 
SET image_path = '/demo.avif'
WHERE (image_path IS NULL OR image_path = '' OR image_path = 'null')
AND variant_id IN (
    SELECT variant_id FROM status
);

-- Verify all status bikes now have images
SELECT 
    s.status_id,
    s.status,
    b.brand_name,
    m.model_name,
    v.variant_name,
    i.image_path,
    'Fixed: ' || COALESCE(i.image_path, '/demo.avif') as final_image_path
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
LEFT JOIN images i ON v.variant_id = i.variant_id AND i.is_primary = true
ORDER BY s.status;