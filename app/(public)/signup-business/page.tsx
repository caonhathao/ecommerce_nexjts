// app/signup-business/page.tsx
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BusinessClient from './components/BusinessClient';

export default async function SignupBusinessPage() {
  const session = await getSessionUser();
  if (!session || !session.user) {
    redirect('/auth/login?next=/signup-business');
  }

  if (session.user.role === 'seller') {
    redirect('/seller');
  }

  return <BusinessClient userId={session.user.id} />;
}
