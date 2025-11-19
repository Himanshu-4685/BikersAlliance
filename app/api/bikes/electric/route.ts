"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateBikeSlug, cleanBikeName } from "@/lib/slug-utils";

export async function GET(request: Request) {
  try {
    // Initialize Supabase client
    const supabase = createServerClient();

    console.log('Searching for electric bikes with engine_type containing "electric"...');
    
    const { data: electricBikes, error: electricBikesError } = await supabase
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
      .ilike('specs.engine_type', '%electric%')
      .not('on_road_price', 'is', null)
      .order('on_road_price', { ascending: true })
      .limit(12);

    if (electricBikesError) {
      console.error('Electric bikes query error:', electricBikesError);
      return errorResponse('Failed to fetch electric bikes', 500);
    }

    console.log(`Electric bikes found: ${electricBikes?.length || 0}`);
    
    if (electricBikes && electricBikes.length > 0) {
      const formattedElectricBikes = electricBikes.map((bike: any) => {
        console.log('Processing electric bike:', bike.variant_name, 'Engine type:', bike.specs?.engine_type);
        
        const brandName = bike.brands?.brand_name || 'Unknown';
        const modelName = bike.models?.model_name || 'Unknown';
        const variantName = bike.variant_name || '';
        const cleanName = cleanBikeName(modelName, variantName, brandName);
        const variantUrl = generateBikeSlug(cleanName);
        
        return {
          variant_id: bike.variant_id,
          variant_name: bike.variant_name,
          on_road_price: bike.on_road_price,
          variant_url: variantUrl,
          brand_name: bike.brands?.brand_name,
          brand_logo: bike.brands?.logo_url,
          model_name: bike.models?.model_name,
          engine_type: bike.specs?.engine_type,
          displacement: bike.specs?.displacement,
          peak_power: bike.specs?.peak_power,
          city_mileage: bike.specs?.city_mileage,
          bike_style: bike.specs?.body_type || 'Electric',
          image_url: bike.images?.[0]?.url || '/demo.avif'
        };
      });
      
      return successResponse({ bikes: formattedElectricBikes });
    } else {
      console.log('No electric bikes found');
      return successResponse({ bikes: [] });
    }
    
  } catch (error) {
    console.error('Error fetching electric bikes:', error);
    return errorResponse('Internal Server Error', 500);
  }
}