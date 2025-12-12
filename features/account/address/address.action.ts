'use server';

import { getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  AddressDTO,
  GetAddressResult,
} from '@/features/account/address/address.dto';
import { revalidatePath } from 'next/cache';
import { paths } from '@/lib/path';
import { ResponseFactory } from '@/lib/api-response';
import { AddressService } from '@/features/account/address/address.service';
import { ApiResponse } from '@/types/api';

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
  code?: number;
};

export async function createAddress(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ResponseFactory.error('Unauthorized', 401);
    }

    const rawData = Object.fromEntries(formData.entries());
    if (!rawData.data) {
      return ResponseFactory.error("Missing 'data' field", 400);
    }

    const data = JSON.parse(rawData.data as string);
    const newAddress = await AddressService.createAddress(userId, data);

    revalidatePath(paths.customer.account.address);

    return ResponseFactory.success(
      newAddress,
      'Address created successfully',
      201
    );
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}

export async function getAddress(): Promise<ApiResponse<AddressDTO[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ResponseFactory.error('Unauthorized', 401);
    }

    const addresses = await AddressService.getAddress(userId);
    return ResponseFactory.success(
      addresses,
      'Addresses retrieved successfully'
    );
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}

export async function setAsDefault(
  addressId: string
): Promise<ApiResponse<null>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ResponseFactory.error('Unauthorized', 401);
    }

    await AddressService.setAsDefault(userId, addressId);
    revalidatePath(paths.customer.account.address);

    return ResponseFactory.success(null, 'Address set as default successfully');
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}
