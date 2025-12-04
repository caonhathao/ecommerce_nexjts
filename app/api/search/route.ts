import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { ActionResponse } from '@/lib/service-response';
import { ServiceResponse } from '@/types/api-response';
import { NextRequest, NextResponse } from 'next/server';
import ProductWhereInput = Prisma.ProductWhereInput;
import ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;

async function getCategoryWithChildren(
  rootId: string,
  maxDepth = 6
): Promise<string[]> {
  const allIds: string[] = [];
  const visited = new Set<string>();
  let currentLevelIds = [rootId];

  visited.add(rootId);
  allIds.push(rootId);

  let depth = 0;
  while (currentLevelIds.length > 0) {
    if (++depth > maxDepth) break;

    const subCategories = await prisma.category.findMany({
      where: { parentId: { in: currentLevelIds } },
      select: { id: true },
    });

    if (subCategories.length === 0) break;

    const subIds = subCategories
      .map((c) => c.id)
      .filter((id) => !visited.has(id));

    if (subIds.length === 0) break;

    subIds.forEach((id) => {
      visited.add(id);
      allIds.push(id);
    });

    currentLevelIds = subIds;
  }

  return allIds;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || '';
    const titleOnlyParam = searchParams.get('titleOnly');
    const titleOnly = titleOnlyParam === '1' || titleOnlyParam === 'true';
    const category = searchParams.get('category');
    const shopId = searchParams.get('shopId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const whereClause: ProductWhereInput = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      AND: [],
    };

    // Search by product name or seller shop name
    if (query) {
      if (titleOnly) {
        // Only search in product title
        whereClause.OR = [{ title: { contains: query, mode: 'insensitive' } }];
      } else {
        // Default behavior: search in title, description, and shop name
        whereClause.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shop: { name: { contains: query, mode: 'insensitive' } } },
        ];
      }
    }

    if (category) {
      const data = await prisma.category.findFirst({
        where: {
          slug: category,
        },
        select: {
          id: true,
        },
      });

      if (!data)
        return ActionResponse.toNextResponse({
          success: false,
          message: 't_category_not_found',
          code: 403,
        } as ServiceResponse);

      const categoryIds = await getCategoryWithChildren(data.id);
      whereClause.categoryId = { in: categoryIds };
    }

    if (shopId) {
      whereClause.shopId = shopId;
    }

    if (minPrice) {
      whereClause.minPrice = {
        gte: minPrice,
      };
    }

    if (maxPrice) {
      whereClause.maxPrice = {
        lte: maxPrice,
      };
    }

    const orderBy: ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.minPrice = sortOrder as 'asc' | 'desc';
    } else if (sortBy === 'rating') {
      orderBy.ratingAvg = sortOrder as 'asc' | 'desc';
    } else if (sortBy === 'name') {
      orderBy.title = sortOrder as 'asc' | 'desc';
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder as 'asc' | 'desc';
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          minPrice: true,
          maxPrice: true,
          currency: true,
          ratingAvg: true,
          origin: true,
          images: {
            take: 1,
            select: { url: true, alt: true },
          },
          shop: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          VoucherProduct: {
            take: 1,
            select: {
              voucher: {
                select: {
                  type: true,
                  value: true,
                  maxDiscount: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      minPrice: p.minPrice,
      maxPrice: p.maxPrice,
      currency: p.currency,
      ratingAvg: p.ratingAvg,
      origin: p.origin,
      imageUrl: p.images[0]?.url ?? null,
      imageAlt: p.images[0]?.alt ?? null,
      shop: p.shop,
      category: p.category,
      voucher: p.VoucherProduct[0]?.voucher ?? null,
    }));

    return NextResponse.json({
      success: true,
      products: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
