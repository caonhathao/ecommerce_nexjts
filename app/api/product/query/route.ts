import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma/client';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const filter = searchParams.get('filter');
    const shopId = searchParams.get('shopId');
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    if (!shopId)
      return NextResponse.json({
        success: 403,
        data: { message: 'Missing shop id' },
      });

    let orderBy: Prisma.ProductOrderByWithRelationInput = { id: 'asc' };

    if (filter === 'new') {
      orderBy = { createdAt: 'desc' };
    } else if (filter === 'top') {
      orderBy = { soldCount: 'desc' };
    }

    const products = await prisma.product.findMany({
      where: {
        shopId: shopId,
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        minPrice: true,
        ratingAvg: true,
        description: true,
        images: {
          take: 1,
          select: { url: true },
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
        origin: true,
      },
      skip,
      take: limit,
      orderBy: orderBy,
    });

    // Tổng số bản ghi để tính tổng trang
    const total = await prisma.product.count({
      where: {
        shopId: shopId,
      },
    });

    // Chuẩn hóa dữ liệu trả về
    const formatted = products.map((p) => ({
      id: p.id,
      title: p.title,
      minPrice: p.minPrice,
      ratingAvg: p.ratingAvg,
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
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
