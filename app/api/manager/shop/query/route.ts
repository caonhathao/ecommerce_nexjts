import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

//query api
//get all data of one product
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));
  try {
    const data = await prisma.shop.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        status: true,
        ratingAvg: true,
        ratingCount: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({
      success: false,
      data: {
        message: 'Not found',
      },
    });
  }
});
