import { prisma } from '@/lib/db';
import { requireSeller } from '@/lib/require-role';

export async function getShopIdByUserId(
  userId: string
): Promise<string | undefined> {
  await requireSeller();

  const shop = await prisma.shop.findFirst({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });

  return shop?.id ?? undefined;
}
