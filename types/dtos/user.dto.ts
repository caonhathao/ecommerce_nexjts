export interface UpdateUserProfileRequestDTO {
  name?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  image?: string | null;
  emailForBill?: string | null;
}

export interface UserProfileResponseDTO {
  id: string;
  userId: string;
  phone: string | null;
  emailForBill: string | null;
  birthDate: string | null;
  gender: string | null;
  bio: string | null;
  name: string | null; // from User.name
  image: string | null; // from User.image
  createdAt: string;
  updatedAt: string;
}

/** Map Prisma rows -> Response DTO */
export function mapToUserProfileResponseDTO(
  profile: {
    id: string;
    userId: string;
    phone: string | null;
    emailForBill: string | null;
    birthDate: Date | null;
    gender: string | null;
    bio: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  user: { image: string | null; name: string | null } | null
): UserProfileResponseDTO {
  return {
    id: profile.id,
    userId: profile.userId,
    phone: profile.phone,
    emailForBill: profile.emailForBill,
    birthDate: profile.birthDate ? profile.birthDate.toISOString() : null,
    gender: profile.gender,
    bio: profile.bio,
    name: user?.name ?? null,
    image: user?.image ?? null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export function mapRequestToUserProfileData(req: UpdateUserProfileRequestDTO) {

  console.log('Mapping request to user profile data:', req);
  return {
    phone: req.phone ?? undefined,
    emailForBill: req.emailForBill ?? undefined,
    birthDate: req.birthDate ? new Date(req.birthDate) : undefined,
    gender: req.gender ?? undefined,
    bio: req.bio ?? undefined,
    // image is NOT here — it's on User, handled separately
  };
}
