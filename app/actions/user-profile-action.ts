'use server';

import { getCurrentUserId } from '@/lib/auth';
import { UpdateUserProfileRequestDTO } from '@/types/dtos/user.dto';
import { updateUserProfile } from '@/app/services/user.service';
import { revalidatePath } from 'next/cache';

export async function updateProfileAction(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const data: UpdateUserProfileRequestDTO = {
    name: formData.get('name') as string | null,
    phone: formData.get('phone') as string | null,
    birthDate: formData.get('birthDate') as string | null,
    gender: formData.get('gender') as string | null,
    bio: formData.get('bio') as string | null,
    image: formData.get('image') as string | null,
    emailForBill: formData.get('emailForBill') as string | null,
  };

  await updateUserProfile(userId, data);

  revalidatePath('/customer/account/edit');
}
