'use server';

import { auth, getCurrentUserId } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GetAddressResult } from '@/types/dtos/address.dto';
import { headers } from 'next/headers';

export async function createAddress(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const rawData = Object.fromEntries(formData.entries());
  if (!rawData.data) throw new Error("Missing 'data' field in FormData");

  const data = JSON.parse(rawData.data as string);

  const phone =
    typeof data.phone === 'string' && data.phone.trim().length > 0
      ? data.phone.trim()
      : '';

  const address = await prisma.address.create({
    data: {
      userId,
      fullName: session.user.name,
      phone,
      line1: data.line1,
      ward: data.ward,
      district: data.district,
      city: data.city,
      country: data.country ?? 'Vietnam',
      isDefault: true,
    },
  });

  return address;
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
