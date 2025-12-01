import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

// TypeScript interfaces for the database response
interface Brand {
  brand_id: string;
  brand_name: string;
  logo_url: string | null;
}

interface Category {
  category_id: string;
  category_name: string;
  category_type: string;
}

interface Model {
  model_id: string;
  model_name: string;
  description: string | null;
  launch_date: string | null;
  category_id: string;
  brands: Brand;
  categories: Category | null;
}

interface Variant {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  ex_showroom_price: number | null;
  specifications: any;
  url: string | null;
  images: Array<{
    image_id: string;
    url: string;
    alt_text: string | null;
  }> | null;
  models: Model;
}

interface SimilarVariant {
  variant_id: string;
  variant_name: string;
  on_road_price: number;
  models: {
    model_id: string;
    model_name: string;
    brands: {
      brand_name: string;
    };
  };
}

// Helper function to get image URL with fallback
function getVariantImageUrl(variant: any, supabaseUrl: string): string {
  // First try to get image from database
  if (variant.images && variant.images.length > 0) {
    return variant.images[0].url;
  }
  // Fallback to constructed URL
  return `${supabaseUrl}/storage/v1/object/public/image/variant_image/${variant.variant_id}.png`;
}

// Helper function to get default image URL
function getDefaultImageUrl(): string {
  return '/demo.avif'; // Use the demo image that exists
}

