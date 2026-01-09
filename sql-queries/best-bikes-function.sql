-- Create a SQL function in Supabase for optimal performance
-- This function implements the exact query you provided

CREATE OR REPLACE FUNCTION get_best_bikes()
RETURNS TABLE (
  brand_name text,
  model_name text,
  variant_name text,
  on_road_price bigint,
  displacement text,
  city_mileage text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.brand_name,
    m.model_name,
    v.variant_name,
    v.on_road_price,
    s.displacement,
    s.city_mileage
  FROM variants v
  JOIN specs s ON v.variant_id = s.variant_id
  JOIN models m ON v.model_id = m.model_id
  JOIN brands b ON v.brand_id = b.brand_id
  WHERE
    v.on_road_price BETWEEN 200000 AND 300000
    AND (
      NULLIF(regexp_replace(s.displacement, '[^0-9]', '', 'g'), '')::int
    ) BETWEEN 250 AND 350
    AND (
      NULLIF(regexp_replace(s.city_mileage, '[^0-9]', '', 'g'), '')::int
    ) > 40
  ORDER BY v.on_road_price ASC;
END;
$$ LANGUAGE plpgsql;