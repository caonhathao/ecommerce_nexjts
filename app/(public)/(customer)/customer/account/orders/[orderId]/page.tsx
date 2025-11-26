import { getOrder } from '@/app/data/order.data';
import { OrderDetailClient } from './_components/order-detail-client';

interface OrderDetailPageProps {
  orderId: string;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<OrderDetailPageProps>;
}) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  return <OrderDetailClient order={order} />;
}
