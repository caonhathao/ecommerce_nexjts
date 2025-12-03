'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { OrderDTO } from '@/types/dtos/order.dto';
import { formatPrice, formatTime } from '@/lib/utils';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { SellerOrderDetails } from '@/app/(seller)/seller/orders/_components/order-details';
import { useTranslations } from 'next-intl';
import { UpdateOrderStatus } from '@/app/(seller)/seller/orders/_components/update-order-status';

const statusColor: Record<string, string> = {
  AWAITING_PAYMENT: 'bg-primary/15 text-primary border-primary border-2',
  PROCESSING: 'bg-warning/15 text-warning border-warning border-2',
  SHIPPED: 'bg-info/15 text-info border-info border-2',
  DELIVERED: 'bg-success/15 text-success border-success border-2',
  CANCELED: 'bg-destructive/15 text-destructive border-destructive border-2',
};

export const columns = (
  t: ReturnType<typeof useTranslations>,
  onUpdateSuccess: () => void
): ColumnDef<OrderDTO>[] => [
  {
    accessorKey: 'orderNumber',
    header: 'Order',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s: OrderStatus = row.getValue('status');
      return (
        <div className={`font-medium ${statusColor[s]} w-fit p-1 rounded-lg`}>
          {s}
        </div>
      );
    },
  },
  {
    accessorKey: 'grandTotal',
    header: 'Amount',
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {formatPrice(row.getValue('grandTotal') as number)}
        </div>
      );
    },
  },
  {
    accessorKey: 'placedAt',
    header: 'Date',
    cell: ({ row }) => {
      return (
        <div className="font-normal">
          {formatTime(row.getValue('placedAt') as string)}
        </div>
      );
    },
  },
  {
    header: 'actions',
    id: 'actions',
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <SellerOrderDetails
                key={row.getValue('orderNumber')}
                item={row.original}
                t={t}
              />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <UpdateOrderStatus
                key={row.getValue('orderNumber')}
                item={row.original}
                t={t}
                onUpdateSuccess={onUpdateSuccess}
              />
            </DropdownMenuItem>
            <DropdownMenuItem>Refund</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
