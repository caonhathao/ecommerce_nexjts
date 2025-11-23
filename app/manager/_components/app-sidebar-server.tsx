import { getSessionUser } from '@/lib/auth';
import { AppSidebar } from './app-sidebar';

export default async function AppSidebarServer() {
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

  return <AppSidebar user={user} variant="inset" />;
}
