'use server';

import { CreateAddressResult, GetAddressResult } from '@/types/dtos/address.dto';
import { auth, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { headers } from 'next/headers';

export async function createAddress(formData: FormData): Promise<CreateAddressResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if(!session) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = session.user.id;
    const userName = session.user.name;
    const userPhone = await prisma.userProfile.findUnique({
      where: { userId: userId},
      select: {
        phone: true,
      }
    })
    if (!userPhone || !userPhone.phone) {
      return { success: false, error: 'Vui lòng cập nhật số điện thoại trước khi thêm địa chỉ.' };
    }

    const rawData = Object.fromEntries(formData.entries());
    if(!rawData.data) return { success: false, error: "Missing 'data' field in FormData" };

    const parseData = JSON.parse(rawData.data as string);

    await prisma.address.updateMany({
      where: { userId: userId, isDefault: true },
      data: { isDefault: false }
    });

    const address = await prisma.address.create({
      data: {
        userId: userId,
        fullName: userName,
        phone: userPhone?.phone!,
        line1: parseData.line1,
        ward: parseData.ward,
        district: parseData.district,
        city: parseData.city,
        isDefault: true,
      }
    })

    return { success: true, address: address };
  } catch (error) {
    return { success: false, error: 'An error occurred while creating the address' };
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
      }
    });

    return { success: true, addresses: address };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An error occurred while getting address' + error };
  }
}