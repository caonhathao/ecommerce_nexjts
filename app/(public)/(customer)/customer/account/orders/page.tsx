'use client';

import { EmptyState } from '@/app/(public)/(customer)/customer/account/orders/_components/no-order-found';
import { ClipboardList } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { getOrder } from '@/app/actions/order';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { Loading } from '@/components/loading';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils';

export default function OrderPage() {
  const t = useTranslations('customer.orders');
  const c = useTranslations('general');
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
    <div className="p-6 w-full">
      {/* Header */}
      <div className="mb-8 flex w-fit items-center gap-4 px-6 py-4 bg-gradient-to-r from-primary/90 to-chart-2/90 rounded-2xl shadow-xl">
        <div className="p-3 bg-background/20 rounded-full backdrop-blur-sm">
          <ClipboardList className="w-7 h-7 text-background" />
        </div>
        <h2 className="text-xl font-semibold text-background drop-shadow">
          {t('title')}
        </h2>
      </div>

      {/* TABS */}
      <div className="flex w-full flex-col gap-6">
        <Tabs
          defaultValue="ALL"
          value={status}
          onValueChange={(val) => setStatus(val as any)}
        >
          <TabsList className="w-full overflow-x-auto flex-nowrap bg-muted/40 p-1 rounded-xl shadow-inner">
            <TabsTrigger
              value="ALL"
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.all')}
            </TabsTrigger>
            <TabsTrigger
              value={OrderStatus.AWAITING_PAYMENT}
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.awaiting_payment')}
            </TabsTrigger>
            <TabsTrigger
              value={OrderStatus.PROCESSING}
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.processing')}
            </TabsTrigger>
            <TabsTrigger
              value={OrderStatus.SHIPPED}
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.shipped')}
            </TabsTrigger>
            <TabsTrigger
              value={OrderStatus.DELIVERED}
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.delivered')}
            </TabsTrigger>
            <TabsTrigger
              value={OrderStatus.CANCELED}
              className="px-4 py-2 rounded-lg text-sm whitespace-nowrap"
            >
              {t('tabs.canceled')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={status} className="mt-6 w-full">
            {/* Loading */}
            {isPending ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loading />
                <p className="text-gray-500">{t('loading')}</p>
              </div>
            ) : data.orders.length > 0 ? (
              <ul className="space-y-4">
                {data.orders.map((o) => (
                  <Card className="w-full shadow-md" key={o.id}>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {t('card.order')}: {o.orderNumber}
                        </CardTitle>
                        <CardDescription className="text-sm text-chart-2 font-semibold">
                          {t('card.status')}: {o.status}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {o.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex gap-4 border-b pb-4 last:border-none"
                        >
                          <Image
                            src={item.product.images[0]?.url || '/no-image.png'}
                            alt="..."
                            width={80}
                            height={80}
                            className="rounded-md"
                          />
                          <div className="flex flex-col justify-start items-start flex-1 overflow-hidden text-base font-medium">
                            <span className="truncate">
                              {item.product.slug}
                            </span>
                            <span className="bg-muted-foreground/20 p-1 rounded-sm">
                              {item.title}
                            </span>
                          </div>
                          <div className="flex flex-col justify-start items-end min-w-[120px] text-right space-y-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('card.items')}:{' '}
                              <span className="font-semibold">
                                {item.quantity}
                              </span>
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(item.total, {
                                currency: c('t_currency'),
                                rate: Number(c('t_rate')),
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>

                    <CardFooter className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="border-2 border-secondary"
                      >
                        {t('buttons.return_refund')}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-s-secondary"
                      >
                        {t('buttons.write_review')}
                      </Button>
                      <Link href={`/customer/account/orders/${o.id}`}>
                        <Button
                          variant="outline"
                          className="border-2 border-primary"
                        >
                          {t('buttons.view_detail')}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </ul>
            ) : (
              <div className="py-16">
                <EmptyState
                  imageSrc="/empty-order.png"
                  title={t('empty_title')}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
