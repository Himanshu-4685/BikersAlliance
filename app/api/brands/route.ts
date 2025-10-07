import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Fetch the brands with pagination
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        country: true,
        _count: {
          select: {
            models: true, // Count of models for each brand
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
    const totalCount = await prisma.brand.count();

    // Return the response
    return successResponse({
      brands,
      pagination: {
        totalCount,
        offset,
        limit,
        hasMore: offset + brands.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return errorResponse('Failed to fetch brands', 500);
  }
}