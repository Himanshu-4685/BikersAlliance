-- Create a specific function for electric bikes
CREATE OR REPLACE FUNCTION get_electric_bikes()
RETURNS TABLE(
  variant_id text,
  variant_name text,
  on_road_price bigint,
  variant_url text,
  brand_name text,
  brand_logo text,
  model_name text,
  engine_type text,
  displacement numeric,
  peak_power numeric,
  city_mileage numeric,
  bike_style text,
  image_url text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.variant_id::text,
    v.variant_name,
    v.on_road_price,
    v.url as variant_url,
    b.brand_name,
    b.logo_url as brand_logo,
    m.model_name,
    s.engine_type,
    s.displacement,
    s.peak_power,
    s.city_mileage,
    s.body_type as bike_style,
    COALESCE(i.url, '/demo.avif') as image_url
  FROM variants v
  INNER JOIN brands b ON v.brand_id = b.brand_id
  INNER JOIN models m ON v.model_id = m.model_id
  INNER JOIN specs s ON v.variant_id = s.variant_id
  LEFT JOIN images i ON v.variant_id = i.variant_id
  WHERE LOWER(s.body_type) LIKE '%electric%'
    AND v.on_road_price IS NOT NULL
  ORDER BY v.on_road_price ASC
  LIMIT 12;
END;
$$;