import { Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/db';

export const getAvailableVouchersService = async (
  shopId: string,
  productId?: string
) => {
  const now = new Date();

  const whereConditions: Prisma.VoucherWhereInput = {
    isActive: true,
    startAt: { lte: now },
    endAt: { gte: now },
    OR: [{ shopId: shopId }, { shopId: null }],
  };

  if (productId) {
    // Get product category to check category-specific vouchers
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    const andClauses: Prisma.VoucherWhereInput[] = [];

    // Product restrictions: either none or includes this product
    andClauses.push({
      OR: [{ products: { none: {} } }, { products: { some: { productId } } }],
    });

    // Category restrictions: handle nullable categoryId
    if (product?.categoryId) {
      andClauses.push({
        OR: [
          { categories: { none: {} } },
          { categories: { some: { categoryId: product.categoryId } } },
        ],
      });
    } else {
      // If product has no category, only allow vouchers without category restrictions
      andClauses.push({
        categories: { none: {} },
      });
    }

    whereConditions.AND = andClauses;
  }

  const vouchers = await prisma.voucher.findMany({
    where: whereConditions,
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
    orderBy: {
      endAt: 'asc', // Show vouchers expiring soonest first
    },
  });

  return vouchers.map((v) => ({
    ...v,
    value: Number(v.value),
    minSubtotal: v.minSubtotal ? Number(v.minSubtotal) : 0,
    maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : 0,
  }));
};
