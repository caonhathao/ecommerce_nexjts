import { prisma } from '@/lib/db';
import {
  AddressDTO,
  AddressRequestDTO,
} from '@/features/account/address/address.dto';
import { ServiceError } from '@/lib/service-error';

export class AddressService {
  static async createAddress(
    userId: string,
    data: AddressRequestDTO
  ): Promise<AddressDTO> {
    if (!userId) {
      throw new ServiceError('Unauthorized', 401);
    }

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

    return newAddress;
  }

  static async getAddress(userId: string): Promise<AddressDTO[]> {
    if (!userId) {
      throw new ServiceError('Unauthorized', 401);
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
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

    return addresses;
  }

  static async setAsDefault(userId: string, addressId: string): Promise<void> {
    if (!userId) {
      throw new ServiceError('Unauthorized', 401);
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId, userId },
        data: { isDefault: true },
      });
    });
  }
}
