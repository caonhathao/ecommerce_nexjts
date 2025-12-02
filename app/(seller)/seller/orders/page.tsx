'use client';

import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/app/(public)/(customer)/customer/account/orders/_components/no-order-found';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { DataTable } from '@/app/(seller)/seller/orders/_components/order-data-table';
import { columns } from '@/app/(seller)/seller/orders/_components/order-column-table';
import { OrderDTO } from '@/types/dtos/order.dto';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
//
// enum OrderStatus {
//   AWAITING_PAYMENT = 'AWAITING_PAYMENT',
//   PROCESSING = 'PROCESSING',
//   SHIPPED = 'SHIPPED',
//   DELIVERED = 'DELIVERED',
//   CANCELED = 'CANCELED',
// }

// interface OrderItem {
//   id: string;
//   title: string;
//   quantity: number;
//   total: number;
//   product: {
//     images: { url: string }[];
//     name: string;
//     slug: string;
//   };
// }
//
// interface Order {
//   id: string;
//   orderNumber: string;
//   status: OrderStatus;
//   grandTotal: number;
//   createdAt: string;
//   items: OrderItem[];
// }

const LIMIT = 12;

export default function SellerOrderPage() {
  const t = useTranslations('seller.order_page');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const router = useRouter();

  const observer = useRef<IntersectionObserver | null>(null);

  const handleRefresh = useCallback(() => {
    console.log('hihi');
    setRefreshIndex((prev) => prev + 1);
  }, []);

  const fetchOrders = useCallback(
    async (isNewTab = false, cursor?: string | null) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', LIMIT.toString());
        if (activeTab !== 'ALL') params.append('status', activeTab);
        if (cursor) params.append('cursor', cursor);

        const res = await fetch(`/api/seller/orders?${params.toString()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (data.success) {
          setOrders((prev) => (isNewTab ? data.data : [...prev, ...data.data]));
          setNextCursor(data.nextCursor);
          setHasMore(!!data.nextCursor);
        }
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    setOrders([]);
    setNextCursor(null);
    setHasMore(true);
    setIsInitialLoad(true);
    fetchOrders(true, null);
  }, [activeTab, fetchOrders, refreshIndex]);

  const lastOrderElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && nextCursor) {
          fetchOrders(false, nextCursor);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, nextCursor, fetchOrders]
  );

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="flex w-full flex-col gap-6">
        <Tabs
          defaultValue="ALL"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/40 p-1 rounded-xl shadow-inner">
            <TabItem value="ALL" label="Tất cả" count={null} />
            <TabItem
              value={OrderStatus.AWAITING_PAYMENT}
              label="Chờ thanh toán"
            />
            <TabItem value={OrderStatus.PROCESSING} label="Cần xử lý" />
            <TabItem value={OrderStatus.SHIPPED} label="Đang vận chuyển" />
            <TabItem value={OrderStatus.DELIVERED} label="Đã giao" />
            <TabItem value={OrderStatus.CANCELED} label="Đã hủy" />
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 w-full space-y-6">
            {isInitialLoad && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">
                  Đang tải dữ liệu...
                </p>
              </div>
            )}

            {activeTab === 'ALL' && !isInitialLoad && orders.length > 0 ? (
              <div className="bg-background-secondary border-border border-2 rounded-lg">
                <DataTable
                  columns={columns(t, handleRefresh)}
                  data={orders as OrderDTO[]}
                />
              </div>
            ) : !isInitialLoad && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  const isLastElement = orders.length === index + 1;
                  return (
                    <div
                      key={order.id}
                      ref={isLastElement ? lastOrderElementRef : null}
                    >
                      <SellerOrderCard order={order} />
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="py-4 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!hasMore && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Đã hiển thị hết đơn hàng.
                  </p>
                )}
              </div>
            ) : (
              !isInitialLoad && (
                <div className="py-10 bg-card rounded-xl border border-dashed border-border">
                  <EmptyState
                    imageSrc="/empty-order.png"
                    title="Chưa có đơn hàng nào ở trạng thái này"
                  />
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TabItem({
  value,
  label,
}: {
  value: string;
  label: string;
  count?: number | null;
}) {
  return (
    <TabsTrigger
      value={value}
      className="px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
    >
      {label}
    </TabsTrigger>
  );
}

function SellerOrderCard({ order }: { order: OrderDTO }) {
  const statusColor: Record<string, string> = {
    AWAITING_PAYMENT: 'bg-warning/15 text-warning border-warning/30',
    PROCESSING: 'bg-info/15 text-info border-info/30',
    SHIPPED: 'bg-primary/15 text-primary border-primary/30',
    DELIVERED: 'bg-success/15 text-success border-success/30',
    CANCELED: 'bg-destructive/15 text-destructive border-destructive/30',
  };
  const c = useTranslations('general');

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow border border-border overflow-hidden">
      <CardHeader className="bg-muted/10 py-3 px-4 flex flex-row justify-between items-center border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-foreground">
            #{order.orderNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(order.placedAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`border ${statusColor[order.status] || 'bg-muted'}`}
        >
          {order.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="relative w-16 h-16 rounded-md overflow-hidden border border-border bg-muted shrink-0">
              <Image
                src={item.product.images[0]?.url || '/placeholder.png'}
                alt={item.product.title ? item.product.title : ',,,'}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-foreground truncate"
                title={item.product.title}
              >
                {item.product.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Phân loại: {item.title}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                x{item.quantity}
              </p>
              <p className="text-sm text-primary font-semibold mt-1">
                {formatPrice(item.total, {
                  currency: c('t_currency'),
                  rate: Number(c('t_rate')),
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="bg-muted/5 py-3 px-4 flex justify-between items-center border-t border-border">
        <div className="text-sm text-foreground">
          Tổng thu:{' '}
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.grandTotal, {
              currency: c('t_currency'),
              rate: Number(c('t_rate')),
            })}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Xem chi tiết
          </Button>
          {order.status === 'PROCESSING' && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Chuẩn bị hàng
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
