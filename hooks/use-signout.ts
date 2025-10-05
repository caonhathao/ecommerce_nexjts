'use client';

import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useSignOut() {
  const router = useRouter();

  const handleSignOut = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          toast.success('Signed out Successfully');
        },
        onError: () => {
          toast.error('Failed to sign out');
        },
      },
    });
  };

  return handleSignOut;
}
