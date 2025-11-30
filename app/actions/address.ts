'use server';

import { auth, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GetAddressResult } from '@/types/dtos/address.dto';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

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
      return { success: false, message: 'Unauthorized' };
    }

    const rawData = Object.fromEntries(formData.entries());
    if (!rawData.data)
      return { success: false, message: "Missing 'data' field", code: 400 };

    const data = JSON.parse(rawData.data as string);

    const phone =
      typeof data.phone === 'string' && data.phone.trim().length > 0
        ? data.phone.trim()
        : '';

    const addressCount = await prisma.address.count({
      where: { userId },
    });

    const isFirstAddress = addressCount === 0;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName: user?.name || 'Unknown',
        phone,
        line1: data.line1,
        ward: data.ward,
        district: data.district,
        city: data.city,
        country: data.country ?? 'Vietnam',
        isDefault: isFirstAddress,
      },
    });
    revalidatePath('/customer/account/address');

    return { success: true, data: newAddress, code: 200 };
  } catch (error) {
    return { success: false, message: 'Failed to create address' };
  }
}

export async function getAddress(): Promise<GetAddressResult> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const address = await prisma.address.findMany({
      where: { userId: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        line1: true,
        ward: true,
        district: true,
        city: true,
        country: true,
        isDefault: true,
      },
      orderBy: { isDefault: 'desc' },
    });

    return { success: true, addresses: address };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'An error occurred while getting address' + error,
    };
  }
}

export async function setAsDefault(addressId: string): Promise<ActionResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: userId },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId, userId: userId },
        data: { isDefault: true },
      });
    });

    revalidatePath('/customer/account/address');

    return { success: true, message: 'update successfully' };
  } catch (error) {
    return { success: false, message: 'Internal Server Error' };
  }
}
