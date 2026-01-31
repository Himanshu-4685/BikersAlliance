"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateBikeSlug, cleanBikeName } from "@/lib/slug-utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log('Scooters API received URL params:', request.url);

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minDisplacement = searchParams.get('minDisplacement') ? Number(searchParams.get('minDisplacement')) : undefined;
    const maxDisplacement = searchParams.get('maxDisplacement') ? Number(searchParams.get('maxDisplacement')) : undefined;
    const minMileage = searchParams.get('minMileage') ? Number(searchParams.get('minMileage')) : undefined;
    
    // Check if displacement filtering is needed
    const hasDisplacementFilter = minDisplacement !== undefined || maxDisplacement !== undefined;
    const hasMileageFilter = minMileage !== undefined;
    
    console.log('Parsed scooter filters:', { minPrice, maxPrice, minDisplacement, maxDisplacement, minMileage, brand });
    
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    
    // Fetch more data if displacement or mileage filtering is needed (post-processing)
    const fetchLimit = (hasDisplacementFilter || hasMileageFilter) ? Math.max(limit * 20, 500) : limit;
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabase = createServerClient();

    console.log('Searching for scooters with body_type containing "scooter"...');
    
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        brand_id,
        brands!inner(brand_name, logo_url),
        models!inner(model_name),
        specs!inner(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `)
      .ilike('specs.body_type', '%scooter%')
      .not('on_road_price', 'is', null);

    // Apply search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      const cleanBrandName = brand.trim().replace(/[\n\r]/g, '');
      
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .ilike('brand_name', cleanBrandName)
        .single();
        
      if (brandData) {
        console.log('Filtering scooters by brand_id:', (brandData as any).brand_id);
        query = query.eq('brand_id', (brandData as any).brand_id);
      }
    }

    // Price filters
    if (minPrice !== undefined) {
      console.log('Filtering scooters by min price:', minPrice);
      query = query.gte('on_road_price', minPrice);
    }

    if (maxPrice !== undefined) {
      console.log('Filtering scooters by max price:', maxPrice);
      query = query.lte('on_road_price', maxPrice);
    }

    // Set sorting order
    if (sortBy === 'price') {
      query = query.order('on_road_price', { ascending: sortOrder === 'asc' });
    } else if (sortBy === 'name') {
      query = query.order('variant_name', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('on_road_price', { ascending: true });
    }

    // If we need to filter by displacement or mileage, fetch more records for post-processing
    if (!hasDisplacementFilter && !hasMileageFilter) {
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.limit(fetchLimit);
    }

    const { data: scooters, error: scootersError } = await query;

    if (scootersError) {
      console.error('Scooters query error:', scootersError);
      return errorResponse('Failed to fetch scooters', 500);
    }

    console.log(`Scooters found before filtering: ${scooters?.length || 0}`);
    
    if (scooters && scooters.length > 0) {
      let filteredScooters = [...scooters];

      // Post-process displacement filtering (since displacement is stored as text)
      if (hasDisplacementFilter) {
        filteredScooters = filteredScooters.filter((scooter: any) => {
          const displacement = parseFloat(scooter.specs?.displacement || '0');
          if (minDisplacement !== undefined && displacement < minDisplacement) return false;
          if (maxDisplacement !== undefined && displacement > maxDisplacement) return false;
          return true;
        });
      }

      // Post-process mileage filtering (since mileage is stored as text)
      if (hasMileageFilter) {
        filteredScooters = filteredScooters.filter((scooter: any) => {
          const mileage = parseFloat(scooter.specs?.city_mileage || '0');
          return minMileage === undefined || mileage >= minMileage;
        });
      }

      console.log(`Scooters found after filtering: ${filteredScooters.length}`);

      // Apply pagination for post-processed results
      const totalFiltered = filteredScooters.length;
      const totalPages = Math.ceil(totalFiltered / limit);
      
      if (hasDisplacementFilter || hasMileageFilter) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        filteredScooters = filteredScooters.slice(startIndex, endIndex);
      }

      const formattedScooters = filteredScooters.map((scooter: any) => {
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
      
      return successResponse({ 
        bikes: formattedScooters,
        pagination: {
          total: hasDisplacementFilter || hasMileageFilter ? totalFiltered : filteredScooters.length,
          page,
          limit,
          totalPages: hasDisplacementFilter || hasMileageFilter ? totalPages : Math.ceil(filteredScooters.length / limit)
        }
      });
    } else {
      console.log('No scooters found with body_type containing "scooter"');
      return successResponse({ 
        bikes: [],
        pagination: {
          total: 0,
          page: 1,
          limit,
          totalPages: 0
        }
      });
    }
    
  } catch (error) {
    console.error('Error fetching scooters:', error);
    return errorResponse('Internal Server Error', 500);
  }
}