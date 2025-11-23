import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const slug = searchParams.get('slug');

    if (!slug)
      return NextResponse.json({
        success: 403,
        data: {
          message: 'Missing shop id',
        },
      });
    const shop = await prisma.shop.findFirst({
      where: {
        slug: slug,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        description: true,
        logoUrl: true,
        coverUrl: true,
        ratingAvg: true,
        ratingCount: true,
        followerCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
