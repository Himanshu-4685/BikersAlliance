import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;
    const supabase = createServerClient();

    // Find the variant by slug - the full model names are in variants table
    let variant = null;
    let variantError = null;

    // Convert slug to potential variant name formats
    const slugToName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const slugToLower = slug.replace(/-/g, ' ').toLowerCase();



    // Try to find the variant using different search strategies
    const { data: variants, error: searchError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(
          brand_name,
          logo_url,
          description,
          country
        )
      `)
      .or(`variant_name.ilike.%${slugToName}%,variant_name.ilike.%${slugToLower}%,variant_name.ilike.%${slug}%`)
      .limit(1);

    if (searchError || !variants || variants.length === 0) {
      return notFoundResponse('Model not found');
    }

    variant = variants[0];
    const model = variant.models;
    const brand = variant.brands;

    // Get all variants for this model (including the current one)
    const { data: allVariants } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        created_at
      `)
      .eq('model_id', variant.model_id)
      .order('on_road_price', { ascending: true });

    // Get specifications from the current variant
    let specifications = [];
    const { data: specs } = await supabase
      .from('specs')
      .select('*')
      .eq('variant_id', variant.variant_id)
      .single();

    if (specs) {
      specifications = [
        { name: 'Engine Type', value: specs.engine_type || 'N/A', category: 'engine' },
        { name: 'Displacement', value: specs.displacement || 'N/A', category: 'engine' },
        { name: 'Max Power', value: specs.peak_power || 'N/A', category: 'engine' },
        { name: 'Max Torque', value: specs.max_torque || 'N/A', category: 'engine' },
        { name: 'City Mileage', value: specs.city_mileage || 'N/A', category: 'mileage' },
        { name: 'Highway Mileage', value: specs.highway_mileage || 'N/A', category: 'mileage' },
        { name: 'Body Type', value: specs.body_type || 'N/A', category: 'dimensions' },
        { name: 'Transmission', value: specs.transmission || 'N/A', category: 'transmission' }
      ].filter(spec => spec.value !== 'N/A' && spec.value !== null);
    }

    // Get images for this variant and related variants
    let images = [];
    const variantIds = allVariants ? allVariants.map(v => v.variant_id) : [variant.variant_id];
    const { data: imageData } = await supabase
      .from('images')
      .select('image_id, url, alt_text')
      .in('variant_id', variantIds)
      .limit(5);

    if (imageData && imageData.length > 0) {
      images = imageData.map(img => ({
        id: img.image_id.toString(),
        url: img.url,
        alt: img.alt_text || `${variant.variant_name} image`
      }));
    }

    // Get reviews
    let reviews = [];
    let rating = { average: 0, count: 0 };
    
    const { data: reviewData } = await supabase
      .from('reviews')
      .select(`
        review_id,
        rating,
        title,
        body,
        created_at,
        users!inner(
          full_name
        )
      `)
      .in('variant_id', variantIds)
      .order('created_at', { ascending: false })
      .limit(5);

    if (reviewData && reviewData.length > 0) {
      reviews = reviewData.map(review => ({
        id: review.review_id.toString(),
        title: review.title || 'User Review',
        content: review.body || '',
        rating: review.rating,
        createdAt: review.created_at,
        user: {
          name: review.users?.full_name || 'Anonymous',
          image: null
        }
      }));

      // Calculate average rating
      const totalRating = reviewData.reduce((sum, review) => sum + review.rating, 0);
      rating = {
        average: Math.round((totalRating / reviewData.length) * 10) / 10,
        count: reviewData.length
      };
    }

    // Get similar models from the same brand
    const { data: similarVariants } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        models!inner(model_name),
        images(url)
      `)
      .eq('brand_id', variant.brand_id)
      .neq('variant_id', variant.variant_id)
      .limit(6);

    const formattedSimilarModels = similarVariants?.map(sv => ({
      id: sv.variant_id.toString(),
      name: sv.variant_name,
      slug: sv.variant_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      image: sv.images?.[0]?.url || '/images/placeholder-bike.jpg',
      price: sv.on_road_price || 0,
      brand: {
        name: brand.brand_name,
        slug: brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
      }
    })) || [];

    // Return the response
    return successResponse({
      model: {
        id: variant.variant_id.toString(),
        name: variant.variant_name,
        slug: variant.variant_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        description: brand.description || `The ${variant.variant_name} is a premium motorcycle from ${brand.brand_name}, offering exceptional performance and style.`,
        launchDate: variant.created_at || null,
        brand: {
          id: variant.brand_id,
          name: brand.brand_name,
          slug: brand.brand_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
          logo: brand.logo_url,
          country: brand.country
        },
        category: null,
        images: images.length > 0 ? images : [
          {
            id: 'placeholder',
            url: '/images/placeholder-bike.jpg',
            alt: `${variant.variant_name} placeholder image`
          }
        ],
        variants: (allVariants || []).map(v => ({
          id: v.variant_id.toString(),
          name: v.variant_name,
          price: v.on_road_price || 0
        })),
        specifications,
        features: [],
        rating,
        reviews
      },
      similarModels: formattedSimilarModels
    });
    
  } catch (error: any) {
    console.error('Error fetching model details:', error);
    return errorResponse('Failed to fetch model details', 500);
  }
}