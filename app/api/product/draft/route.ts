import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Lấy pagination params
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;
  
  const data = await prisma.product.findMany({
    where: {
      status: 'ARCHIVED',
      visibility: 'PRIVATE',
    },
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
    where: {
      status: 'ARCHIVED',
      visibility: 'PRIVATE',
    },
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
