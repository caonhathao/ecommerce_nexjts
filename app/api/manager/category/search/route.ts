import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');
  const name = searchParams.get('name');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !name)
    return NextResponse.json(
      {
        success: false,
        data: {
          message: 'Missing search keyword',
        },
      },
      { status: 400 }
    );

  const whereClause: Prisma.CategoryWhereInput = {};

  if (id) {
    const isValidUUID = z.string().uuid().safeParse(id).success;

    if (!isValidUUID) {
      return NextResponse.json({ success: 400, data: [] });
    }

    whereClause.id = id;
  } else if (name)
    whereClause.name = {
      contains: name,
      mode: 'insensitive',
    };

  try {
    // 2. Sử dụng findMany để trả về danh sách kết quả
    const data = await prisma.category.findMany({
      where: whereClause,
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

    const total = data.length;

    return NextResponse.json({
      success: true,
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
