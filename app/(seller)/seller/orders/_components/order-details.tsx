'use client';

import * as React from 'react';
import { DollarSign, MapPin, Minus, Package, Plus } from 'lucide-react';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { OrderDTO } from '@/types/dtos/order.dto';
import { useTranslations } from 'next-intl';
import { JSX } from 'react';
import { formatPrice } from '@/app/(public)/_components/global-function';
import { formatTime } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function SellerOrderDetails({
  item,
  t,
}: {
  item: OrderDTO;
  t: ReturnType<typeof useTranslations>;
}) {
  console.log(item);
  const shippingAddress = item.shippingAddress as any;
  return (
    <Drawer direction="left">
      <DrawerTrigger asChild>
        <p className="cursor-pointer text-text">ViewDetails</p>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-2xl max-w-[90vw] h-full">
        <div className="flex flex-col h-full bg-background rounded-t-xl overflow-hidden">
          <DrawerHeader className="p-4 border-b border-border bg-muted/50">
            <DrawerTitle className="text-xl font-bold">
              {t('details.title')} #{item.orderNumber}
            </DrawerTitle>
            <DrawerDescription>
              {t('details.placed_at')}: {formatTime(item.placedAt)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* === 1. Tóm tắt Đơn hàng === */}
            <section className="p-4 bg-card rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
                <Package className="w-5 h-5" />
                {t('sections.summary')}
              </h3>
              <DetailItem label={t('labels.status')} value={item.status} />
              <DetailItem
                label={t('labels.total_items')}
                value={item.items.length}
              />
              <DetailItem
                label={t('labels.order_placed')}
                value={formatTime(item.placedAt)}
              />
            </section>

            <section className="p-4 bg-card rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-4 text-foreground flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t('sections.items')}
              </h3>
              <div className="space-y-4">
                {item.items.map((orderItem) => (
                  <div
                    key={orderItem.id}
                    className="flex gap-3 pb-3 border-b border-muted"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted">
                      <Image
                        src={
                          orderItem.productVariant?.image ||
                          orderItem.product?.images[0].url
                        }
                        alt={'...'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {orderItem.product.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        SL: {orderItem.quantity}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{t('labels.item_total')}</p>
                      <p className="font-semibold text-primary">
                        {formatPrice(orderItem.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="p-4 bg-card rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
                <MapPin className="w-5 h-5" />
                {t('sections.shipping')}
              </h3>
              <DetailItem
                label={t('labels.recipient')}
                value={shippingAddress.name || item.contactEmail}
              />
              <DetailItem
                label={t('labels.phone')}
                value={item.contactPhone || 'N/A'}
              />
              <DetailItem
                label={t('labels.address')}
                value={shippingAddress.address || t('labels.not_specified')}
              />
            </section>

            <section className="p-4 bg-card rounded-xl shadow-sm border">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-primary">
                <DollarSign className="w-5 h-5" />
                {t('sections.pricing')}
              </h3>
              <DetailItem
                label={t('labels.subtotal')}
                value={formatPrice(item.itemsTotal)}
              />
              <DetailItem
                label={t('labels.shipping_fee')}
                value={formatPrice(item.shippingFee)}
              />
              <DetailItem
                label={t('labels.discount')}
                value={
                  <span className="text-destructive">
                    -{formatPrice(item.discountTotal)}
                  </span>
                }
              />
              <Separator className="my-2" />
              <DetailItem
                label={t('labels.grand_total')}
                value={
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(item.grandTotal)}
                  </span>
                }
              />
            </section>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number | JSX.Element;
  icon?: React.ReactNode;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value, icon }) => (
  <div className="flex justify-between items-start py-2 border-b border-muted last:border-b-0">
    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
      {icon}
      {label}
    </div>
    <div className="text-sm font-semibold text-foreground text-right">
      {value}
    </div>
  </div>
);
