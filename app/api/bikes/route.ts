"use server";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiResponse } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filter parameters
    const brand = searchParams.get('brand');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minEngineCapacity = searchParams.get('minEngineCapacity') ? Number(searchParams.get('minEngineCapacity')) : undefined;
    const maxEngineCapacity = searchParams.get('maxEngineCapacity') ? Number(searchParams.get('maxEngineCapacity')) : undefined;
    const minMileage = searchParams.get('minMileage') ? Number(searchParams.get('minMileage')) : undefined;
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Build the where clause for filtering
    const whereClause: any = {};

    if (brand) {
      whereClause.brand = {
        slug: brand
      };
    }

    if (category) {
      whereClause.category = {
        slug: category
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      whereClause.variants = {
        some: {
          prices: {
            some: {
              ...(minPrice && { price: { gte: minPrice } }),
              ...(maxPrice && { price: { lte: maxPrice } })
            }
          }
        }
      };
    }

    // Engine capacity filter
    if (minEngineCapacity || maxEngineCapacity) {
      whereClause.specifications = {
        some: {
          name: 'Engine',
          value: {
            ...(minEngineCapacity && { gte: minEngineCapacity.toString() }),
            ...(maxEngineCapacity && { lte: maxEngineCapacity.toString() })
          }
        }
      };
    }

    // Mileage filter
    if (minMileage) {
      whereClause.specifications = {
        some: {
          name: 'Mileage',
          value: { gte: minMileage.toString() }
        }
      };
    }

    // Determine sort options
    let orderBy: any = {};
    if (sortBy === 'price') {
      orderBy = {
        variants: {
          prices: {
            price: sortOrder
          }
        }
      };
    } else if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'latest') {
      orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.model.count({
      where: whereClause
    });

    // Fetch models with filters
    const models = await prisma.model.findMany({
      where: whereClause,
      orderBy,
      skip: offset,
      take: limit,
      include: {
        brand: true,
        category: true,
        images: {
          take: 1
        },
        variants: {
          include: {
            prices: {
              orderBy: {
                price: 'asc'
              },
              take: 1
            }
          },
          take: 1
        },
        specifications: {
          where: {
            name: {
              in: ['Engine', 'Mileage', 'Power', 'Torque']
            }
          },
          take: 4
        }
      }
    });

    // Process models to simplify the response structure
    const processedModels = models.map(model => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      brand: {
        id: model.brand.id,
        name: model.brand.name,
        slug: model.brand.slug,
        logo: model.brand.logo
      },
      category: model.category ? {
        id: model.category.id,
        name: model.category.name,
        slug: model.category.slug
      } : null,
      image: model.images.length > 0 ? model.images[0].url : null,
      price: model.variants.length > 0 && model.variants[0].prices.length > 0 
        ? model.variants[0].prices[0].price 
        : null,
      specs: model.specifications.reduce((acc, spec) => {
        acc[spec.name.toLowerCase()] = spec.value;
        return acc;
      }, {} as Record<string, string>)
    }));

    return NextResponse.json(
      apiResponse({
        success: true,
        data: {
          models: processedModels,
          pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      })
    );
  } catch (error) {
    console.error('Error fetching bikes:', error);
    return NextResponse.json(
      apiResponse({
        success: false,
        error: 'Failed to fetch bikes'
      }),
      { status: 500 }
    );
  }
}