import { getCurrentUserId } from '@/lib/auth';
import { getUserProfile } from '@/features/account/profile/profile.data';
import EditUserProfileForm from '@/features/account/components/edit-user-profile-form';

export default async function AccountPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const res = await getUserProfile(userId);
  const profile = res.success ? res.data : null;

  // console.log('Fetched profile:', profile);

  const defaultValues = profile ?? {
    id: 'temp',
    userId,
    name: null,
    phone: null,
    birthDate: null,
    gender: null,
    bio: null,
    image: null,
    emailForBill: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <EditUserProfileForm defaultValues={defaultValues} />
    </div>
  );
}
