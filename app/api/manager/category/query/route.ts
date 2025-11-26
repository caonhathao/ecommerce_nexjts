import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

//query api
//get all data of one product
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));

  const data = await prisma.category.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      isActive: true,
      parentId: true,
      imageUrl: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ data });
});

//if pass, update status and visibility of product
export const POST = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));
  try {
    const body = await request.json();
    const { isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id' },
        { status: 400 }
      );
    }

    if (!isActive) {
      return NextResponse.json(
        { success: false, error: 'Missing visibility field' },
        { status: 400 }
      );
    }

    // Update product status and visibility (adjust values to match your schema/enums)
    await prisma.category.update({
      where: { id },
      data: {
        isActive: isActive,
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
