import HeaderClient from '@/app/(public)/_components/header-client';
import { auth, getSessionUser } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function HeaderServer() {
  const session = await getSessionUser();
  // console.log(session);

  const user = session
    ? {
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        avatar_url: session.user.image ?? '',
        role: (session.user.role as 'USER' | 'SELLER' | 'ADMIN') ?? 'USER',
      }
    : null;

  return <HeaderClient user={user} />;
}
