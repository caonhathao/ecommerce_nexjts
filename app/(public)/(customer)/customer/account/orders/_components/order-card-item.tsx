'use client';

import { OrderDTO, OrderItemsDTO } from '@/types/dtos/order.dto';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DialogReview } from '@/app/(public)/(customer)/customer/account/orders/_components/dialogReview';
import Link from 'next/link';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export function OrderCardItem({ o, t }: { o: OrderDTO; t: any }) {
  const uniqueItemsForReview = o.items.reduce((acc: any[], current: any) => {
    const isExist = acc.find((item) => item.product.id === current.product.id);
    if (!isExist) return acc.concat([current]);
    return acc;
  }, []);

  return (
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
              <span className="truncate">{item.product.slug}</span>
              <span className="bg-muted-foreground/20 p-1 rounded-sm">
                {item.title}
              </span>
            </div>
            <div className="flex flex-col justify-start items-end min-w-[120px] text-right space-y-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('card.items')}:{' '}
                <span className="font-semibold">{item.quantity}</span>
              </p>
              <p className="text-sm font-semibold text-primary">
                {formatPrice(item.total)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex gap-2 justify-end">
        <Button variant="outline" className="border-2 border-secondary">
          {t('buttons.return_refund')}
        </Button>
        {uniqueItemsForReview.map(
          (item: OrderItemsDTO) =>
            o.status === OrderStatus.DELIVERED && (
              <DialogReview key={item.id} item={item} t={t} />
            )
        )}
        <Link href={`/customer/account/orders/${o.id}`}>
          <Button variant="outline" className="border-2 border-primary">
            {t('buttons.view_detail')}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
