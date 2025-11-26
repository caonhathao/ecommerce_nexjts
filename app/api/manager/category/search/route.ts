import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const keyword = searchParams.get('keyword');

  if (!keyword || keyword.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        data: {
          message: 'Missing search keyword',
        },
      },
      { status: 400 }
    );
  }

  try {
    // 2. Sử dụng findMany để trả về danh sách kết quả
    const data = await prisma.category.findMany({
      where: {
        name: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        isActive: true,
        name: true,
        parentId: true,
        slug: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            children: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (e) {
    console.error('Error searching category:', e);
    return NextResponse.json(
      {
        success: false, // Thường lỗi server nên để success false hoặc status code rõ ràng
        message: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
});
