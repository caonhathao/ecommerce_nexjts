import { NextRequest } from 'next/server';
import { ActionResponse } from '@/lib/service-response';
import {
  createVoucherService,
  getAvailableVouchersService,
} from '@/features/voucher/voucher.service';
import { getCurrentUserId } from '@/lib/auth';
import { createVoucherSchema } from '@/lib/validation/voucher';
import { prisma } from '@/lib/db';
import { $Enums } from '@/lib/generated/prisma';
import Role = $Enums.Role;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');

    if (!shopId) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Missing shopId parameter', 400)
      );
    }

    const vouchers = await getAvailableVouchersService(
      shopId,
      productId || undefined
    );

    return ActionResponse.toNextResponse(ActionResponse.success(vouchers));
  } catch (error: any) {
    console.error('API Error fetching vouchers:', error);
    return ActionResponse.toNextResponse(
      ActionResponse.error(error.message || 'Internal Server Error', 500)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return ActionResponse.toNextResponse(
        ActionResponse.error('Unauthorized', 401)
      );
    }
    //console.log('--- [DEBUG] 1. UserId:', userId);

    const rawData = await req.json().catch(() => ({}));

    //console.log('--- [DEBUG] 2. Raw Body:', JSON.stringify(rawData, null, 2));

    const validation = createVoucherSchema.safeParse(rawData);
    if (!validation.success) {
      // console.log(
      //   '--- [DEBUG] 3. Zod Error Detail:',
      //   JSON.stringify(validation.error.format(), null, 2)
      // );
      return ActionResponse.toNextResponse(
        ActionResponse.error('validation data', 400, {
          errors: validation.error.issues.map((issue) => issue.message),
        })
      );
    }

    const data = validation.data;

    //console.log('--- [DEBUG] 4. Validated Data:', data);

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    //console.log('--- [DEBUG] 5. User Role:', currentUser?.role);

    if (currentUser!.role === Role.seller) {
      if (!data.productIds || data.productIds.length === 0) {
        //console.log('--- [DEBUG] 6. Seller Error: No Products');
        return ActionResponse.error('validation role', 401, {
          errors: {
            message:
              'Voucher của Shop bắt buộc phải áp dụng cho ít nhất 1 sản phẩm.',
            path: ['productIds'],
          },
        });
      }
      if (data.categoryIds && data.categoryIds!.length > 0) {
        data.categoryIds = undefined;
      }
    } else if (currentUser!.role === Role.admin) {
      if (!data.shopId) {
        data.shopId = null;
      }
    }

    const result = await createVoucherService(data);

    return ActionResponse.toNextResponse(
      ActionResponse.success(result, 'successful', 200)
    );
  } catch (error: any) {
    // console.error('--- [DEBUG] 7. CATCH ERROR:', error);
    return ActionResponse.toNextResponse(ActionResponse.error(error));
  }
}
