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

  const visible = searchParams.get('filter')?.toString();

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
      soldCount: true,
      createdAt: true,
      updatedAt: true,
    },
    skip,
    take: limit,
    orderBy: { soldCount: 'desc' },
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

//if pass, update status and visibility of product
export const PUT = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, visibility } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      );
    }

    if (!visibility) {
      return NextResponse.json(
        { success: false, error: 'Missing visibility field' },
        { status: 400 }
      );
    }

    // Update product status and visibility (adjust values to match your schema/enums)
    await prisma.product.update({
      where: { id },
      data: {
        visibility: visibility,
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
