import { prisma } from '@/lib/db';
import { Prisma, ShopStatus } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Lấy pagination params
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const status = searchParams.get('status')?.toString();

  const whereClause: Prisma.ShopWhereInput = {};

  // Conditionally add the visibility filter
  if (status !== null) {
    const check = status?.toUpperCase();
    if (check && check in ShopStatus) whereClause.status = check as ShopStatus;
  }

  const data = await prisma.shop.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          image:true,
          name: true,
        },
      },
      status: true,
      ratingAvg: true,
      ratingCount: true,
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy: { id: 'asc' },
  });

  const total = await prisma.shop.count({
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
