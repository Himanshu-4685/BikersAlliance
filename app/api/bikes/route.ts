"use server";

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    console.log('API received URL params:', request.url);

    // Parse filter parameters
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const model = searchParams.get('model'); // Add model filter
    const bodyType = searchParams.get('bodyType');
    const engineType = searchParams.get('engineType');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minDisplacement = searchParams.get('minDisplacement') ? Number(searchParams.get('minDisplacement')) : undefined;
    const maxDisplacement = searchParams.get('maxDisplacement') ? Number(searchParams.get('maxDisplacement')) : undefined;
    const minMileage = searchParams.get('minMileage') ? Number(searchParams.get('minMileage')) : undefined;
    
    // Check if displacement filtering is needed
    const hasDisplacementFilter = minDisplacement !== undefined || maxDisplacement !== undefined;
    const hasMileageFilter = minMileage !== undefined;
    
    console.log('Parsed filters:', { minPrice, maxPrice, minDisplacement, maxDisplacement, minMileage, brand, bodyType });
    
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    
    // Fetch more data if displacement or mileage filtering is needed (post-processing)
    const fetchLimit = (hasDisplacementFilter || hasMileageFilter) ? Math.max(limit * 3, 36) : limit;
    const offset = (page - 1) * limit;

    // Initialize Supabase client
    const supabase = createServerClient();

    // Query variants with model, brand, and specs information
    let query = supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(brand_name, logo_url),
        specs!inner(engine_type, displacement, peak_power, city_mileage, body_type),
        images!left(url)
      `);

    // Apply search filter
    if (search) {
      query = query.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }

    // Apply brand filter
    if (brand) {
      // Clean brand name to handle any whitespace issues
      const cleanBrandName = brand.trim().replace(/[\n\r]/g, '');
      
      // Look up brand by name or use directly if it's already a brand name
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .ilike('brand_name', cleanBrandName)
        .single();
        
      if (brandData) {
        console.log('Filtering by brand_id:', (brandData as any).brand_id);
        query = query.eq('brand_id', (brandData as any).brand_id);
      }
    }

    // Apply model filter
    if (model) {
      console.log('Filtering by model:', model);
      // Filter by model_id directly if it's a UUID or number, otherwise filter by model name
      if (model.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(model))) {
        // It's a UUID or number, filter by model_id
        console.log('Filtering by model_id:', model);
        query = query.eq('model_id', model);
      } else {
        // It's a model name, look up model by name
        console.log('Looking up model by name:', model);
        const { data: modelData } = await supabase
          .from('models')
          .select('model_id')
          .ilike('model_name', model)
          .single();
          
        if (modelData) {
          console.log('Found model ID:', (modelData as any).model_id);
          query = query.eq('model_id', (modelData as any).model_id);
        } else {
          console.log('Model not found:', model);
        }
      }
    }

    // Apply body type filter
    if (bodyType) {
      console.log('Filtering by body type:', bodyType);
      
      // Simple approach - use the main pattern for each body type
      const bodyTypePatterns: Record<string, string> = {
        'commuter': 'commuter',
        'sports': 'sport',
        'cruiser': 'cruiser',
        'adventure': 'adventure',
        'scooter': 'scooter',
        'off-road': 'off',
        'electric': 'electric',
        'moped': 'moped',
        'naked': 'naked',
        'super': 'super',
        'tourer': 'tour',
        'touring': 'tour',
        'scrambler': 'scrambler',
        'street': 'street',
        'cafe-racer': 'cafe',
        'dirt': 'dirt',
        'roadster': 'roadster'
      };
      
      const pattern = bodyTypePatterns[bodyType.toLowerCase()] || bodyType;
      query = query.ilike('specs.body_type', `%${pattern}%`);
    }

    // Note: Displacement filtering will be handled in post-processing due to text storage with decimal values
    if (hasDisplacementFilter) {
      console.log('Displacement filters will be applied post-query:', { minDisplacement, maxDisplacement });
    }

    // Note: Mileage filtering will be handled in post-processing due to text storage with decimal values
    if (hasMileageFilter) {
      console.log('Mileage filters will be applied post-query:', { minMileage });
    }

    // Price filters
    if (minPrice !== undefined) {
      console.log('Filtering by min price:', minPrice);
      query = query.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      console.log('Filtering by max price:', maxPrice);
      query = query.lte('on_road_price', maxPrice);
    }

    // Engine type filter
    if (engineType) {
      // Map the engine type slug to the pattern to search for
      const engineTypeMapping: { [key: string]: string } = {
        '4-stroke': '4-stroke',
        '2-stroke': '2-stroke',
        'electric': 'Electric',
        'single-cylinder': 'Single cylinder',
        'multi-cylinder': 'Multi'
      };
      
      const searchPattern = engineTypeMapping[engineType];
      if (searchPattern) {
        query = query.ilike('specs.engine_type', `%${searchPattern}%`);
      }
    }

    // Sorting
    const ascending = sortOrder === 'asc';
    switch (sortBy) {
      case 'price':
        query = query.order('on_road_price', { ascending });
        break;
      case 'name':
        query = query.order('variant_name', { ascending });
        break;
      default:
        query = query.order('on_road_price', { ascending: true });
    }

    // Apply pagination - fetch more when displacement or mileage filtering is needed
    if (hasDisplacementFilter || hasMileageFilter) {
      query = query.range(0, fetchLimit - 1);
    } else {
      query = query.range(offset, offset + limit - 1);
    }

    // Execute the query
    const { data: variants, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination (apply same filters)
    let countQuery = supabase
      .from('variants')
      .select('variant_id', { count: 'exact', head: true });
      
    // Apply the same filters for counting
    if (search) {
      countQuery = countQuery.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
    }
    if (brand) {
      const { data: brandData } = await supabase
        .from('brands')
        .select('brand_id')
        .ilike('brand_name', brand)
        .single();
      if (brandData) {
        countQuery = countQuery.eq('brand_id', (brandData as any).brand_id);
      }
    }
    if (model) {
      if (model.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(model))) {
        countQuery = countQuery.eq('model_id', model);
      } else {
        const { data: modelData } = await supabase
          .from('models')
          .select('model_id')
          .ilike('model_name', model)
          .single();
        if (modelData) {
          countQuery = countQuery.eq('model_id', (modelData as any).model_id);
        }
      }
    }

    // Check if we need specs join for any filter
    const needsSpecsJoin = bodyType || minDisplacement !== undefined || maxDisplacement !== undefined || minMileage !== undefined || engineType;
    
    if (needsSpecsJoin) {
      countQuery = supabase
        .from('variants')
        .select('variant_id, specs!inner(*)', { count: 'exact', head: true });
        
      // Apply all filters that were applied to main query
      if (search) {
        countQuery = countQuery.or(`variant_name.ilike.%${search}%,models.model_name.ilike.%${search}%,brands.brand_name.ilike.%${search}%`);
      }
      if (brand) {
        const { data: brandData } = await supabase
          .from('brands')
          .select('brand_id')
          .ilike('brand_name', brand)
          .single();
        if (brandData) {
          countQuery = countQuery.eq('brand_id', (brandData as any).brand_id);
        }
      }
      if (model) {
        if (model.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) || !isNaN(Number(model))) {
          countQuery = countQuery.eq('model_id', model);
        } else {
          const { data: modelData } = await supabase
            .from('models')
            .select('model_id')
            .ilike('model_name', model)
            .single();
          if (modelData) {
            countQuery = countQuery.eq('model_id', (modelData as any).model_id);
          }
        }
      }
      
      // Apply spec-related filters
      if (bodyType) {
        const bodyTypePatterns: Record<string, string> = {
          'commuter': 'commuter',
          'sports': 'sport',
          'cruiser': 'cruiser',
          'adventure': 'adventure',
          'scooter': 'scooter',
          'off-road': 'off',
          'electric': 'electric',
          'moped': 'moped',
          'naked': 'naked',
          'super': 'super',
          'tourer': 'tour',
          'touring': 'tour',
          'scrambler': 'scrambler',
          'street': 'street',
          'cafe-racer': 'cafe',
          'dirt': 'dirt',
          'roadster': 'roadster'
        };
        const pattern = bodyTypePatterns[bodyType.toLowerCase()] || bodyType;
        countQuery = countQuery.ilike('specs.body_type', `%${pattern}%`);
      }
      
      // Note: Displacement and mileage filtering removed from count query - handled in post-processing
      
      if (engineType) {
        const engineTypeMapping: { [key: string]: string } = {
          '4-stroke': '4-stroke',
          '2-stroke': '2-stroke',
          'electric': 'Electric',
          'single-cylinder': 'Single cylinder',
          'multi-cylinder': 'Multi'
        };
        const searchPattern = engineTypeMapping[engineType];
        if (searchPattern) {
          countQuery = countQuery.ilike('specs.engine_type', `%${searchPattern}%`);
        }
      }
    }
    
    // Apply price filters to count query (these don't need specs join)
    if (minPrice !== undefined) {
      countQuery = countQuery.gte('on_road_price', minPrice);
    }
    if (maxPrice !== undefined) {
      countQuery = countQuery.lte('on_road_price', maxPrice);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

    // Helper function to clean values
    const cleanValue = (value: any): string => {
      if (!value) return 'N/A';
      const stringValue = String(value).trim();
      if (!stringValue || stringValue === '0' || stringValue.toLowerCase() === 'n/a') return 'N/A';
      
      // Remove any existing units and formatting, just keep the numeric part and basic unit
      return stringValue.replace(/\s*@.*$/, '').trim() || 'N/A';
    };

    // Helper function to clean duplicate brand/model names
    const cleanBikeName = (modelName: string, variantName: string, brandName: string): string => {
      if (!modelName || !variantName) return 'Unknown';
      
      // If variant name already contains the full model name, just use variant name
      if (variantName.toLowerCase().includes(modelName.toLowerCase())) {
        return variantName;
      }
      
      // If variant name starts with brand name and model already has brand name, remove brand from variant
      if (brandName && variantName.toLowerCase().startsWith(brandName.toLowerCase()) && 
          modelName.toLowerCase().includes(brandName.toLowerCase())) {
        const cleanVariantName = variantName.replace(new RegExp(`^${brandName}\\s*`, 'i'), '').trim();
        return `${modelName} ${cleanVariantName}`;
      }
      
      // Default: combine model and variant
      return `${modelName} ${variantName}`;
    };

    // Format the response to match expected "bikes" structure
    const formattedBikes = (variants || []).map((variant: any) => {
      const isElectric = variant.specs?.engine_type === 'electric' || variant.specs?.body_type?.toLowerCase().includes('electric');
      const brandName = variant.brands?.brand_name || 'Unknown';
      const modelName = variant.models?.model_name || 'Unknown';
      const variantName = variant.variant_name || '';
      const cleanName = cleanBikeName(modelName, variantName, brandName);
      
      return {
        id: variant.variant_id,
        name: cleanName,
        slug: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        price: variant.on_road_price,
        image: variant.images?.[0]?.url || '/demo.avif',
        brand: {
          id: variant.brand_id,
          name: variant.brands?.brand_name || 'Unknown',
          slug: variant.brands?.brand_name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || 'unknown',
          logo: variant.brands?.logo_url
        },
        model: {
          id: variant.model_id,
          name: variant.models?.model_name || 'Unknown'
        },
        specs: {
          engine: isElectric ? 'Electric' : cleanValue(variant.specs?.displacement),
          mileage: cleanValue(variant.specs?.city_mileage),
          power: cleanValue(variant.specs?.peak_power),
          displacement: cleanValue(variant.specs?.displacement),
          engineType: variant.specs?.engine_type,
          originalDisplacement: variant.specs?.displacement, // Keep original for filtering
          originalMileage: variant.specs?.city_mileage // Keep original for filtering
        }
      };
    });

    // Apply displacement and mileage filtering in post-processing
    let filteredBikes = formattedBikes;
    
    if (hasDisplacementFilter || hasMileageFilter) {
      console.log('Applying displacement/mileage filtering in post-processing...');
      
      // Helper function to extract numeric displacement value from text like "124.8cc" -> 124.8
      const extractDisplacement = (displacementStr: string): number | null => {
        if (!displacementStr) return null;
        
        // Remove common units and extra text, extract the first numeric value
        const numMatch = displacementStr.match(/(\d+(?:\.\d+)?)/);
        
        if (numMatch) {
          const value = parseFloat(numMatch[1]);
          return isNaN(value) ? null : value;
        }
        
        return null;
      };
      
      // Helper function to extract numeric mileage value from text like "50.11 kmpl" -> 50.11
      const extractMileage = (mileageStr: string): number | null => {
        if (!mileageStr) return null;
        
        // Remove common units and extra text, extract the first numeric value
        const numMatch = mileageStr.match(/(\d+(?:\.\d+)?)/);
        
        if (numMatch) {
          const value = parseFloat(numMatch[1]);
          return isNaN(value) ? null : value;
        }
        
        return null;
      };
      
      filteredBikes = formattedBikes.filter(bike => {
        // Apply displacement filtering
        if (hasDisplacementFilter) {
          const displacement = extractDisplacement(bike.specs.originalDisplacement);
          
          if (displacement === null) {
            return false; // Exclude bikes where we can't determine displacement
          }
          
          // Apply min displacement filter
          if (minDisplacement !== undefined && displacement < minDisplacement) {
            return false;
          }
          
          // Apply max displacement filter
          if (maxDisplacement !== undefined && displacement > maxDisplacement) {
            return false;
          }
        }
        
        // Apply mileage filtering
        if (hasMileageFilter) {
          const mileage = extractMileage(bike.specs.originalMileage);
          
          if (mileage === null) {
            return false; // Exclude bikes where we can't determine mileage
          }
          
          // Apply min mileage filter
          if (minMileage !== undefined && mileage < minMileage) {
            return false;
          }
        }
        
        return true;
      });
      
      // Keep all fields including original fields in final output for type compatibility
      // The original fields are needed for proper TypeScript typing
      // filteredBikes = filteredBikes; // No transformation needed
      
      console.log(`Filtering: ${formattedBikes.length} -> ${filteredBikes.length} bikes`);
    }
    
    // Apply pagination to filtered results
    let finalBikes = filteredBikes;
    let finalTotal = filteredBikes.length;
    
    if (hasDisplacementFilter || hasMileageFilter) {
      // Apply pagination to filtered results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      finalBikes = filteredBikes.slice(startIndex, endIndex);
    } else {
      // Use original database pagination
      finalTotal = totalCount || 0;
    }

    return successResponse({
      bikes: finalBikes,
      pagination: {
        total: finalTotal,
        page,
        limit,
        totalPages: Math.ceil(finalTotal / limit),
        hasNextPage: page * limit < finalTotal,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching bikes:', error);
    return errorResponse('Failed to fetch bikes', 500);
  }
}