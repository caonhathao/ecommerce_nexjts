import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/db';
import ProductWhereInput = Prisma.ProductWhereInput;
import ProductOrderByWithRelationInput = Prisma.ProductOrderByWithRelationInput;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get('q') || '';
    const categoryId = searchParams.get('categoryId');
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
      whereClause.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shop: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
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
