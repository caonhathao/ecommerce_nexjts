import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';
import { z } from 'zod';

//api to get list of user
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = searchParams.get('id');
  const name = searchParams.get('name');
  const email = searchParams.get('email');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  //check valid params (one of them)
  if (!id && !name && !email)
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('t_missing_query_params', StatusCode.badRequest)
    );

  const whereClause: Prisma.UserWhereInput = {};

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
  else if (email) whereClause.email = email;

  try {
    const data = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
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
        ResponseFactory.error('t_no_result', StatusCode.notFound)
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
