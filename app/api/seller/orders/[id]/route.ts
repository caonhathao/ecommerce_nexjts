import { NextRequest } from 'next/server';
import { requireSeller } from '@/lib/require-role';
import { ResponseFactory } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { HttpStatus } from '@/types/api';

export async function PUT(req: NextRequest) {
  try {
    const sellerSession = await requireSeller();
    if (!sellerSession) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Unauthorized',
          code: HttpStatus.UNAUTHORIZED,
        })
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'orderId or status missing',
          code: HttpStatus.BAD_REQUEST,
        })
      );
    }

    // Verify ownership before update (Security Best Practice)
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        shop: { ownerId: sellerSession.user.id },
      },
    });

    if (!existingOrder) {
      return ResponseFactory.toNextResponse(
        ResponseFactory.error({
          message: 'Order not found or access denied',
          code: HttpStatus.NOT_FOUND,
        })
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
      ResponseFactory.success({
        data: order,
        message: 'Update success',
        code: HttpStatus.OK,
      })
    );
  } catch (error) {
    return ResponseFactory.toNextResponse(ResponseFactory.handleError(error));
  }
}
