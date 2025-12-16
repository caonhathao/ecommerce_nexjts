import {
  UpdateUserProfileRequestDTO,
  UserProfileResponseDTO,
} from '@/features/account/profile/profile.dto';
import { ApiResponse } from '@/types/api';
import {
  getUserProfileService,
  updateUserProfileService,
} from '@/features/account/profile/profile.service';
import { ResponseFactory } from '@/lib/api-response';
import { getCurrentUserId } from '@/lib/auth';

export async function getUserProfile(
  userId: string
): Promise<ApiResponse<UserProfileResponseDTO | null>> {
  try {
    const profile = await getUserProfileService(userId);
    if (!profile) {
      return ResponseFactory.error('Profile not found', 404);
    }
    return ResponseFactory.success(profile, 'Profile retrieved successfully');
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}

export async function updateUserProfile(req: UpdateUserProfileRequestDTO) {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return ResponseFactory.error('Unauthorized', 401);
    }

    const profile = await updateUserProfileService(currentUserId, req);
    return ResponseFactory.success(
      profile,
      'Profile updated successfully',
      200
    );
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}
