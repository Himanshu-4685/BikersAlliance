import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Fetch the categories with pagination
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            models: true, // Count of models for each category
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip: offset,
      take: Math.min(limit, 100), // Limit maximum to 100
    });

    // Get total count for pagination
    const totalCount = await prisma.category.count();

    // Format the response
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category._count.models
    }));

    // Return the response
    return successResponse({
      categories: formattedCategories,
      pagination: {
        totalCount,
        offset,
        limit,
        hasMore: offset + categories.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}