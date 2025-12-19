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

  const data = await prisma.category.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      isActive: true,
      parentId: true,
      imageUrl: true,
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  const payload = data;
  return ResponseFactory.toNextResponse(
    ResponseFactory.success(payload, 't_success', StatusCode.success)
  );
});

//if pass, update status and visibility of product
export const POST = withAuth(async (userId: string, request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const id = String(searchParams.get('id'));
  try {
    const body = await request.json();
    const { isActive } = body;

    if (!id) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_id', StatusCode.badRequest)
      );
    }

    if (!isActive) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('t_missing_filter', StatusCode.badRequest)
      );
    }

    // Update product status and visibility (adjust values to match your schema/enums)
    await prisma.category.update({
      where: { id },
      data: {
        isActive: isActive,
      },
    });

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
