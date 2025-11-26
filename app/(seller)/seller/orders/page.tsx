'use client';

import { PackageSearch, Loader2 } from 'lucide-react';
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
import { formatPrice } from '@/app/(public)/_components/global-function';

// Định nghĩa kiểu dữ liệu dựa trên Prisma Model
// Bạn nên import từ @prisma/client nếu có thể
enum OrderStatus {
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

interface OrderItem {
  id: string;
  title: string;
  quantity: number;
  total: number;
  product: {
    images: { url: string }[];
    name: string;
    slug: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
}

const LIMIT = 12;

export default function SellerOrderPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [orders, setOrders] = useState<Order[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);

  const fetchOrders = useCallback(
    async (isNewTab = false, cursor?: string | null) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('limit', LIMIT.toString());
        if (activeTab !== 'ALL') params.append('status', activeTab);
        if (cursor) params.append('cursor', cursor);

        const res = await fetch(`/api/seller/orders?${params.toString()}`);
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
  }, [activeTab, fetchOrders]);

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
      <div className="mb-8 flex w-fit items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary to-brand rounded-2xl shadow-xl">
        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
          <PackageSearch className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow-md">
            Quản lý đơn hàng
          </h2>
          <p className="text-xs text-violet-100 font-medium">Kênh người bán</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex w-full flex-col gap-6">
        <Tabs
          defaultValue="ALL"
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/40 p-1 rounded-xl shadow-inner h-auto">
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
            {/* Loading Initial */}
            {isInitialLoad && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">
                  Đang tải dữ liệu...
                </p>
              </div>
            )}

            {/* Order List */}
            {!isInitialLoad && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order, index) => {
                  // Kiểm tra xem đây có phải phần tử cuối cùng để gắn ref không
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

                {/* Loading More Indicator */}
                {isLoading && (
                  <div className="py-4 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {/* End of list */}
                {!hasMore && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Đã hiển thị hết đơn hàng.
                  </p>
                )}
              </div>
            ) : (
              !isInitialLoad && (
                <div className="py-10 bg-white rounded-xl border border-dashed">
                  <EmptyState
                    imageSrc="/empty-order.png" // Nhớ thay ảnh phù hợp
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

// Sub-component: Tab Item cho gọn
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
      className="px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
    >
      {label}
    </TabsTrigger>
  );
}

// Sub-component: Card hiển thị đơn hàng
function SellerOrderCard({ order }: { order: Order }) {
  // Map màu sắc cho badge trạng thái
  const statusColor: Record<string, string> = {
    AWAITING_PAYMENT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELED: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow border-muted/60 overflow-hidden">
      <CardHeader className="bg-muted/10 py-3 px-4 flex flex-row justify-between items-center border-b">
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm text-foreground">
            #{order.orderNumber}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`border ${statusColor[order.status] || 'bg-gray-100'}`}
        >
          {order.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 items-start">
            <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-gray-50 shrink-0">
              <Image
                src={item.product.images[0]?.url || '/placeholder.png'}
                alt={item.product.name ? item.product.name : ',,,'}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium text-foreground truncate"
                title={item.product.name}
              >
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Phân loại: {item.title}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium">x{item.quantity}</p>
              <p className="text-sm text-primary font-semibold mt-1">
                {formatPrice(item.total)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="bg-muted/5 py-3 px-4 flex justify-between items-center border-t">
        <div className="text-sm">
          Tổng thu:{' '}
          <span className="text-lg font-bold text-primary">
            {formatPrice(order.grandTotal)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Xem chi tiết
          </Button>
          {order.status === 'PROCESSING' && (
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Chuẩn bị hàng
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
