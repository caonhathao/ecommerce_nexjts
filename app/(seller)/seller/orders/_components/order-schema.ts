import { z } from 'zod';
import { $Enums } from '@/lib/generated/prisma';
import OrderStatus = $Enums.OrderStatus;

export const statusUpdateSchema = z.object({
  newStatus: z.nativeEnum(OrderStatus, {
    message: 'Vui lòng chọn trạng thái mới.',
  }),
});

export type StatusUpdateForm = z.infer<typeof statusUpdateSchema>;
