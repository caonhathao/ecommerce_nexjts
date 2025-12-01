import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { ActionResponse } from '@/lib/service-response';
import { getCurrentUserId } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Lấy pagination params
    const id = searchParams.get('id') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    if (id.length === 0 || id === null || id === undefined) {
      return NextResponse.json({
        status: 403,
        data: {
          message: 'Missing id',
        },
      });
    }

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
      orderBy: { createdAt: 'desc' },
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
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unauthorized', 401)
      );
    }
    const data = await req.json();

    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: userId,
        rating: data.rating,
        orderItemId: data.orderItemId || null,
        title: data.title || null,
        body: data.body || null,
        images:
          data.images && data.images.length > 0
            ? data.images?.map((i: any) => ({
                url: i.url,
                publicId: i.publicId,
                alt: i.alt,
                position: i.position,
              }))
            : null,
      },
    });
    return ActionResponse.toNextResponse(
      ActionResponse.success(review, 'Review successful', 201)
    );
  } catch (error) {
    return ActionResponse.toNextResponse(
      ActionResponse.error('failed', 400, { errorDetail: [String(error)] })
    );
  }
}
