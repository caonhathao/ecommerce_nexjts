import { NextRequest } from 'next/server';
import { ActionResponse } from '@/lib/service-response';
import { getAvailableVouchersService } from '@/features/voucher/voucher.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');

    if (!shopId) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Missing shopId parameter', 400)
      );
    }

    const vouchers = await getAvailableVouchersService(
      shopId,
      productId || undefined
    );

    return ActionResponse.toNextResponse(ActionResponse.success(vouchers));
  } catch (error: any) {
    console.error('API Error fetching vouchers:', error);
    return ActionResponse.toNextResponse(
      ActionResponse.error(error.message || 'Internal Server Error', 500)
    );
  }
}
