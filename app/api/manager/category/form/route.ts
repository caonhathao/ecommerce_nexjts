import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { NextRequest } from 'next/server';

export const GET = withAuth(async (userId: string, request: NextRequest) => {
  const data = await prisma.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    select: {
      id: true,
      name: true,
      children: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  const payload = data;
  return ResponseFactory.toNextResponse(
    ResponseFactory.success(payload, 't_success')
  );
});
