import { NextRequest } from 'next/server';
import { requireSeller } from '@/lib/require-role';
import { ActionResponse } from '@/lib/service-response';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function PUT(req: NextRequest) {
  try {
    const sellerSession = await requireSeller();
    if (!sellerSession) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unauthorized', 401)
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('orderId or status missing', 404)
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
    return ActionResponse.toNextResponse(
      ActionResponse.success(order, 'update success', 200)
    );
  } catch (error) {
    return ActionResponse.toNextResponse(
      ActionResponse.error('update failed', 403)
    );
  }
}
