import { parseSearchQueryWithAI } from '@/features/search/gemini-search';
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
  // BFS
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

    let query = searchParams.get('q') || '';
    const useAI = searchParams.get('ai') === 'true';

    const aiParams: any = {};
    if (useAI && query) {
      try {
        // Fetch valid category slugs for Gemini to match against
        const categories = await prisma.category.findMany({
          select: { slug: true },
        });
        const categorySlugs = categories.map((c) => c.slug);

        const aiResult = await parseSearchQueryWithAI(query, categorySlugs);

        if (aiResult) {
          // Use AI's cleaned keywords (e.g., "laptop" instead of "show me cheap laptops")
          if (aiResult.query) query = aiResult.query;

          // Map AI findings to filters
          if (aiResult.minPrice) aiParams.minPrice = String(aiResult.minPrice);
          if (aiResult.maxPrice) aiParams.maxPrice = String(aiResult.maxPrice);
          if (aiResult.category) aiParams.category = aiResult.category;
          if (aiResult.sortBy) aiParams.sortBy = aiResult.sortBy;
          if (aiResult.sortOrder) aiParams.sortOrder = aiResult.sortOrder;
        }
      } catch (err) {
        console.error('AI Search Failed, falling back to standard', err);
      }
    }

    const titleOnly =
      searchParams.get('titleOnly') === '1' ||
      searchParams.get('titleOnly') === 'true';
    const category = searchParams.get('category') || aiParams.category;
    const shopId = searchParams.get('shopId');
    const minPrice = searchParams.get('minPrice') || aiParams.minPrice;
    const maxPrice = searchParams.get('maxPrice') || aiParams.maxPrice;
    const sortBy = searchParams.get('sortBy') || aiParams.sortBy || 'createdAt';
    const sortOrder =
      searchParams.get('sortOrder') || aiParams.sortOrder || 'desc';

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

      if (!data) {
        return ActionResponse.toNextResponse({
          success: false,
          message: 't_category_not_found',
          code: 403,
        } as ServiceResponse);
      }

      const categoryIds = await getCategoryWithChildren(data.id);
      whereClause.categoryId = { in: categoryIds };
    }

    if (shopId) {
      whereClause.shopId = shopId;
    }

    if (minPrice) {
      whereClause.minPrice = {
        gte: Number(minPrice),
      };
    }

    if (maxPrice) {
      whereClause.maxPrice = {
        lte: Number(maxPrice),
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
          ratingCount: true,
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
      ratingCount: p.ratingCount,
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
