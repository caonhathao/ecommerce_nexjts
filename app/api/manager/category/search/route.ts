import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';
import z from 'zod';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');
  const name = searchParams.get('name');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !name)
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('t_missing_search_params', StatusCode.badRequest)
    );

  const whereClause: Prisma.CategoryWhereInput = {};

  if (id) {
    const isValidUUID = z.string().uuid().safeParse(id).success;

    if (!isValidUUID) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_invalid_id_format', StatusCode.badRequest)
      );
    }

    whereClause.id = id;
  } else if (name)
    whereClause.name = {
      contains: name,
      mode: 'insensitive',
    };

  try {
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
    const payload = {
      data: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return ResponseFactory.toNextResponse(
      ResponseFactory.success(payload, 't_success', StatusCode.success)
    );
  } catch (e) {
    console.error('Error searching category:', e);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        e instanceof Error ? { detail: e.message } : undefined
      )
    );
  }
});
