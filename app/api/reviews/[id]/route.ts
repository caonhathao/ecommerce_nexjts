import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(req.url);

    // Lấy pagination params
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Đếm tổng số review
    const total = await prisma.review.count({
      where: { productId: id },
    });

    // Lấy danh sách review
    const data = await prisma.review.findMany({
      where: { productId: id },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        likes: true,
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }, // review mới nhất trước
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/reviews/[id] error:', error);
    return new Response(
      JSON.stringify({ message: 'Internal Server Error' }),
      { status: 500 }
    );
  }
}
