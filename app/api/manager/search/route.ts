import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const owner = String(searchParams.get('owner')) || 'product';
  const id = String(searchParams.get('id'));

  if (!id) {
    return NextResponse.json({
      success: false,
      data: {
        message: `Missing product's id`,
      },
    });
  }

  let data = null;

  if (owner === 'product') {
    try {
      data = await prisma.product.findFirst({
        where: {
          id: id,
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
      return NextResponse.json({
        success: true,
        data: [data],
      });
    } catch (e) {
      return NextResponse.json({
        success: 403,
        data: {
          message: 'No result',
        },
      });
    }
  } else if (owner === 'shop') {
    try {
      data = await prisma.shop.findFirst({
        where: {
          id: id,
        },
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
      });
      return NextResponse.json({
        success: true,
        data: [data],
      });
    } catch (e) {
      return NextResponse.json({
        success: 403,
        data: {
          message: 'No result',
        },
      });
    }
  } else
    return NextResponse.json({
      success: 403,
      data: {
        message: `Missing owner`,
      },
    });
});
