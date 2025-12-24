'use server';

import { getCurrentUserId } from '@/lib/auth';
import { AddressDTO } from '@/features/account/address/address.dto';
import { revalidatePath } from 'next/cache';
import { paths } from '@/lib/path';
import { ResponseFactory } from '@/lib/api-response';
import { AddressService } from '@/features/account/address/address.service';
import { ApiResponse, HttpStatus } from '@/types/api';

export async function createAddress(
  formData: FormData
): Promise<ApiResponse<AddressDTO>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ResponseFactory.error({
        message: 'Unauthorized',
        code: HttpStatus.UNAUTHORIZED,
      });
    }

    const rawData = Object.fromEntries(formData.entries());
    if (!rawData.data) {
      return ResponseFactory.error({
        message: "Missing 'data' field",
        code: HttpStatus.BAD_REQUEST,
      });
    }

    const data = JSON.parse(rawData.data as string);
    const newAddress = await AddressService.createAddress(userId, data);

    revalidatePath(paths.customer.account.address);

    return ResponseFactory.success({
      data: newAddress,
      message: 'Address created successfully',
      code: HttpStatus.CREATED,
    });
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}

export async function getAddress(): Promise<ApiResponse<AddressDTO[]>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return ResponseFactory.error({
        message: 'Unauthorized',
        code: HttpStatus.UNAUTHORIZED,
      });
    }

    const addresses = await AddressService.getAddress(userId);

    return ResponseFactory.success({
      data: addresses,
      message: 'Addresses retrieved successfully',
    });
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
      return ResponseFactory.error({
        message: 'Unauthorized',
        code: HttpStatus.UNAUTHORIZED,
      });
    }

    await AddressService.setAsDefault(userId, addressId);
    revalidatePath(paths.customer.account.address);

    return ResponseFactory.success({
      message: 'Address set as default successfully',
    });
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}
