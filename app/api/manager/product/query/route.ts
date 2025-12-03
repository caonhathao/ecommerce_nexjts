import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

//query api
//get all data of one product
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));

  const data = await prisma.product.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      origin: true,
      description: true,
      status: true,
      visibility: true,
      attributes: true,
      minPrice: true,
      maxPrice: true,
      currency: true,
      createdAt: true,
      updatedAt: true,
      shop: {
        select: { id: true, name: true, logoUrl: true },
      },
      images: {
        select: { url: true, alt: true },
      },
      variants: {
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          stock: true,
          image: true,
          currency: true,
          attributes: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  return NextResponse.json({ data });
});
