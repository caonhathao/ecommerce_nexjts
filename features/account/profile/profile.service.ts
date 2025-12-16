import { prisma } from '@/lib/db';
import {
  mapRequestToUserProfileData,
  mapToUserProfileResponseDTO,
  UpdateUserProfileRequestDTO,
  UserProfileResponseDTO,
} from '@/features/account/profile/profile.dto';
import { ServiceError } from '@/lib/service-error';

export const getUserProfileService = async (
  userId: string
): Promise<UserProfileResponseDTO | null> => {
  const [profile, user] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
      select: userProfileSelect,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    }),
  ]);

  if (!profile || !user) {
    throw new ServiceError(
      "User profile doesn't exist. Please register first."
    );
  }

  return mapToUserProfileResponseDTO(profile, user);
};

export const updateUserProfileService = async (
  userId: string,
  req: UpdateUserProfileRequestDTO
): Promise<UserProfileResponseDTO> => {
  const result = await prisma.$transaction(async (tx) => {
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: mapRequestToUserProfileData(req),
      create: { userId, ...mapRequestToUserProfileData(req) },
      select: userProfileSelect,
    });

    // console.log(
    //   'Request to update user profile:',
    //   req,
    //   'Updated profile:',
    //   profile
    // );

    if (req.image !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: { image: req.image },
        select: { id: true },
      });
    }

    if (req.name !== undefined && req.name !== null) {
      await tx.user.update({
        where: { id: userId },
        data: { name: req.name },
        select: { id: true },
      });
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    return { profile, user };
  });

  return mapToUserProfileResponseDTO(result.profile, result.user);
};

const userProfileSelect = {
  id: true,
  userId: true,
  phone: true,
  emailForBill: true,
  birthDate: true,
  gender: true,
  bio: true,
  createdAt: true,
  updatedAt: true,
} as const;

const userSelect = {
  name: true,
  image: true,
} as const;
