import { ActionResponse } from '@/lib/service-response';
import { getOrderStats } from '@/features/order/order.data';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') ?? '90', 10) || 90;
    const shopId = url.searchParams.get('shopId') || undefined;

    const stats = await getOrderStats(shopId, days);
    return ActionResponse.toNextResponse(ActionResponse.success(stats));
  } catch (err: any) {
    const status = err?.message === 'Unauthorized' ? 401 : 500;
    return ActionResponse.toNextResponse(
      ActionResponse.error(err.message, status)
    );
  }
}
