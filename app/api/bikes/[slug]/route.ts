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
function getVariantImageUrl(variantId: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/image/variant_image/${variantId}.png`;
}

// Helper function to get default image URL
function getDefaultImageUrl(): string {
  return '/images/bikes/default-bike.svg'; // Using SVG placeholder
}

// Helper function to parse and group specifications
function parseAndGroupSpecs(specs: any) {
  if (!specs || typeof specs !== 'object') return {};
  
  const grouped: Record<string, Array<{ name: string; value: string }>> = {};
  
  Object.entries(specs).forEach(([key, value]) => {
    // Categorize specs based on key patterns
    let category = 'general';
    
    if (key.toLowerCase().includes('engine') || key.toLowerCase().includes('power') || key.toLowerCase().includes('torque')) {
      category = 'engine';
    } else if (key.toLowerCase().includes('dimension') || key.toLowerCase().includes('weight') || key.toLowerCase().includes('length') || key.toLowerCase().includes('width') || key.toLowerCase().includes('height')) {
      category = 'dimensions';
    } else if (key.toLowerCase().includes('fuel') || key.toLowerCase().includes('tank') || key.toLowerCase().includes('mileage')) {
      category = 'fuel';
    } else if (key.toLowerCase().includes('brake') || key.toLowerCase().includes('suspension') || key.toLowerCase().includes('tyre') || key.toLowerCase().includes('wheel')) {
      category = 'features';
    }
    
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
    
    if (!slug) {
      return errorResponse('Bike slug is required', 400);
    }
    
    const supabase = createServerClient();
    
    // Get Supabase URL for image construction
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    
    // Parse slug to extract brand and model
    const slugParts = slug.split('-');
    const brandName = slugParts[0];
    const modelName = slugParts.slice(1).join('-');
    
    // Fetch bike details with comprehensive data
    const { data: variants, error } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        ex_showroom_price,
        specifications,
        models!inner(
          model_id,
          model_name,
          description,
          launch_date,
          category_id,
          brands!inner(
            brand_id,
            brand_name,
            logo_url
          ),
          categories(
            category_id,
            category_name,
            category_type
          )
        )
      `)
      .ilike('models.brands.brand_name', `%${brandName}%`)
      .ilike('models.model_name', `%${modelName}%`)
      .order('on_road_price') as { data: Variant[] | null; error: any };
    
    if (error) {
      console.error('Error fetching bike details:', error);
      return errorResponse('Failed to fetch bike details', 500);
    }
    
    if (!variants || variants.length === 0) {
      return notFoundResponse('Bike not found');
    }
    
    const firstVariant = variants[0];
    const model = firstVariant.models;
    const brand = model.brands;
    const category = model.categories;
    
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
      .eq('models.brands.brand_id', brand.brand_id)
      .neq('models.model_id', model.model_id)
      .order('on_road_price')
      .limit(6) as { data: SimilarVariant[] | null; error: any };
    
    if (similarError) {
      console.error('Error fetching similar bikes:', similarError);
    }
    
    // Format variants data
    const formattedVariants = variants.map(variant => ({
      id: variant.variant_id,
      name: variant.variant_name,
      price: variant.on_road_price,
      exShowroomPrice: variant.ex_showroom_price,
      imageUrl: getVariantImageUrl(variant.variant_id, supabaseUrl),
      defaultImageUrl: getDefaultImageUrl(),
      specifications: parseAndGroupSpecs(variant.specifications)
    }));
    
    // Format similar bikes
    const formattedSimilarBikes = (similarVariants || []).map(variant => ({
      id: variant.variant_id,
      name: `${variant.models.brands.brand_name} ${variant.models.model_name}`,
      slug: `${variant.models.brands.brand_name.toLowerCase()}-${variant.models.model_name.toLowerCase()}`.replace(/\s+/g, '-'),
      price: variant.on_road_price,
      imageUrl: getVariantImageUrl(variant.variant_id, supabaseUrl),
      defaultImageUrl: getDefaultImageUrl()
    }));
    
    // Construct the response
    const bikeDetails = {
      id: model.model_id,
      name: `${brand.brand_name} ${model.model_name}`,
      slug: slug,
      description: model.description,
      launchDate: model.launch_date,
      brand: {
        id: brand.brand_id,
        name: brand.brand_name,
        slug: brand.brand_name.toLowerCase().replace(/\s+/g, '-'),
        logo: brand.logo_url
      },
      category: category ? {
        id: category.category_id,
        name: category.category_name,
        type: category.category_type
      } : null,
      variants: formattedVariants,
      similarBikes: formattedSimilarBikes,
      images: formattedVariants.map(variant => ({
        id: variant.id,
        url: variant.imageUrl,
        defaultUrl: variant.defaultImageUrl,
        alt: `${brand.brand_name} ${model.model_name} ${variant.name}`
      })),
      // Get all unique specifications from all variants
      specifications: formattedVariants.reduce((allSpecs, variant) => {
        Object.entries(variant.specifications).forEach(([category, specs]) => {
          if (!allSpecs[category]) {
            allSpecs[category] = [];
          }
          (specs as Array<{ name: string; value: string }>).forEach(spec => {
            if (!allSpecs[category].find(s => s.name === spec.name)) {
              allSpecs[category].push(spec);
            }
          });
        });
        return allSpecs;
      }, {} as Record<string, Array<{ name: string; value: string }>>),
      rating: {
        average: null, // TODO: Implement reviews system
        count: 0
      }
    };
    
    return successResponse(bikeDetails);
    
  } catch (error) {
    console.error('Error handling request:', error);
    return errorResponse('Internal server error', 500);
  }
}