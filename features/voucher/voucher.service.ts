import { $Enums, Prisma } from '@/lib/generated/prisma';
import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';
import { ActionResponse } from '@/lib/service-response';
import { CreateVoucherInput } from '@/lib/validation/voucher';
import VoucherType = $Enums.VoucherType;
import { VoucherResponseDTO } from '@/features/voucher/voucher.dto';

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
    // 1. Get product category to check category-specific vouchers
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

  // Transform Decimal to Number for frontend safety
  return vouchers.map((v) => ({
    ...v,
    value: Number(v.value),
    minSubtotal: v.minSubtotal ? Number(v.minSubtotal) : 0,
    maxDiscount: v.maxDiscount ? Number(v.maxDiscount) : 0,
  }));
};

export const createProductVoucherService = async (
  productId: string,
  voucherId: string
) => {
  try {
    await prisma.voucherProduct.create({
      data: {
        voucherId: voucherId,
        productId: productId,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return;
    }
    throw error;
  }
};

export const createCategoryVoucherService = async (
  voucherId: string,
  categoryId: string
) => {
  try {
    await prisma.voucherCategory.create({
      data: {
        voucherId: voucherId,
        categoryId: categoryId,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return;
    }
    throw error;
  }
};

export const createVoucherService = async (params: CreateVoucherInput) => {
  try {
    let validProductIds: string[] = [];
    let validCategoryIds: string[] = [];

    if (params.productIds && params.productIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: { id: { in: params.productIds } },
        select: { id: true },
      });
      validProductIds = existingProducts.map((p) => p.id);
      if (validProductIds.length !== params.productIds.length) {
        console.warn('Một số ID sản phẩm không hợp lệ và sẽ bị bỏ qua.');
      }
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
      const existingCategory = await prisma.category.findMany({
        where: { id: { in: params.categoryIds } },
        select: { id: true },
      });
      validCategoryIds = existingCategory.map((p) => p.id);
      if (validCategoryIds.length !== params.categoryIds.length) {
        console.warn('Một số ID sản phẩm không hợp lệ và sẽ bị bỏ qua.');
      }
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: params.code,
        type: params.type,
        value: params.value,
        maxDiscount: params.type === 'PERCENT' ? params.maxDiscount : null,
        minSubtotal: params.minSubtotal,
        currency: params.currency,
        startAt: params.startAt,
        endAt: params.endAt,
        usageLimit: params.usageLimit,
        perUserLimit: params.perUserLimit,
        shopId: params.shopId,
        isActive: params.isActive,

        products:
          validProductIds.length > 0
            ? {
                create: validProductIds.map((productId) => ({
                  productId: productId,
                })),
              }
            : undefined,

        categories:
          validCategoryIds.length > 0
            ? {
                create: validCategoryIds.map((categoryId) => ({
                  categoryId: categoryId,
                })),
              }
            : undefined,
      },
      include: {
        products: true,
        categories: true,
      },
    });
    return voucher;
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new Error('Một hoặc nhiều sản phẩm/danh mục không tồn tại.');
    }
    if (error.code === 'P2002') {
      throw new Error('Mã voucher đã tồn tại.');
    }
    throw error;
  }
};

type GetVoucherParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  type?: string;
  shop?: string[];
};

export const getAdminVouchersService = async (params: GetVoucherParams) => {
  const { page = 1, limit = 12, search, isActive, type } = params;
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.VoucherWhereInput = {
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      code: { contains: search, mode: 'insensitive' },
    }),
    ...(type !== undefined && { code: { contains: type } }),
  };

  const [total, vouchers] = await prisma.$transaction([
    prisma.voucher.count({ where: whereCondition }),
    prisma.voucher.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: true,
        _count: { select: { orders: true } },
      },
    }),
  ]);

  return {
    vouchers: vouchers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getShopVouchersService = async (params: GetVoucherParams) => {
  const { page = 1, limit = 10, search, isActive, type, shop } = params;
  const skip = (page - 1) * limit;

  const shopIds = shop ? (Array.isArray(shop) ? shop : [shop]) : undefined;
  const whereCondition: Prisma.VoucherWhereInput = {
    ...(shopIds && {
      shopId: { in: shopIds },
    }),
    ...(isActive !== undefined && { isActive }),
    ...(search && {
      code: { contains: search, mode: 'insensitive' },
    }),
    ...(type !== undefined && { code: { contains: type } }),
  };

  const [total, vouchers] = await prisma.$transaction([
    prisma.voucher.count({ where: whereCondition }),
    prisma.voucher.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          include: { product: { select: { id: true, title: true } } },
        },
      },
    }),
  ]);

  return {
    vouchers: vouchers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
