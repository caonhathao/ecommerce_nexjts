import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

//query api
//get all data of one product
export const GET = (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  return withAuth(async (userId: string) => {
    const { id } = await context.params;
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
    } catch (e) {
      return NextResponse.json({
        success: false,
        data: {
          message: 'Not found',
        },
      });
    }
  })(request);
};

//if pass, update status and visibility of product
export const POST = (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  return withAuth(async (userId: string) => {
    const { id } = await context.params;
    try {
      const body = await request.json();
      const { status } = body;

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

      // Update product status and visibility (adjust values to match your schema/enums)
      await prisma.shop.update({
        where: { id },
        data: {
          status: status,
        },
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json(
        { success: false, error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  })(request);
};
