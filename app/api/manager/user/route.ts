import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';

//api to get list of user
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    const lockStatus = searchParams.get('filter')?.toString();

    const whereClause: Prisma.UserWhereInput = {};

    // Conditionally add the visibility filter
    if (lockStatus !== null || lockStatus !== undefined) {
      whereClause.banned = lockStatus === 'true' ? true : false;
    }

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
      skip,
      take: limit,
      orderBy: { id: 'asc' },
    });

    const total = await prisma.user.count({
      where: whereClause,
    });

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
  } catch (err) {
    console.log(err);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_server_error',
        StatusCode.internalServerError,
        err instanceof Error ? { detail: err.message } : undefined
      )
    );
  }
});
