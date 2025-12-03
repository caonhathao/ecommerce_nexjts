'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/generated/prisma';
import { createOrderDraftSchema } from '@/lib/validation/orderDraft';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

// Make sure to export this so we can reuse it
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
      vouchers: {
        select: {
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              value: true,
              minSubtotal: true,
              maxDiscount: true,
              startAt: true,
              endAt: true,
              shopId: true,
            },
          },
        },
      },
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
    vouchers: draft.vouchers.map((v) => ({
      ...v.voucher,
      value: v.voucher.value.toNumber(),
      maxDiscount: v.voucher.maxDiscount
        ? v.voucher.maxDiscount.toNumber()
        : null,
      minSubtotal: v.voucher.minSubtotal
        ? v.voucher.minSubtotal.toNumber()
        : null,
    })),
    items: draft.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      total: item.total.toNumber(),
    })),
  };

  return { success: true, draft: draftPlain };
}

export type OrderDraftResult = Awaited<ReturnType<typeof getOrderDrafts>>;

// --- UPDATED CREATE FUNCTION ---
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

    const headersList = await headers();
    const refer = headersList.get('referer');
    let currentPath = '/';

    if (refer) {
      try {
        const urlInstance = new URL(refer);
        currentPath = urlInstance.pathname + urlInstance.search;
      } catch (error) {
        console.error('Invalid referer URL:', refer);
      }
    }

    // 1️⃣ Get Default Shipping Address
    const defaultAddress = await prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
    if (!defaultAddress) {
      const encodeCallBack = encodeURIComponent(currentPath);
      return {
        success: false,
        redirectTo: `/customer/account/address?callbackUrl=${encodeCallBack}`,
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

    // 2️⃣ Fetch product + variant details
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
          unitPrice: Number(variant.price),
          title: variant.name || product.title,
          total: Number(variant.price) * item.quantity,
        };
      })
    );

    // 3️⃣ Fetch Voucher Details
    const voucherDetails = voucher
      ? await Promise.all(
          voucher.map(async (v) => {
            const vc = await prisma.voucher.findUnique({
              where: { code: v.code },
            });
            if (!vc) throw new Error(`Voucher not found: ${v.code}`);

            const now = new Date();
            if (vc.startAt > now || vc.endAt < now || !vc.isActive) {
              throw new Error(`Voucher ${v.code} is expired or inactive`);
            }
            return vc;
          })
        )
      : [];

    // 4️⃣ Group items by shop & Calculate Shop Subtotals
    const itemsByShop = itemDetails.reduce(
      (acc, item) => {
        if (!acc[item.shopId]) acc[item.shopId] = [];
        acc[item.shopId].push(item);
        return acc;
      },
      {} as Record<string, typeof itemDetails>
    );

    let shopGroups = Object.entries(itemsByShop).map(([shopId, items]) => {
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      return {
        shopId,
        items,
        subtotal,
        shopDiscount: 0,
      };
    });

    const BASE_SHIPPING = 30000;

    // 5️⃣ Logic: Apply Shop Vouchers FIRST
    let totalShopDiscount = 0;

    shopGroups = shopGroups.map((shop) => {
      const shopVoucher = voucherDetails.find((v) => v.shopId === shop.shopId);
      let discount = 0;
      if (shopVoucher) {
        if (shop.subtotal >= Number(shopVoucher.minSubtotal)) {
          if (shopVoucher.type === 'PERCENT') {
            discount = (shop.subtotal * Number(shopVoucher.value)) / 100;
            if (
              shopVoucher.maxDiscount &&
              Number(shopVoucher.maxDiscount) > 0
            ) {
              discount = Math.min(discount, Number(shopVoucher.maxDiscount));
            }
          } else if (shopVoucher.type === 'FIXED') {
            discount = Number(shopVoucher.value);
          }
        }
      }
      discount = Math.min(discount, shop.subtotal);
      totalShopDiscount += discount;
      return { ...shop, shopDiscount: discount };
    });

    // 6️⃣ Logic: Apply Platform/Shipping Vouchers
    const platformVouchers = voucherDetails.filter((v) => v.shopId === null);

    const totalSubtotal = shopGroups.reduce((s, x) => s + x.subtotal, 0);
    const totalSubtotalAfterShopDiscount = totalSubtotal - totalShopDiscount;

    let totalPlatformDiscount = 0;
    let totalShippingDiscount = 0;

    platformVouchers.forEach((v) => {
      if (totalSubtotalAfterShopDiscount >= Number(v.minSubtotal)) {
        if (v.type === 'SHIPPING') {
          totalShippingDiscount += Number(v.value);
        } else {
          let discount = 0;
          if (v.type === 'PERCENT') {
            discount = (totalSubtotalAfterShopDiscount * Number(v.value)) / 100;
            if (v.maxDiscount && Number(v.maxDiscount) > 0) {
              discount = Math.min(discount, Number(v.maxDiscount));
            }
          } else if (v.type === 'FIXED') {
            discount = Number(v.value);
          }
          totalPlatformDiscount += discount;
        }
      }
    });

    // 7️⃣ Final Calculations
    const totalBaseShipping = BASE_SHIPPING * shopGroups.length;
    const finalShippingFee = Math.max(
      0,
      totalBaseShipping - totalShippingDiscount
    );
    const finalTotalDiscount = totalShopDiscount + totalPlatformDiscount;
    const finalGrandTotal = Math.max(
      0,
      totalSubtotal + finalShippingFee - finalTotalDiscount
    );

    const itemsTotalDecimal = new Prisma.Decimal(totalSubtotal);
    const shippingFeeDecimal = new Prisma.Decimal(finalShippingFee);
    const discountTotalDecimal = new Prisma.Decimal(finalTotalDiscount);
    const grandTotalDecimal = new Prisma.Decimal(finalGrandTotal);

    // 8️⃣ Check Existing Draft
    const existingDraft = await prisma.orderDraft.findFirst({
      where: { userId, status: 'AWAITING_PAYMENT' },
    });

    if (existingDraft) {
      await prisma.orderDraft.update({
        where: { id: existingDraft.id },
        data: {
          notes,
          itemsTotal: itemsTotalDecimal,
          shippingFee: shippingFeeDecimal,
          discountTotal: discountTotalDecimal,
          grandTotal: grandTotalDecimal,
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
            create: voucherDetails.map((v) => ({
              voucher: { connect: { id: v.id } },
            })),
          },
        },
      });
    } else {
      // 9️⃣ Create new OrderDraft
      await prisma.orderDraft.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}`,
          status: 'AWAITING_PAYMENT',
          itemsTotal: itemsTotalDecimal,
          shippingFee: shippingFeeDecimal,
          discountTotal: discountTotalDecimal,
          grandTotal: grandTotalDecimal,
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
            create: voucherDetails.map((v) => ({
              voucher: { connect: { id: v.id } },
            })),
          },
        },
      });
    }

    revalidatePath('/draft');

    // 🔟 RETURN THE FORMATTED DRAFT USING THE HELPER
    // This ensures consistency without rewriting the format logic
    return await getOrderDrafts();
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
