import { NextRequest } from 'next/server';
import { requireSeller } from '@/lib/require-role';
import { ActionResponse } from '@/lib/service-response';
import { prisma } from '@/lib/db';
import { getShopVouchersService } from '@/features/voucher/voucher.service';

export async function GET(req: NextRequest) {
  try {
    const sellerSession = await requireSeller();

    if (!sellerSession) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unauthorized', 401)
      );
    }

    // 2. Lấy query params
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.has('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;
    const type = searchParams.get('type') || undefined;
    const shopId = searchParams.get('shopId') || undefined;

    const shopIds = [];

    if (!shopId) {
      const shopOwner = await prisma.shop.findMany({
        where: { ownerId: sellerSession.user.id },
        select: { id: true },
      });
      shopOwner.map((owner) => shopIds.push(owner.id));
    } else {
      shopIds.push(shopId);
    }

    const result = await getShopVouchersService({
      page,
      limit,
      search,
      isActive,
      type,
      shop: shopIds,
    });

    return ActionResponse.toNextResponse(
      ActionResponse.success(result, 'fetchSuccesful', 200)
    );
  } catch (error: any) {
    return ActionResponse.toNextResponse(ActionResponse.error(error));
  }
}
