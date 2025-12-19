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
  const title = searchParams.get('title');
  const shopId = searchParams.get('shopId');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !title && !shopId)
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('t_missing_search_params', StatusCode.badRequest)
    );

  const whereClause: Prisma.ProductWhereInput = {};

  if (id) {
    const isValidUUID = z.string().uuid().safeParse(id).success;

    if (!isValidUUID) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_invalid_id_format', StatusCode.badRequest)
      );
    }

    whereClause.id = id;
  } else if (title)
    whereClause.title = {
      contains: title,
      mode: 'insensitive',
    };
  else if (shopId) {
    const isValidUUID = z.string().uuid().safeParse(shopId).success;

    if (!isValidUUID) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_invalid_id_format', StatusCode.badRequest)
      );
    }

    whereClause.shopId = shopId;
  }

  try {
    const data = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        shop: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        title: true,
        status: true,
        visibility: true,
        _count: {
          select: {
            variants: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    const total = data.length;

    if (data) {
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
    } else
      return ResponseFactory.toNextResponse(
        ResponseFactory.success(
          { data: [], pagination: null },
          't_success',
          StatusCode.success
        )
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
