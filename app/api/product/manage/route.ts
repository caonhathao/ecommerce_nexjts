import { prisma } from '@/lib/db';
import { Prisma, Visibility } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Lấy pagination params
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const visible = searchParams.get('visibility')?.toString();

  const whereClause: Prisma.ProductWhereInput = {};

  // Conditionally add the visibility filter
  if (visible !== null) {
    const check = visible?.toUpperCase();
    if (check && check in Visibility)
      whereClause.visibility = check as Visibility;
  }

  const data = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      shop: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      title: true,
      status: true,
      visibility: true,
      _count: {
        select: {
          variants: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy: { id: 'asc' },
  });

  const total = await prisma.product.count({
    where: whereClause,
  });

  return NextResponse.json({
    success: true,
    data: data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

//if denied, send a notify to seller
