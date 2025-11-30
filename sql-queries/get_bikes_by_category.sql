-- SQL function to get bikes by category
-- This function can be created in your Supabase SQL editor

CREATE OR REPLACE FUNCTION get_bikes_by_category(category_name text)
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
  -- For mileage category, return bikes with best mileage regardless of body type
  IF category_name = 'mileage' THEN
    RETURN QUERY
    SELECT
      v.variant_id::text,
      v.variant_name,
      v.on_road_price,
      v.url AS variant_url,
      b.brand_name,
      b.logo_url AS brand_logo,
      m.model_name,
      s.engine_type,
      s.displacement,
      s.peak_power,
      s.city_mileage,
      s.body_type AS bike_style,
      COALESCE(i.url, '/demo.avif') AS image_url
    FROM public.variants v
    JOIN public.brands b ON v.brand_id = b.brand_id
    JOIN public.models m ON v.model_id = m.model_id
    LEFT JOIN public.specs s ON v.variant_id = s.variant_id
    LEFT JOIN public.images i ON v.variant_id = i.variant_id
    WHERE s.city_mileage IS NOT NULL
    ORDER BY s.city_mileage DESC
    LIMIT 10;
  -- For electric category, use specific electric bike filter  
  ELSIF category_name = 'electric' THEN
    RETURN QUERY
    SELECT
      v.variant_id::text,
      v.variant_name,
      v.on_road_price,
      v.url AS variant_url,
      b.brand_name,
      b.logo_url AS brand_logo,
      m.model_name,
      s.engine_type,
      s.displacement,
      s.peak_power,
      s.city_mileage,
      s.body_type AS bike_style,
      COALESCE(i.url, '/demo.avif') AS image_url
    FROM public.variants v
    INNER JOIN public.brands b ON v.brand_id = b.brand_id
    INNER JOIN public.specs s ON v.variant_id = s.variant_id
    LEFT JOIN public.images i ON v.variant_id = i.variant_id
    WHERE LOWER(s.body_type) LIKE '%electric%'
      AND v.on_road_price IS NOT NULL
    ORDER BY v.on_road_price ASC
    LIMIT 12;
  ELSE
    -- For other categories, filter by body type
    RETURN QUERY
    SELECT
      v.variant_id::text,
      v.variant_name,
      v.on_road_price,
      v.url AS variant_url,
      b.brand_name,
      b.logo_url AS brand_logo,
      m.model_name,
      s.engine_type,
      s.displacement,
      s.peak_power,
      s.city_mileage,
      s.body_type AS bike_style,
      COALESCE(i.url, '/demo.avif') AS image_url
    FROM public.variants v
    JOIN public.brands b ON v.brand_id = b.brand_id
    JOIN public.models m ON v.model_id = m.model_id
    LEFT JOIN public.specs s ON v.variant_id = s.variant_id
    LEFT JOIN public.images i ON v.variant_id = i.variant_id
    WHERE LOWER(s.body_type) = LOWER(category_name)
    ORDER BY v.on_road_price ASC
    LIMIT 10;
  END IF;
END;
$$;