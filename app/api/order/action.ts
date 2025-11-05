import { createOrderDraftSchema } from '@/lib/validation/orderDraft';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@/lib/generated/prisma';

export async function createOrderDraft(formData: FormData) {
  try {
    //Check Auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    //Get user id
    const userId = session.user.id;

    const rawData = Object.fromEntries(formData.entries());
    if (!rawData.data) throw new Error("Missing 'data' field in FormData");

    const parseData = JSON.parse(rawData.data as string);
    const data = createOrderDraftSchema.parse(parseData);

    const {notes, items, voucher } = data;

    const defaultAddress = await prisma.address.findFirst({
      where: { userId, isDefault: true },
      select: {
        fullName: true,
        phone: true,
        line1: true,
        city: true,
        district: true,
        ward: true,
      },
    })
    if (!defaultAddress) {
      throw new Error('Default address not found');
    }
    const shippingInfor = {
      name: defaultAddress.fullName,
      phone: defaultAddress.phone,
      address: defaultAddress.line1,
      city: defaultAddress.city,
      district: defaultAddress.district,
      ward: defaultAddress.ward,
    }

    // Query for take items information
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
          quantity: item.quantity,
          unitPrice: variant.price,
          title: variant?.name || product?.title,
          total: Number(variant.price) * item.quantity,
        };
      })
    );

    //Query for take voucher information
    const voucherDetail = voucher
      ? await Promise.all(
        voucher.map(async (item) => {
          const v = await prisma.voucher.findUnique({
            where: { code: item.code },
          });
          if (!v) throw new Error(`Voucher not found: ${item.code}`);
          return v;
        })
      )
      : [];

    const itemsTotal = new Prisma.Decimal(
      itemDetails.reduce((sum, item) => sum + item.total, 0)
    );
    const shippingFee = new Prisma.Decimal(30000);
    const voucherDiscount = new Prisma.Decimal(voucherDetail.reduce(
      (sum, v) => sum + Number(v.value),
      0
    ));

    const grandTotal = itemsTotal
      .add(shippingFee)
      .sub(voucherDiscount);

    const draft = await prisma.orderDraft.create({
      data: {
        userId,
        orderNumber: `ORFT-${Date.now()}`,

        itemsTotal: itemsTotal,
        shippingFee: shippingFee,
        discountTotal: voucherDiscount,
        grandTotal: grandTotal,

        notes,
        items: {
          create: itemDetails,
        },
        vouchers: {
          create: voucherDetail.map((v) => ({
            voucher: { connect: { id: v.id } }
          }))
        },
        shippingInfor: shippingInfor,
      },
    });

    revalidatePath('/draft');
    return { success: true, draft };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return { success: false, error: error.message };
    } else {
      console.error('Unknown error:', error);
      return { success: false, error: 'An unknown error occurred' };
    }
  }
}
