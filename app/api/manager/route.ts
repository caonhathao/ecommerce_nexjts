import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/with-auth';
import { StatusCodeIdentify as StatusCode } from '@/types/api';

export const GET = withAuth(async (userId: string) => {
  try {
    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });
    return ResponseFactory.toNextResponse(
      ResponseFactory.success(data, 't_success', StatusCode.success)
    );
  } catch (err) {
    console.error(err);
    return ResponseFactory.toNextResponse(
      ResponseFactory.error(
        't_server_error',
        StatusCode.internalServerError,
        err instanceof Error ? { detail: err.message } : undefined
      )
    );
  }
});
