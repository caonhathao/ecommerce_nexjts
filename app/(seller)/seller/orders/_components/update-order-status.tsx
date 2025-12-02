import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { OrderDTO } from '@/types/dtos/order.dto';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  StatusUpdateForm,
  statusUpdateSchema,
} from '@/app/(seller)/seller/orders/_components/order-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { fetchApi } from '@/lib/client-fetch';
import { toast } from 'sonner';
import { FormField } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AVAILABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELED,
];

export function UpdateOrderStatus({
  item,
  t,
  onUpdateSuccess,
}: {
  item: OrderDTO;
  t: ReturnType<typeof useTranslations>;
  onUpdateSuccess: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  const form = useForm<StatusUpdateForm>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: { newStatus: item.status },
  });
  const { isSubmitting } = form.formState;

  const onSubmit = async (data: StatusUpdateForm) => {
    const payload = {
      orderId: item.id,
      status: data.newStatus,
    };

    try {
      const res = await fetchApi(`/api/seller/orders/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        toast.success(t('order_update.actions.update_success'), {
          position: 'top-right',
          duration: 2000,
        });
        setOpen(false);
        onUpdateSuccess();
      } else {
        throw new Error(res.message || 'Cập nhật thất bại');
      }
    } catch (error: any) {
      toast.error(error.message || t('order_update.actions.update_failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <p className="text-text cursor-pointer">
          {t('order_update.actions.change_status')}
        </p>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {t('order_update.dialog.title')}
              <p className="text-text mt-3">Mã đơn: {item.orderNumber}</p>
            </DialogTitle>
            <DialogDescription>
              {t('order_update.dialog.current_status')}: {item.status}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="newStatus">
                {t('order_update.dialog.select_new_status')}
              </Label>
              <FormField
                control={form.control}
                name="newStatus"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'order_update.dialog.select_placeholder'
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {t(`order_update.status.${s.toLowerCase()}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                disabled={isSubmitting}
                className="cursor-pointer"
              >
                {t('order_update.actions.cancel')}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting
                ? t('order_update.actions.saving')
                : t('order_update.actions.save_changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
