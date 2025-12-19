import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';
import { NextRequest } from 'next/server';

//query api
//get all data of one product
export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));

  if (!id) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('t_missing_id', StatusCode.badRequest)
    );
  }

  try {
    const data = await prisma.user.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        profile: {
          select: {
            emailForBill: true,
            phone: true,
            gender: true,
          },
        },
        shopsOwned: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        shopMemberships: {
          select: {
            shop: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
          },
        },
      },
    });

    return ResponseFactory.toNextResponse(
      ResponseFactory.success(data, 't_success', StatusCode.success)
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