// Helper function to parse and group specifications
function parseAndGroupSpecs(specs: any) {
  if (!specs || typeof specs !== 'object') return {};
  
  const grouped: Record<string, Array<{ name: string; value: string }>> = {};
  
  Object.entries(specs).forEach(([key, value]) => {
    // Skip general specs and transmission specs
    const keyLower = key.toLowerCase();
    
    // Categorize specs based on key patterns, excluding general and transmission
    let category = null;
    
    if (keyLower.includes('engine') || keyLower.includes('power') || keyLower.includes('torque')) {
      category = 'engine';
    } else if (keyLower.includes('dimension') || keyLower.includes('weight') || keyLower.includes('length') || keyLower.includes('width') || keyLower.includes('height')) {
      category = 'dimensions';
    } else if (keyLower.includes('fuel') || keyLower.includes('tank') || keyLower.includes('mileage')) {
      category = 'fuel';
    } else if (keyLower.includes('brake') || keyLower.includes('suspension') || keyLower.includes('tyre') || keyLower.includes('wheel')) {
      category = 'features';
    }
    
    // Skip if no category assigned (effectively filtering out general and transmission specs)
    if (!category) return;
    
    if (!grouped[category]) {
      grouped[category] = [];
    }
    
    grouped[category].push({
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: String(value)
    });
  });
  
  return grouped;
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log('API: Received request for variant ID:', slug);
    
    if (!slug) {
      return errorResponse('Variant ID is required', 400);
    }

    // Validate that it's either a valid UUID format or a numeric ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    const isNumeric = /^\d+$/.test(slug);
    
    if (!isUUID && !isNumeric) {
      return errorResponse('Invalid variant ID format', 400);
    }

    const supabase = createServerClient();
    
    console.log('API: Fetching bike details by variant ID');
    
    // Fetch bike details with comprehensive data including images
    const { data: variants, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        url,
        models!inner(
          model_id,
          model_name,
          brands!inner(
            brand_id,
            brand_name,
            logo_url
          )
        )
      `)
      .eq('variant_id', parseInt(slug))
      .single() as { data: any, error: any };

    if (error) {
      console.error('Error fetching bike details:', error);
      if (error.code === 'PGRST116') {
        return notFoundResponse('Bike not found');
      }
      return errorResponse('Failed to fetch bike details', 500);
    }
    
    if (!variants) {
      return notFoundResponse('Bike not found');
    }
    
    const variant = variants;
    const model = variant.models;
    const brand = model.brands;

    // Fetch images separately
    const { data: images } = await supabase
      .from('images')
      .select('image_id, url, alt_text')
      .eq('variant_id', parseInt(slug)) as { data: any };

    // Fetch specifications separately
    const { data: specs } = await supabase
      .from('specs')
      .select('*')
      .eq('variant_id', parseInt(slug))
      .single() as { data: any };

    // Fetch all variants of the same model
    const { data: allModelVariants } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price
      `)
      .eq('model_id', model.model_id)
      .order('on_road_price') as { data: any };
    
    // Fetch similar bikes from the same brand
    const { data: similarVariants, error: similarError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        models!inner(
          model_id,
          model_name,
          brands!inner(
            brand_name
          )
        )
      `)
      .eq('brand_id', brand.brand_id)
      .neq('variant_id', variant.variant_id)
      .order('on_road_price')
      .limit(6) as { data: any, error: any };
    
    if (similarError) {
      console.error('Error fetching similar bikes:', similarError);
    }
    
    // Format single variant data
    const formattedVariant = {
      id: variant.variant_id.toString(),
      name: variant.variant_name,
      price: variant.on_road_price || 0,
      imageUrl: images && images.length > 0 ? images[0].url : getDefaultImageUrl(),
      defaultImageUrl: getDefaultImageUrl(),
      specifications: parseAndGroupSpecs(specs || {})
    };
    
    // Fetch images for similar bikes
    const formattedSimilarBikes = await Promise.all((similarVariants || []).map(async (similarVariant: any) => {
      const { data: similarImages } = await supabase
        .from('images')
        .select('url')
        .eq('variant_id', similarVariant.variant_id)
        .limit(1) as { data: any };

      return {
        id: similarVariant.variant_id.toString(),
        name: similarVariant.variant_name.includes(similarVariant.models.brands.brand_name) ? 
          similarVariant.variant_name : 
          `${similarVariant.models.brands.brand_name} ${similarVariant.variant_name}`,
        slug: similarVariant.variant_id.toString(),
        price: similarVariant.on_road_price || 0,
        image: similarImages && similarImages.length > 0 ? similarImages[0].url : getDefaultImageUrl(),
        brand: {
          name: similarVariant.models.brands.brand_name
        }
      };
    }));
    
    // Construct the response
    const bikeDetails = {
      id: variant.variant_id.toString(),
      name: variant.variant_name.includes(brand.brand_name) ? variant.variant_name : `${brand.brand_name} ${variant.variant_name}`,
      slug: variant.variant_id.toString(),
      description: null, // Models table doesn't have description in our schema
      launchDate: null, // Models table doesn't have launch_date in our schema
      brand: {
        id: brand.brand_id,
        name: brand.brand_name,
        slug: brand.brand_name.toLowerCase().replace(/\s+/g, '-'),
        logo: brand.logo_url
      },
      category: null, // We don't have categories in our current schema
      variants: (allModelVariants || []).map((modelVariant: any) => ({
        id: modelVariant.variant_id.toString(),
        name: modelVariant.variant_name.includes(brand.brand_name) ? 
          modelVariant.variant_name : 
          `${brand.brand_name} ${modelVariant.variant_name}`,
        price: modelVariant.on_road_price || 0
      })),
      similarModels: formattedSimilarBikes,
      images: images && images.length > 0 ? images.map((img: any, index: number) => ({
        id: img.image_id.toString(),
        url: img.url,
        defaultUrl: img.url,
        alt: img.alt_text || `${brand.brand_name} ${model.model_name} ${variant.variant_name} - Image ${index + 1}`
      })) : [{
        id: 'default',
        url: getDefaultImageUrl(),
        defaultUrl: getDefaultImageUrl(),
        alt: `${brand.brand_name} ${model.model_name} ${variant.variant_name}`
      }],
      // Flatten specifications into array format from single variant
      specifications: specs ? Object.entries(specs).filter(([key, value]) => key !== 'variant_id' && value).map(([key, value]) => ({
        id: key.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: String(value)
      })) : [],
      features: [], // TODO: Add features data when available
      rating: {
        average: 0,
        count: 0
      },
      reviews: []
    };
    
    return successResponse({
      model: bikeDetails,
      similarModels: formattedSimilarBikes
    });
    
  } catch (error) {
    console.error('Error handling request:', error);
    return errorResponse('Internal server error', 500);
  }
}