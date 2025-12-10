import { requireSeller } from '@/lib/require-role';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { $Enums, Prisma } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { OrderDTO } from '@/types/dtos/order.dto';
import { ResponseFactory } from '@/lib/api-response';
import QueryMode = Prisma.QueryMode;

export async function GET(req: NextRequest) {
  const sellerSession = await requireSeller();

  if (!sellerSession) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  // const cursor = searchParams.get('cursor');

  // pagination params
  const limit = 12;
  const page = parseInt(searchParams.get('page') || '1');
  const skip = (page - 1) * limit;

  // sort params
  const status = searchParams.get('status');
  const timeRange = searchParams.get('timeRange');
  const dateParam = searchParams.get('date');
  const targetShopId = searchParams.get('shopId');
  const orderNumber = searchParams.get('search');

  const shops = await prisma.shop.findMany({
    where: { ownerId: sellerSession.user.id },
    select: { id: true },
  });
  const shopIds = shops.map((s) => s.id);

  let filterShopIds = shopIds;
  if (targetShopId && shopIds.includes(targetShopId)) {
    filterShopIds = [targetShopId];
  }

  let dateFilter: any = {};
  const now = new Date();

  if (dateParam) {
    const targetDate = new Date(dateParam);
    if (!isNaN(targetDate.getTime())) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      dateFilter = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
  } else if (timeRange === 'week') {
    const start = new Date(now.setDate(now.getDate() - 7));
    dateFilter = { gte: start };
  } else if (timeRange === 'month') {
    const start = new Date(now.setDate(now.getDate() - 30));
    dateFilter = { gte: start };
  } else {
    const start = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = { gte: start };
  }

  const hasDateFilter = Object.keys(dateFilter).length > 0;

  const whereClause = {
    shopId: { in: filterShopIds },
    ...(status ? { status: status as OrderStatus } : {}),
    ...(hasDateFilter ? { placedAt: dateFilter } : {}),
    ...(orderNumber
      ? {
          orderNumber: {
            contains: orderNumber,
            mode: 'insensitive' as QueryMode,
          },
        }
      : {}),
  };

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where: whereClause }),

    prisma.order.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: {
        placedAt: 'desc',
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: {
              select: { image: true },
            },
          },
        },
        shop: {
          select: { name: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  // let nextCursor = null;
  // if (orders.length === limit) {
  //   nextCursor = orders[orders.length - 1].id;
  // }

  return ResponseFactory.toNextResponse(
    ResponseFactory.success(
      {
        orders: orders,
        pagination: { page, limit, total, totalPages },
      },
      'fetch successful',
      200
    )
  );
  // NextResponse.json({
  //   success: true,
  //   data: orders,
  //   nextCursor: nextCursor,
  // });
}
