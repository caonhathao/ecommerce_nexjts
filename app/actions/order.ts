'use server';

import { auth, getCurrentUserId } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { OrderStatus, Prisma } from '@/lib/generated/prisma';
import { revalidatePath } from 'next/cache';
import { OrderWithRelations } from '@/types/order.data-types';

type CreateOrderResult =
  | { success: true; order: OrderWithRelations[] }
  | { success: false; error: string };

export async function createOrder(draftId: string): Promise<CreateOrderResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = session.user.id;

    const draft = await prisma.orderDraft.findFirst({
      where: { id: draftId, userId },
      include: {
        items: true,
        vouchers: {
          include: { voucher: true },
        },
      },
    });
    if (!draft) {
      return { success: false, error: 'Không tìm thấy bản nháp đơn hàng' };
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: draft.orderNumber,
        userId: userId,
        status: draft.status,
        paymentStatus: 'PENDING',

        itemsTotal: draft.itemsTotal,
        shippingFee: draft.shippingFee,
        discountTotal: draft.discountTotal,
        grandTotal: draft.grandTotal,

        shippingAddress: draft.shippingInfor as Prisma.InputJsonValue,
        notes: draft.notes,

        items: {
          create: draft.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            title: item.title,
          })),
        },

        vouchers: {
          create: draft.vouchers.map((v) => ({
            voucher: { connect: { id: v.voucherId } },
          })),
        },
      },
      include: {
        items: true,
        vouchers: { include: { voucher: true } },
      },
    });
    if (order) {
      await prisma.orderDraft.delete({
        where: { id: draft.id },
      });

      const cart = await prisma.cart.findUnique({
        where: { userId: userId },
      });
      if (!cart) {
        return { success: false, error: 'Không tìm thấy giỏ hàng' };
      }

      const variantIds = order.items
        .map((i) => i.variantId)
        .filter((id): id is string => !!id);

      const productIds = order.items.map((i) => i.productId);

      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          variantId: { in: variantIds },
        },
      });
      revalidatePath('/cart');
    }
    return { success: true, order };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message };
  }
}

interface GetOrdersParams {
  cursor?: string;
  status?: OrderStatus;
  orderId?: string;
  limit?: number;
}

export async function getOrder(
  _prevState: any,
  formData: GetOrdersParams = {}
): Promise<{ orders: any[]; nextCursor: string | undefined }> {
  const { cursor, status, orderId, limit = 10 } = formData;

  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      throw new Error('Unauthorized');
    }
    const filter = {
      userId,
      ...(orderId && { orderId }),
      ...(status && { status }),
    };

    const order = await prisma.order.findMany({
      where: filter,
      orderBy: { placedAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
      },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    });

    const hasNextPage = order.length > limit;
    const nextCursor = hasNextPage ? order[limit - 1].id : undefined;

    return {
      orders: hasNextPage ? order.slice(0, limit) : order,
      nextCursor,
    };
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    throw new Error(error.message || 'Internal Server Error');
  }
}
