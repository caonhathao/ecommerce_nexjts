import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { shop: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        category: {
          select: { name: true },
        },
        images: {
          take: 1,
          select: { url: true },
        },
      },
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Suggestion Error', error);
    return NextResponse.json([], { status: 500 });
  }
}
