import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    // Get the query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const brandId = url.searchParams.get('brandId');
    const categoryId = url.searchParams.get('categoryId');
    const isElectric = url.searchParams.get('isElectric') === 'true';
    const isUpcoming = url.searchParams.get('isUpcoming') === 'true';
    const isFeatured = url.searchParams.get('isFeatured') === 'true';
    const sortBy = url.searchParams.get('sortBy') || 'popularity'; // popularity, priceAsc, priceDesc, newest
    const search = url.searchParams.get('search');

    // Build the query
    const where: any = {};
    
    // Add filters based on query parameters
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (url.searchParams.has('isElectric')) where.isElectric = isElectric;
    if (url.searchParams.has('isUpcoming')) where.isUpcoming = isUpcoming;
    if (url.searchParams.has('isFeatured')) where.isFeatured = isFeatured;
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Sorting logic
    let orderBy: any = {};
    switch (sortBy) {
      case 'priceAsc':
        orderBy = { variants: { _count: 'asc' } }; // This is a simplification
        break;
      case 'priceDesc':
        orderBy = { variants: { _count: 'desc' } }; // This is a simplification
        break;
      case 'newest':
        orderBy = { launchDate: 'desc' };
        break;
      case 'popularity':
      default:
        orderBy = { popularityScore: 'desc' };
    }

    // Fetch the models with pagination
    const models = await prisma.model.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isElectric: true,
        isUpcoming: true,
        isFeatured: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          select: {
            id: true,
            name: true,
            prices: {
              select: {
                exShowroom: true,
              },
              take: 1, // Just get one price for display
            },
          },
          take: 1, // Just get base variant for listing
        },
        images: {
          select: {
            id: true,
            url: true,
          },
          take: 1, // Just get one image for listing
          orderBy: {
            sortOrder: 'asc',
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy,
      skip: offset,
      take: Math.min(limit, 50), // Limit maximum to 50
    });

    // Calculate average ratings
    const modelIds = models.map((model) => model.id);
    const ratings = await prisma.review.groupBy({
      by: ['modelId'],
      where: {
        modelId: {
          in: modelIds,
        },
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
    });

    // Create a map of model ID to average rating
    const ratingMap = new Map();
    ratings.forEach((rating) => {
      ratingMap.set(rating.modelId, rating._avg.rating);
    });

    // Add average rating to models
    const modelsWithRatings = models.map((model) => ({
      ...model,
      avgRating: ratingMap.get(model.id) || null,
    }));

    // Get total count for pagination
    const totalCount = await prisma.model.count({ where });

    // Return the response
    return successResponse({
      models: modelsWithRatings,
      pagination: {
        totalCount,
        offset,
        limit,
        hasMore: offset + models.length < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return errorResponse('Failed to fetch models', 500);
  }
}