'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { createOrderDraftSchema } from '@/lib/validation/orderDraft';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function createOrderDraft(formData: FormData) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const userId = session.user.id;

    const rawData = Object.fromEntries(formData.entries());
    if (!rawData.data) throw new Error("Missing 'data' field in FormData");

    const parseData = JSON.parse(rawData.data as string);
    const data = createOrderDraftSchema.parse(parseData);
    const { notes, items, voucher } = data;

    // 1️⃣ Get Default Shipping Address
    const defaultAddress = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultAddress) {
      return {
        success: false,
        redirectTo: '/customer/account/address',
        message: 'Default address missing',
      };
    }

    const shippingInfor = {
      name: defaultAddress.fullName,
      phone: defaultAddress.phone,
      address: defaultAddress.line1,
      city: defaultAddress.city,
      district: defaultAddress.district,
      ward: defaultAddress.ward,
    };

    // 2️⃣ Fetch product + variant and build item details
    const itemDetails = await Promise.all(
      items.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
        });
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!variant) throw new Error('Variant not found');
        if (!product) throw new Error('Product not found');

        return {
          productId: product.id,
          variantId: variant.id,
          shopId: product.shopId,
          quantity: item.quantity,
          unitPrice: variant.price,
          title: variant.name || product.title,
          total: Number(variant.price) * item.quantity,
        };
      })
    );

    // 3️⃣ Voucher
    const voucherDetail = voucher
      ? await Promise.all(
          voucher.map(async (v) => {
            const vc = await prisma.voucher.findUnique({
              where: { code: v.code },
            });
            if (!vc) throw new Error(`Voucher not found: ${v.code}`);
            return vc;
          })
        )
      : [];

    // 4️⃣ Group items by shop
    const itemsByShop = itemDetails.reduce(
      (acc, item) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      },
      {} as Record<string, typeof itemDetails>
    );

    const shops = Object.entries(itemsByShop).map(([shopId, items]) => {
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      return {
        shopId,
        items,
        subtotal,
      };
    });

    const totalSubtotal = shops.reduce((s, x) => s + x.subtotal, 0);

    // 5️⃣ Shipping Fee + Discount phân bổ theo tỷ lệ subtotal
    const BASE_SHIPPING = 30000;

    const totalDiscount = voucherDetail.reduce((sum, v) => {
      if (v.type === 'PERCENT')
        return sum + (totalSubtotal * Number(v.value)) / 100;
      if (v.type === 'FIXED') return sum + Number(v.value);
      return sum;
    }, 0);

    const totalShippingDiscount = voucherDetail.reduce((sum, v) => {
      if (v.type === 'SHIPPING') return sum + Number(v.value);
      return sum;
    }, 0);

    const shopCalculations = shops.map((shop) => {
      const ratio = shop.subtotal / totalSubtotal;
      const shopShipping =
        BASE_SHIPPING - totalShippingDiscount < 0
          ? 0
          : BASE_SHIPPING - totalShippingDiscount;
      const shopDiscount = totalDiscount * ratio;
      const total = shop.subtotal + shopShipping - shopDiscount;
      return {
        ...shop,
        shopShipping,
        shopDiscount,
        total,
      };
    });

    const itemsTotal = new Prisma.Decimal(totalSubtotal);
    const shippingFee = new Prisma.Decimal(
      shopCalculations.reduce((s, x) => s + x.shopShipping, 0)
    );

    const discountTotal = new Prisma.Decimal(
      shopCalculations.reduce((s, x) => s + x.shopDiscount, 0)
    );

    const grandTotal = new Prisma.Decimal(
      shopCalculations.reduce((s, x) => s + x.total, 0)
    );

    // 6️⃣ Check Existing Draft
    const existingDraft = await prisma.orderDraft.findFirst({
      where: { userId, status: 'AWAITING_PAYMENT' },
    });

    if (existingDraft) {
      await prisma.orderDraft.update({
        where: { id: existingDraft.id },
        data: {
          notes,
          itemsTotal,
          shippingFee,
          discountTotal,
          grandTotal,
          shippingInfor,
          updatedAt: new Date(),
          items: {
            deleteMany: {},
            create: itemDetails.map((i) => ({
              ...i,
              total: new Prisma.Decimal(i.total),
              unitPrice: new Prisma.Decimal(i.unitPrice),
            })),
          },
          vouchers: {
            deleteMany: {},
            create: voucherDetail.map((v) => ({
              voucher: { connect: { id: v.id } },
            })),
          },
        },
      });

      revalidatePath('/draft');
      return { success: true, updated: true };
    }

    // 7️⃣ Create new OrderDraft
    const draft = await prisma.orderDraft.create({
      data: {
        userId,
        orderNumber: `ORD-${Date.now()}`,
        status: 'AWAITING_PAYMENT',
        itemsTotal,
        shippingFee,
        discountTotal,
        grandTotal,
        notes,
        shippingInfor,
        items: {
          create: itemDetails.map((i) => ({
            ...i,
            total: new Prisma.Decimal(i.total),
            unitPrice: new Prisma.Decimal(i.unitPrice),
          })),
        },
        vouchers: {
          create: voucherDetail.map((v) => ({
            voucher: { connect: { id: v.id } },
          })),
        },
      },
    });

    revalidatePath('/draft');
    return { success: true, draft };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function getOrderDrafts() {
  //Check Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  //Get user id
  const userId = session.user.id;

  const draft = await prisma.orderDraft.findUnique({
    where: { userId: userId },
    select: {
      id: true,
      orderNumber: true,
      itemsTotal: true,
      shippingFee: true,
      discountTotal: true,
      grandTotal: true,
      shippingInfor: true,
      items: {
        select: {
          title: true,
          quantity: true,
          unitPrice: true,
          total: true,
          product: {
            select: {
              shop: {
                select: {
                  name: true,
                },
              },
              images: {
                select: {
                  url: true,
                  alt: true,
                  position: true,
                },
                orderBy: { position: 'asc' },
              },
            },
          },
        },
      },
    },
  });
  if (!draft) return { success: false, error: 'No draft found' };

  const draftPlain = {
    ...draft,
    itemsTotal: draft.itemsTotal.toNumber(),
    shippingFee: draft.shippingFee.toNumber(),
    discountTotal: draft.discountTotal.toNumber(),
    grandTotal: draft.grandTotal.toNumber(),
    items: draft.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      total: item.total.toNumber(),
    })),
  };

  return { success: true, draft: draftPlain };
}

export type OrderDraftResult = Awaited<ReturnType<typeof getOrderDrafts>>;
