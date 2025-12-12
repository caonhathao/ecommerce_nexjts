'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader, // CardAction không phải chuẩn shadcn, dùng div hoặc CardFooter
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { AddressDTO } from '@/types/dtos/address.dto';
import { Check, Loader2 } from 'lucide-react';
import { setAsDefault } from '@/app/actions/address';
import { toast } from 'sonner';
import { useTransition } from 'react';

interface AddressCardProps {
  address: AddressDTO;
  onSuccess?: () => void;
}

export function AddressCard({ address, onSuccess }: AddressCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      try {
        const res = await setAsDefault(id);
        if (res.success) {
          toast.success('Đã thay đổi địa chỉ mặc định');
          onSuccess?.();
        } else {
          toast.error('Thất bại: ' + res.message);
        }
      } catch (err) {
        toast.error('Lỗi kết nối');
      }
    });
  };

  return (
    <Card
      className={`w-full transition-all ${address.isDefault ? 'border-confirm bg-confirm/5' : ''}`}
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <span>{address.fullName}</span>
            <span className="text-muted-foreground font-normal text-sm">
              | {address.phone}
            </span>
          </div>

          {address.isDefault && (
            <div className="text-success text-sm font-medium flex gap-1 items-center bg-success/10 px-2 py-1 rounded-full">
              <Check className="w-4 h-4" />
              <span>Mặc định</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {address.line1}, {address.ward}, {address.district}, {address.city}
        </CardDescription>
      </CardHeader>
      {!address.isDefault && (
        <CardFooter className="pt-0 text-end">
          <Button
            variant="link"
            className="px-0 text-primary cursor-pointer"
            disabled={isPending}
            onClick={() => handleSetDefault(address.id)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đặt làm mặc định
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
