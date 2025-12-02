import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';

export async function getOrderStats(shopId?: string, days: number = 90) {
  const session = await requireSeller();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  let targetShopIds: string[] = [];

  if (shopId && shopId !== 'all') {
    targetShopIds = [shopId];
  } else {
    const myShops = await prisma.shop.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    // Remove duplicates just in case user is both Owner and Member
    targetShopIds = Array.from(new Set(myShops.map((s) => s.id)));
  }

  if (targetShopIds.length === 0) {
    return [];
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      shopId: { in: targetShopIds },
      placedAt: {
        gte: startDate,
      },
    },
    select: {
      id: true,
      placedAt: true,
      grandTotal: true,
      status: true,
    },
    orderBy: {
      placedAt: 'asc',
    },
  });

  // Group orders by date
  const ordersByDate = orders.reduce(
    (acc, order) => {
      const date = order.placedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalOrders: 0,
          revenue: 0,
        };
      }
      acc[date].totalOrders += 1;
      acc[date].revenue += Number(order.grandTotal);
      return acc;
    },
    {} as Record<string, { date: string; totalOrders: number; revenue: number }>
  );

  return Object.values(ordersByDate);
}
