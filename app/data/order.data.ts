import { getSessionUser } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/db';

export async function getOrder(orderId: string) {
  const session = await getSessionUser();
  if (!session) {
    return redirect('/403');
  }

  const data = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      placedAt: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      itemsTotal: true,
      shippingFee: true,
      discountTotal: true,
      grandTotal: true,
      shippingAddress: true, // JSON field
      billingAddress: true, // JSON field
      notes: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      shop: { select: { id: true, name: true, slug: true, logoUrl: true } },
      items: {
        select: {
          id: true,
          title: true,
          unitPrice: true,
          quantity: true,
          discount: true,
          total: true,
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              images: true,
            },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              name: true,
              price: true,
              image: true,
              currency: true,
            },
          },
        },
      },
      shipments: true,
      refunds: true,
      payments: {
        include: {
          payment: {
            select: {
              id: true,
              status: true,
              method: true,
              amount: true,
              currency: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      vouchers: {
        include: {
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              value: true,
              maxDiscount: true,
              minSubtotal: true,
              currency: true,
            },
          },
        },
      },
    },
  });

  if (!data) return notFound();

  // console.log(data);

  return {
    ...data,
    itemsTotal: data.itemsTotal.toNumber(),
    shippingFee: data.shippingFee.toNumber(),
    discountTotal: data.discountTotal.toNumber(),
    grandTotal: data.grandTotal.toNumber(),
    items: data.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      discount: item.discount ? item.discount.toNumber() : 0,
      total: item.total.toNumber(),
      variant: item.variant
        ? {
            ...item.variant,
            price: item.variant.price.toNumber(),
          }
        : null,
    })),

    vouchers: data.vouchers.map((v) => ({
      ...v.voucher,
      value: v.voucher.value.toNumber(),
      maxDiscount: v.voucher.maxDiscount
        ? v.voucher.maxDiscount.toNumber()
        : null,
      minSubtotal: v.voucher.minSubtotal
        ? v.voucher.minSubtotal.toNumber()
        : null,
    })),

    payments: data.payments.map((p) => ({
      ...p.payment,
      amount: p.payment.amount.toNumber(),
    })),
  };
}

export type OrderDetails = Awaited<ReturnType<typeof getOrder>>;
