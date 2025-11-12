'use client';

import { EmptyState } from '@/app/(public)/(customer)/customer/account/orders/_components/no-order-found';
import { ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { getOrder } from '@/app/actions/order';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { Loading } from '@/app/(public)/_components/loading';

export default function OrderPage() {
  const [status, setStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [isPendingTransition, startTransition] = useTransition();
  const [data, dispatch, isPending] = useActionState<
    { orders: any[]; nextCursor?: string },
    { cursor?: string; status?: OrderStatus; orderId?: string }
  >(getOrder, { orders: [], nextCursor: undefined });

  useEffect(() => {
    startTransition(() => {
      dispatch({
        status: status === 'ALL' ? undefined : (status as OrderStatus),
        cursor: undefined,
      });
    });
  }, [status]);

  return (
    <div className="p-4 w-full min-h-fit">
      <div className="mb-6 flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-primary/90 to-chart-2 rounded-xl shadow-lg w-fit">
        <ClipboardList className="w-6 h-6 text-background" />
        <h2 className="text-xl md:text-2xl font-medium text-background">
          Đơn hàng của tôi
        </h2>
      </div>
      <div className="flex w-full flex-col gap-6">
        <Tabs
          defaultValue="ALL"
          value={status}
          onValueChange={(val) => setStatus(val as any)}
          className="w-full"
        >
          <TabsList className="w-full items-center justify-between ">
            <TabsTrigger className="shadow-2xl" value="ALL">
              Tất cả đơn
            </TabsTrigger>
            <TabsTrigger value={OrderStatus.AWAITING_PAYMENT}>
              Chờ thanh toán
            </TabsTrigger>
            <TabsTrigger value={OrderStatus.PROCESSING}>Đang xử lí</TabsTrigger>
            <TabsTrigger value={OrderStatus.SHIPPED}>
              Đang vận chuyển
            </TabsTrigger>
            <TabsTrigger value={OrderStatus.DELIVERED}>Đã giao</TabsTrigger>
            <TabsTrigger value={OrderStatus.CANCELED}>Đã hủy</TabsTrigger>
          </TabsList>
          <TabsContent value={status} className="w-full shadow-none p-0">
            {isPending ? (
              <div>
                <Loading />
                <p className="mt-4 text-gray-500">Đang tải đơn hàng...</p>
              </div>
            ) : data.orders.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {data.orders.map((o) => (
                  <li key={o.id} className="rounded-lg border p-4 shadow-sm">
                    <div className="font-medium">Mã đơn: {o.id}</div>
                    <div className="text-sm text-gray-500">
                      Trạng thái: {o.status}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                imageSrc="/empty-order.png"
                title="Không tìm thấy đơn hàng"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
