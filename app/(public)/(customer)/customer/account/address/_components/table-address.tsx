import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddressDTO } from '@/types/dtos/address.dto';
import { Check } from 'lucide-react';

export function AddressCard(order: AddressDTO) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex gap-4 items-center">
          {order.fullName} - {order.phone}
          {order.isDefault ? (
            <p className="text-muted-foreground text-sm font-normal flex gap-1 items-center">
              Mặc định
              <Check className="text-green-500 w-5 h-5" />
            </p>
          ) : null}
        </CardTitle>
        <CardDescription>
          {order.line1} - {order.ward} - {order.district} - {order.city}
        </CardDescription>
        <CardAction>
          <Button variant="link" disabled={order.isDefault}>
            Đặt làm mặc định
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  );
}
