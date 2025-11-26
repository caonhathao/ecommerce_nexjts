import { requireSeller } from '@/lib/require-role';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;

export async function GET(req: NextRequest) {
  const sellerSession = await requireSeller();

  const { searchParams } = new URL(req.url);
  const limit = 12;
  const cursor = searchParams.get('cursor');
  const status = searchParams.get('status');

  if (!sellerSession) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const shops = await prisma.shop.findMany({
    where: { ownerId: sellerSession.user.id },
    select: { id: true },
  });
  const shopIds = shops.map((s) => s.id);

  const orders = await prisma.order.findMany({
    where: {
      shopId: { in: shopIds },
      ...(status ? { status: status as OrderStatus } : {}),
    },
    take: limit,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: {
      placedAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
        },
      },
    },
  });

  let nextCursor = null;
  if (orders.length === limit) {
    nextCursor = orders[orders.length - 1].id;
  }

  return NextResponse.json({
    success: true,
    data: orders,
    nextCursor: nextCursor,
  });
}
