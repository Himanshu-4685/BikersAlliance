import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Initialize Supabase client
    const supabase = createServerClient();

    // Fetch the categories with pagination
    const { data: categories, error } = await supabase
      .from('categories')
      .select('category_id, category_name')
      .order('category_name', { ascending: true })
      .range(offset, offset + Math.min(limit, 100) - 1);

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Format the response
    const formattedCategories = (categories || []).map((category: any) => ({
      id: category.category_id,
      name: category.category_name,
      slug: category.category_name?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') || '',
      count: 0 // Note: You'll need to implement a separate count query for this
    }));

    // Return the response
    return successResponse({
      categories: formattedCategories,
      pagination: {
        totalCount: totalCount || 0,
        offset,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}