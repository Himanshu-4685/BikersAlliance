import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const brandId = url.searchParams.get('brandId');
    const search = url.searchParams.get('search');

    // Initialize Supabase client
    const supabase = createServerClient();

    // Build the query
    let query = supabase
      .from('models')
      .select(`
        model_id, model_name, brand_id
      `);

    // Add filters based on query parameters
    if (brandId) query = query.eq('brand_id', brandId);

    // Search filter
    if (search) {
      query = query.ilike('model_name', `%${search}%`);
    }

    // Sorting by model name
    query = query.order('model_name', { ascending: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: models, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Format the response
    const formattedModels = (models || []).map((model: any) => ({
      id: model.model_id,
      name: model.model_name,
      slug: model.model_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      brandId: model.brand_id,
    }));

    // Return the response
    return successResponse({
      models: formattedModels,
      pagination: {
        total: totalCount || 0,
        offset,
        limit,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    return errorResponse('Failed to fetch models', 500);
  }
}