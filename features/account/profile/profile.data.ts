import {
  UpdateUserProfileRequestDTO,
  UserProfileResponseDTO,
} from '@/features/account/profile/profile.dto';
import { ApiResponse, HttpStatus } from '@/types/api';
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
      return ResponseFactory.error({
        message: 'Profile not found',
        code: HttpStatus.NOT_FOUND,
      });
    }
    return ResponseFactory.success({
      data: profile,
      message: 'Profile retrieved successfully',
    });
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}

export async function updateUserProfile(
  req: UpdateUserProfileRequestDTO
): Promise<ApiResponse<UserProfileResponseDTO>> {
  try {
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return ResponseFactory.error({
        message: 'Unauthorized',
        code: HttpStatus.UNAUTHORIZED,
      });
    }

    const profile = await updateUserProfileService(currentUserId, req);
    return ResponseFactory.success({
      data: profile,
      message: 'Profile updated successfully',
      code: HttpStatus.OK,
    });
  } catch (error) {
    return ResponseFactory.handleError(error);
  }
}
