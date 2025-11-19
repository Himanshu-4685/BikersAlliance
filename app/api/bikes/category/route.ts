"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateBikeSlug, cleanBikeName } from "@/lib/slug-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    if (!category) {
      return errorResponse('Category parameter is required', 400);
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    // Strategy: Use different approaches for different categories
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        brands!inner(brand_name, logo_url),
        models!inner(model_name),
        specs!left(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `);

    // Apply different filters based on category
    switch (category.toLowerCase()) {
      case 'commuter':
        // Commuter bikes: typically lower price range and good mileage
        query = query
          .lte('on_road_price', 150000) // Under 1.5L
          .order('on_road_price', { ascending: true });
        break;
      
      case 'sports':
        // Sports bikes: higher price and power
        query = query
          .gte('on_road_price', 100000) // Above 1L
          .order('on_road_price', { ascending: false }); // Sort by price desc for sports
        break;
      
      case 'cruiser':
        // Cruiser bikes: mid to high price range
        query = query
          .gte('on_road_price', 200000) // Above 1.5L
          .order('on_road_price', { ascending: true });
        break;
      
      case 'mileage':
        // Best mileage bikes: get all bikes with mileage data, will sort by mileage in post-processing
        query = query
          .lte('on_road_price', 300000) // Focus on bikes under 3L
          .order('on_road_price', { ascending: true });
        break;
      
      case 'electric':
        // Electric bikes: Search for bikes where body_type contains 'electric'
        console.log('Searching for electric bikes in body_type field...');
        
        const { data: electricBikes, error: electricError } = await supabase
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
          .ilike('specs.body_type', '%electric%')
          .not('on_road_price', 'is', null)
          .order('on_road_price', { ascending: true })
          .limit(12);

        if (electricError) {
          console.error('Electric bikes query error:', electricError);
          return errorResponse('Failed to fetch electric bikes', 500);
        }

        console.log(`Electric bikes found: ${electricBikes?.length || 0}`);
        
        if (electricBikes && electricBikes.length > 0) {
          const formattedElectricBikes = electricBikes.map((bike: any) => {
            console.log('Processing electric bike:', bike.variant_name, 'Body type:', bike.specs?.body_type);
            
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
              engine_type: bike.specs?.engine_type || 'Electric',
              displacement: bike.specs?.displacement,
              peak_power: bike.specs?.peak_power,
              city_mileage: bike.specs?.city_mileage,
              bike_style: bike.specs?.body_type || 'Electric',
              image_url: bike.images?.[0]?.url || '/demo.avif'
            };
          });
          
          return successResponse({ bikes: formattedElectricBikes });
        } else {
          console.log('No electric bikes found with body_type containing "electric"');
          return successResponse({ bikes: [] });
        }
        // This break is intentionally after the return statements above
        break;
      
      default:
        // Default: just return bikes sorted by price
        query = query.order('on_road_price', { ascending: true });
    }

    const { data: bikes, error } = await query.limit(10);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Category: ${category}, Found bikes:`, bikes?.length || 0);

    // Post-process results for mileage category
    let processedBikes = bikes || [];
    if (category.toLowerCase() === 'mileage') {
      // Filter bikes that have mileage data and sort by city_mileage in descending order
      processedBikes = processedBikes
        .filter((bike: any) => {
          const mileage = bike.specs?.city_mileage;
          if (!mileage || mileage === 'N/A') return false;
          
          // Extract numeric value from mileage string (e.g., "80 kmpl" -> 80)
          const numericMileage = parseFloat(String(mileage));
          return !isNaN(numericMileage) && numericMileage > 0;
        })
        .sort((a: any, b: any) => {
          const getMileageValue = (mileageStr: string) => {
            const numericValue = parseFloat(String(mileageStr || '0'));
            return isNaN(numericValue) ? 0 : numericValue;
          };
          
          const mileageA = getMileageValue(a.specs?.city_mileage);
          const mileageB = getMileageValue(b.specs?.city_mileage);
          return mileageB - mileageA; // Sort by mileage in descending order (best first)
        });
      
      console.log(`Mileage category: Found ${processedBikes.length} bikes with mileage data`);
    }

    // Format the data to match the expected structure
    const formattedBikes = processedBikes.map((bike: any) => {
      console.log('Processing bike:', bike.variant_name, 'Specs:', bike.specs);
      
      // Create a proper URL slug from variant name
      const brandName = bike.brands?.brand_name || 'Unknown';
      const modelName = bike.models?.model_name || 'Unknown';
      const variantName = bike.variant_name || '';
      const cleanName = cleanBikeName(modelName, variantName, brandName);
      const variantUrl = generateBikeSlug(cleanName);
      
      return {
        variant_id: bike.variant_id,
        variant_name: bike.variant_name, // Just the variant name
        on_road_price: bike.on_road_price,
        variant_url: variantUrl,
        brand_name: bike.brands?.brand_name,
        brand_logo: bike.brands?.logo_url,
        model_name: bike.models?.model_name,
        engine_type: bike.specs?.engine_type,
        displacement: bike.specs?.displacement,
        peak_power: bike.specs?.peak_power,
        city_mileage: bike.specs?.city_mileage,
        bike_style: bike.specs?.body_type,
        image_url: bike.images?.[0]?.url || '/demo.avif'
      };
    });

    return successResponse({ bikes: formattedBikes });

  } catch (error) {
    console.error('Error fetching bikes by category:', error);
    return errorResponse('Failed to fetch bikes by category', 500);
  }
}