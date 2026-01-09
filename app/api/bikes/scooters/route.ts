"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateBikeSlug, cleanBikeName } from "@/lib/slug-utils";

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createServerClient();

    console.log('Searching for scooters with body_type containing "scooter"...');
    
    const { data: scooters, error: scootersError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        brands!inner(brand_name, logo_url),
        models!inner(model_name),
        specs!inner(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `)
      .ilike('specs.body_type', '%scooter%')
      .not('on_road_price', 'is', null)
      .order('on_road_price', { ascending: true });

    if (scootersError) {
      console.error('Scooters query error:', scootersError);
      return errorResponse('Failed to fetch scooters', 500);
    }

    console.log(`Scooters found: ${scooters?.length || 0}`);
    
    if (scooters && scooters.length > 0) {
      const formattedScooters = scooters.map((scooter: any) => {
        console.log('Processing scooter:', scooter.variant_name, 'Body type:', scooter.specs?.body_type);
        
        const brandName = scooter.brands?.brand_name || 'Unknown';
        const modelName = scooter.models?.model_name || 'Unknown';
        const variantName = scooter.variant_name || '';
        const cleanName = cleanBikeName(modelName, variantName, brandName);
        const variantUrl = generateBikeSlug(cleanName);
        
        return {
          variant_id: scooter.variant_id,
          variant_name: scooter.variant_name,
          on_road_price: scooter.on_road_price,
          variant_url: variantUrl,
          brand_name: scooter.brands?.brand_name,
          brand_logo: scooter.brands?.logo_url,
          model_name: scooter.models?.model_name,
          engine_type: scooter.specs?.engine_type,
          displacement: scooter.specs?.displacement,
          peak_power: scooter.specs?.peak_power,
          city_mileage: scooter.specs?.city_mileage,
          bike_style: scooter.specs?.body_type || 'Scooter',
          image_url: scooter.images?.[0]?.url || '/demo.avif'
        };
      });
      
      return successResponse({ bikes: formattedScooters });
    } else {
      console.log('No scooters found with body_type containing "scooter"');
      return successResponse({ bikes: [] });
    }
    
  } catch (error) {
    console.error('Error fetching scooters:', error);
    return errorResponse('Internal Server Error', 500);
  }
}