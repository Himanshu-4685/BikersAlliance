-- Clean up duplicate names in database
-- This will fix the "Yezdi Yezdi Scrambler Yezdi Scrambler Single Tone" issue

-- First, let's see the current problematic data
SELECT 
    s.status_id,
    s.status,
    b.brand_name,
    m.model_name,
    v.variant_name,
    CONCAT(b.brand_name, ' ', m.model_name, ' ', v.variant_name) as current_display_name
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id  
LEFT JOIN variants v ON s.variant_id = v.variant_id;

-- Solution 1: Update variant names to be complete and clean
-- For the Yezdi bike
UPDATE variants 
SET variant_name = 'Yezdi Scrambler Single Tone'
WHERE variant_id IN (
    SELECT v.variant_id 
    FROM variants v
    JOIN status s ON v.variant_id = s.variant_id
    WHERE s.status = 'upcoming'
    LIMIT 1
);

-- For the KTM bike  
UPDATE variants 
SET variant_name = 'KTM RC 390 STD'
WHERE variant_id IN (
    SELECT v.variant_id 
    FROM variants v
    JOIN status s ON v.variant_id = s.variant_id
    WHERE s.status = 'new_launch'
    LIMIT 1
);

-- Alternative Solution 2: If you want to keep separate fields, 
-- ensure the variant name doesn't duplicate brand/model info

-- Clean variant names by removing brand/model duplicates
UPDATE variants 
SET variant_name = 'Single Tone'
WHERE variant_name LIKE '%Scrambler%Single Tone%';

UPDATE variants 
SET variant_name = 'STD' 
WHERE variant_name LIKE '%RC 390%STD%';

-- Verify the cleaned data
SELECT 
    s.status_id,
    s.status,
    b.brand_name,
    m.model_name,
    v.variant_name,
    'Display will be: ' || v.variant_name as clean_display_name
FROM status s
LEFT JOIN brands b ON s.brand_id = b.brand_id
LEFT JOIN models m ON s.model_id = m.model_id
LEFT JOIN variants v ON s.variant_id = v.variant_id
ORDER BY s.status;