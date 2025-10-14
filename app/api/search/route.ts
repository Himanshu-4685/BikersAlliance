import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';
import { SearchResult, SearchSuggestion, generateBrandCategorySuggestions, createSlug, VEHICLE_CATEGORIES } from '@/utils/api/search';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
      return successResponse({
        suggestions: [],
        results: { bikes: [] }
      });
    }

    // Initialize Supabase client
    const supabase = createServerClient();

    const searchResults: SearchResult = {
      suggestions: [],
      results: { bikes: [] }
    };

    // 1. Search brands first
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('brand_id, brand_name')
      .ilike('brand_name', `%${query}%`)
      .limit(10);

    if (brandsError) {
      console.error('Error searching brands:', brandsError);
    }

    // 2. Generate brand-category suggestions (like "KTM Bikes", "Honda Scooters")
    if (brands && brands.length > 0) {
      brands.forEach((brand: any) => {
        const brandSlug = createSlug(brand.brand_name);
        const brandSuggestions = generateBrandCategorySuggestions(
          brand.brand_name,
          brandSlug,
          query
        );
        searchResults.suggestions.push(...brandSuggestions);
      });

      // Also add pure brand suggestions
      brands.forEach((brand: any) => {
        const brandSlug = createSlug(brand.brand_name);
        searchResults.suggestions.push({
          id: `brand-${brand.brand_id}`,
          title: brand.brand_name,
          type: 'brand',
          brandName: brand.brand_name,
          href: `/brands/${brandSlug}`,
          description: `View all ${brand.brand_name} vehicles`
        });
      });
    }

    // 3. Search models
    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select(`
        model_id,
        model_name,
        brand_id,
        brands!inner(brand_name)
      `)
      .ilike('model_name', `%${query}%`)
      .limit(8);

    if (modelsError) {
      console.error('Error searching models:', modelsError);
    }

    if (models && models.length > 0) {
      models.forEach((model: any) => {
        const modelSlug = createSlug(model.model_name);
        const brandSlug = createSlug(model.brands?.brand_name || '');
        
        searchResults.suggestions.push({
          id: `model-${model.model_id}`,
          title: `${model.brands?.brand_name || ''} ${model.model_name}`,
          type: 'model',
          brandName: model.brands?.brand_name,
          href: `/bikes/${brandSlug}/${modelSlug}`,
          description: `View ${model.model_name} variants and details`
        });
      });
    }

    // 4. Search variants (individual bike models)
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
      .or(`variant_name.ilike.%${query}%,models.model_name.ilike.%${query}%`)
      .limit(10);

    if (variantsError) {
      console.error('Error searching variants:', variantsError);
    }

    if (variants && variants.length > 0) {
      // Add variant suggestions
      variants.forEach((variant: any) => {
        const fullName = `${variant.models?.model_name || ''} ${variant.variant_name}`;
        const variantSlug = createSlug(fullName);
        const brandSlug = createSlug(variant.brands?.brand_name || '');
        
        searchResults.suggestions.push({
          id: `variant-${variant.variant_id}`,
          title: `${variant.brands?.brand_name || ''} ${fullName}`,
          type: 'variant',
          brandName: variant.brands?.brand_name,
          href: `/bikes/${brandSlug}/${variantSlug}`,
          description: `₹${variant.on_road_price?.toLocaleString() || 'N/A'} onwards`
        });
      });

      // Add to search results for full search
      searchResults.results.bikes = variants.map((variant: any) => ({
        id: variant.variant_id,
        name: `${variant.models?.model_name || ''} ${variant.variant_name}`,
        slug: createSlug(`${variant.models?.model_name || ''} ${variant.variant_name}`),
        price: variant.on_road_price || 0,
        brand: {
          id: variant.brand_id,
          name: variant.brands?.brand_name || 'Unknown',
          slug: createSlug(variant.brands?.brand_name || 'unknown')
        }
      }));
    }

    // 5. Add category suggestions if query matches
    VEHICLE_CATEGORIES.forEach(category => {
      if (category.name.toLowerCase().includes(query.toLowerCase()) || 
          query.toLowerCase().includes(category.name.toLowerCase())) {
        searchResults.suggestions.push({
          id: `category-${category.id}`,
          title: category.name,
          type: 'category',
          category: category.name,
          href: `/bikes?category=${category.slug}`,
          description: `Browse all ${category.name.toLowerCase()}`
        });
      }
    });

    // Remove duplicates and limit suggestions
    const uniqueSuggestions = searchResults.suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.id === suggestion.id)
      )
      .slice(0, 12); // Limit to 12 suggestions

    return successResponse({
      suggestions: uniqueSuggestions,
      results: searchResults.results
    });

  } catch (error) {
    console.error('Error in search API:', error);
    return errorResponse('Search failed', 500);
  }
}