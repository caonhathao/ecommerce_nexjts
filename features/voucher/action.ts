'use server';

import { requireRole, requireSeller } from '@/lib/require-role';
import { ActionResponse } from '@/lib/service-response';
import { ServiceResponse } from '@/types/api-response';
import { disableVoucherService } from '@/features/voucher/voucher.service';

export const disableVoucherAction = async (
  voucherId: string
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    // Get the usr session
    const session = await requireSeller();

    if (!session?.user?.id) {
      return ActionResponse.error('Unauthorized', 401);
    }

    const result = await disableVoucherService(
      voucherId,
      session.user.id,
      false
    );

    return ActionResponse.success(result, 'Voucher disabled successfully');
  } catch (error: any) {
    console.error('Error disabling voucher:', error);

    if (error.message === 'Voucher not found') {
      return ActionResponse.error(error.message, 404);
    }

    if (error.message.includes('permission')) {
      return ActionResponse.error(error.message, 403);
    }

    return ActionResponse.error('Failed to disable voucher', 500);
  }
};

export const disableVoucherByAdminAction = async (
  voucherId: string
): Promise<ServiceResponse<{ success: boolean }>> => {
  try {
    const session = await requireRole();

    if (!session?.user?.id) {
      return ActionResponse.error('Unauthorized', 401);
    }

    const result = await disableVoucherService(
      voucherId,
      session.user.id,
      true
    );

    return ActionResponse.success(result, 'Voucher disabled successfully');
  } catch (error: any) {
    console.error('Error disabling voucher by admin:', error);

    if (error.message === 'Voucher not found') {
      return ActionResponse.error(error.message, 404);
    }

    if (error.message.includes('permission')) {
      return ActionResponse.error(error.message, 403);
    }

    return ActionResponse.error('Failed to disable voucher', 500);
  }
};
