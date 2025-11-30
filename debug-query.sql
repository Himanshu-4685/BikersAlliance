-- Test query to check what body_type values exist in specs table
SELECT DISTINCT body_type, COUNT(*) as count
FROM specs 
WHERE body_type IS NOT NULL
GROUP BY body_type
ORDER BY count DESC;

-- Test query to see sample data
SELECT 
  v.variant_name,
  s.body_type,
  s.displacement,
  s.peak_power,
  s.city_mileage,
  b.brand_name,
  m.model_name
FROM variants v
JOIN specs s ON v.variant_id = s.variant_id
JOIN brands b ON v.brand_id = b.brand_id
JOIN models m ON v.model_id = m.model_id
WHERE s.body_type = 'commuter'
LIMIT 5;