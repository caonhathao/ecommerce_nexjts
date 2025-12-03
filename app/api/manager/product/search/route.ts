import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');
  const title = searchParams.get('title');
  const shopId = searchParams.get('shopId');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !title && !shopId)
    return NextResponse.json(
      {
        success: false,
        data: {
          message: 'Missing search keyword',
        },
      },
      { status: 400 }
    );

  const whereClause: Prisma.ProductWhereInput = {};

  if (id) {
    const isValidUUID = z.string().uuid().safeParse(id).success;

    if (!isValidUUID) {
      return NextResponse.json({ success: 400, data: [] });
    }

    whereClause.id = id;
  } else if (title)
    whereClause.title = {
      contains: title,
      mode: 'insensitive',
    };
  else if (shopId) {
    const isValidUUID = z.string().uuid().safeParse(shopId).success;

    if (!isValidUUID) {
      return NextResponse.json({ success: 400, data: [] });
    }

    whereClause.shopId = shopId;
  }

  try {
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
    });
    const total = data.length;

    if (data)
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
    else
      return NextResponse.json({
        success: 403,
        data: {
          message: 'No result',
        },
      });
  } catch (e) {
    // This catch block is still important for REAL errors
    // (e.g., database connection fails)
    console.error('Error fetching product:', e);
    return NextResponse.json(
      {
        success: 500,
        message: 'Internal Server Error',
      },
      { status: 500 } // 500 is for unexpected server errors
    );
  }
});
