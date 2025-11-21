import { getSessionUser } from '@/lib/auth';
import { LoginForm } from './_components/login-form';
import { redirect } from 'next/navigation';

type Props = {
  searchParams?: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const session = await getSessionUser();

  if (session?.user) {
    const params = await searchParams;
    const to = params?.callbackUrl ?? '/';
    redirect(to);
  }

  return <LoginForm />;
}
