import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-response';

interface RouteContext {
  params: {
    slug: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = context.params;

    // Get city for price information (optional)
    const url = new URL(request.url);
    const cityId = url.searchParams.get('cityId');

    // Find the model
    const model = await prisma.model.findUnique({
      where: { slug },
      include: {
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
          include: {
            colors: true,
            prices: cityId ? {
              where: { cityId },
            } : undefined,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        reviews: {
          where: {
            isApproved: true,
          },
          select: {
            id: true,
            title: true,
            content: true,
            rating: true,
            pros: true,
            cons: true,
            createdAt: true,
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!model) {
      return notFoundResponse('Model not found');
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: {
        modelId: model.id,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    // Get similar models from the same category
    const similarModels = await prisma.model.findMany({
      where: {
        categoryId: model.categoryId,
        id: { not: model.id }, // Exclude current model
      },
      select: {
        id: true,
        name: true,
        slug: true,
        brand: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        variants: {
          select: {
            prices: {
              select: {
                exShowroom: true,
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
      take: 4,
    });

    // Return the response with all the data
    return successResponse({
      model: {
        ...model,
        rating: {
          average: avgRating._avg.rating,
          count: avgRating._count,
        },
      },
      similarModels,
    });
  } catch (error: any) {
    console.error('Error fetching model details:', error);
    return errorResponse('Failed to fetch model details', 500);
  }
}