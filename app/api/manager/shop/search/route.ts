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
  const ownerId = searchParams.get('ownerId');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !name && !ownerId)
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('t_missing_search_params', StatusCode.badRequest)
    );

  const whereClause: Prisma.ShopWhereInput = {};

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
  else if (ownerId) {
    const isValidUUID = z.string().uuid().safeParse(ownerId).success;

    if (!isValidUUID) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_invalid_id_format', StatusCode.badRequest)
      );
    }

    whereClause.ownerId = ownerId;
  }

  try {
    const data = await prisma.shop.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            image: true,
            name: true,
          },
        },
        status: true,
        ratingAvg: true,
        ratingCount: true,
        createdAt: true,
        updatedAt: true,
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
    // This catch block is still important for REAL errors
    // (e.g., database connection fails)
    console.error('Error fetching product:', e);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        e instanceof Error ? { detail: e.message } : undefined
      )
    );
  }
});
