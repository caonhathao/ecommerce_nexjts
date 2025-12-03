import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const type = searchParams.get('type') || 'default';

    const whereCondition: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    };

    if (type === 'deal') {
      whereCondition.VoucherProduct = {
        some: {
          voucher: {
            isActive: true,
            type: { in: ['PERCENT', 'FIXED'] },
          },
        },
      };
    }

    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        minPrice: true,
        ratingAvg: true,
        soldCount: true,
        description: true,
        origin: true,
        images: {
          take: 1,
          select: { url: true },
        },
        VoucherProduct: {
          take: 1,
          where: { voucher: { isActive: true } },
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
      skip,
      take: limit,
      orderBy:
        type === 'deal'
          ? { soldCount: 'desc' }
          : type === 'new'
            ? { createdAt: 'desc' }
            : type === 'suggest'
              ? { updatedAt: 'desc' }
              : { createdAt: 'desc' },
    });

    const total = await prisma.product.count({ where: whereCondition });

    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      minPrice: p.minPrice,
      ratingAvg: p.ratingAvg,
      description: p.description,
      imageUrl: p.images[0]?.url ?? null,
      voucher: p.VoucherProduct[0]?.voucher ?? null,
      origin: p.origin,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/product error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
