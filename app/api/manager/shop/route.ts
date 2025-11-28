import { prisma } from '@/lib/db';
import { Prisma, ShopStatus } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

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
          image: true,
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

//if pass, update status and visibility of product
export const PUT = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Missing status field' },
        { status: 400 }
      );
    }

    // Update product status (adjust values to match your schema/enums)
    await prisma.shop.update({
      where: { id },
      data: {
        status: status,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
});
