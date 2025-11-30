-- Query to check current data and understand naming patterns
-- Run this in Supabase SQL Editor to see what your data looks like

-- Check current status table data
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
    v.url as variant_slug
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
ORDER BY s.status, s.created_at;

-- Expected output should show something like:
-- brand_name: "Yezdi", model_name: "Scrambler", variant_name: "Single Tone"
-- brand_name: "KTM", model_name: "RC", variant_name: "390"

-- If your variant names are not complete, you can update them like this:
-- UPDATE variants SET variant_name = 'Scrambler Single Tone' WHERE variant_id = 1;
-- UPDATE variants SET variant_name = 'RC 390 STD' WHERE variant_id = 2;