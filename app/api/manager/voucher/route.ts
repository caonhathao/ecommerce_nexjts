import { NextRequest } from 'next/server';
import { ActionResponse } from '@/lib/service-response';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getAdminVouchersService } from '@/features/voucher/voucher.service';
import { $Enums } from '@/lib/generated/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session || session.user.role !== 'admin') {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unathorized', 401)
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;
    const search = searchParams.get('search') || undefined;
    const isActive = searchParams.has('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined;
    const type = searchParams.get('type') || undefined;

    const result = await getAdminVouchersService({
      page,
      limit,
      search,
      isActive,
      type,
    });

    return ActionResponse.toNextResponse(ActionResponse.success(result));
  } catch (error: any) {
    return ActionResponse.toNextResponse(ActionResponse.error(error));
  }
}
