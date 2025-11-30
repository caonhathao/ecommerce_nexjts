import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BusinessClient from '@/app/(public)/signup-business/_components/BusinessClient';
import { getUserProfile } from '@/app/data/user.data';
import { paths } from '@/lib/path';

export default async function SignupBusinessPage() {
  const session = await getSessionUser();
  if (!session || !session.user) {
    redirect(`${paths.login}?callbackUrl=/signup-business`);
  }

  if (session.user.role === 'seller') {
    redirect('/seller');
  }
  const user = await getUserProfile(session.user.id);
  return <BusinessClient user={user} />;
}
