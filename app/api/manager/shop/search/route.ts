import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

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
    if (data)
      return NextResponse.json({
        success: true,
        data: [data],
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
