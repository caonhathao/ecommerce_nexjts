import { NextRequest } from 'next/server';
import { requireSeller } from '@/lib/require-role';
import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(req: NextRequest) {
  try {
    const sellerSession = await requireSeller();
    if (!sellerSession) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('Unauthorized', 401)
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error('orderId or status missing', 404)
      );
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
    });
    return ResponseFactory.toNextResponse(
      ResponseFactory.success(order, 'update success', 200)
    );
  } catch (error) {
    return ResponseFactory.toNextResponse(
      ResponseFactory.error('update failed', 403)
    );
  }
}
