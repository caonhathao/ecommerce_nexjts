import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { Prisma, ShopStatus } from '@/lib/generated/prisma';
import { sendShopStatusChangeEmail } from '@/lib/mailer';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;
  const skip = (page - 1) * limit;

  const status = searchParams.get('filter')?.toString();

  const whereClause: Prisma.ShopWhereInput = {};

  // Conditionally add the visibility filter
  if (status !== null) {
    const check = status?.toUpperCase();
    if (check && check in ShopStatus) whereClause.status = check as ShopStatus;
  }

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
    skip,
    take: limit,
    orderBy: { id: 'asc' },
  });

  const total = await prisma.shop.count({
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
});

//if pass, update status and visibility of product
export const PUT = withAuth(async (userId: string, request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_id', StatusCode.badRequest)
      );
    }

    if (!status) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_status', StatusCode.badRequest)
      );
    }

    // Update product status (adjust values to match your schema/enums)
    const shop = await prisma.shop.update({
      where: { id },
      data: {
        status: status,
      },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    // send email to owner
    await sendShopStatusChangeEmail(
      shop.owner.email,
      shop.name,
      shop.owner.name || 'Shop Owner',
      status
    );

    return ResponseFactory.toNextResponse(
      ResponseFactory.success(null, 't_success', StatusCode.success)
    );
  } catch (err) {
    console.error(err);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_internal_server_error',
        StatusCode.internalServerError,
        err instanceof Error ? { detail: err.message } : undefined
      )
    );
  }
});
