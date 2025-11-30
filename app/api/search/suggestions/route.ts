import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { SearchSuggestion, createSlug } from '@/utils/api/search';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 1) {
      return successResponse([]);
    }

    // Initialize Supabase client
    const supabase = createServerClient();
    const suggestions: SearchSuggestion[] = [];

    // Primary focus: Search variants (actual bike names) that start with or contain the query
    const { data: variants, error: variantsError } = await supabase
      .from('variants')
      .select(`
        variant_id,
        variant_name,
        on_road_price,
        model_id,
        brand_id,
        models!inner(model_name),
        brands!inner(brand_name)
      `)
      .or(`variant_name.ilike.${query}%,variant_name.ilike.%${query}%,models.model_name.ilike.${query}%,models.model_name.ilike.%${query}%,brands.brand_name.ilike.${query}%`)
      .order('brands.brand_name', { ascending: true })
      .order('models.model_name', { ascending: true })
      .order('variant_name', { ascending: true })
      .limit(10);

    if (!variantsError && variants && variants.length > 0) {
      variants.forEach((variant: any) => {
        // Create full bike name: Brand + Model + Variant
        const fullName = `${variant.brands?.brand_name || ''} ${variant.models?.model_name || ''} ${variant.variant_name}`.trim();
        const cleanedName = fullName.replace(/\s+/g, ' '); // Remove extra spaces
        
        const variantSlug = createSlug(cleanedName);
        const brandSlug = createSlug(variant.brands?.brand_name || '');
        
        suggestions.push({
          id: `variant-${variant.variant_id}`,
          title: cleanedName,
          type: 'variant',
          brandName: variant.brands?.brand_name,
          href: `/bikes/${brandSlug}/${variantSlug}`,
          description: variant.on_road_price ? `₹${variant.on_road_price.toLocaleString()} onwards` : 'Price on request'
        });
      });
    }

    // Secondary: Search brands for broader results
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('brand_id, brand_name')
      .ilike('brand_name', `${query}%`)
      .limit(3);

    if (!brandsError && brands && brands.length > 0) {
      brands.forEach((brand: any) => {
        const brandSlug = createSlug(brand.brand_name);
        
        suggestions.push({
          id: `brand-${brand.brand_id}`,
          title: `${brand.brand_name} Bikes`,
          type: 'brand',
          brandName: brand.brand_name,
          href: `/bikes?brand=${brandSlug}`,
          description: `View all ${brand.brand_name} bikes`
        });
      });
    }

    // Remove duplicates and limit to top results
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.id === suggestion.id)
      )
      .slice(0, 12); // Limit to 12 suggestions for better UX

    return successResponse(uniqueSuggestions);

  } catch (error) {
    console.error('Error in search suggestions API:', error);
    return errorResponse('Failed to fetch suggestions', 500);
  }
}