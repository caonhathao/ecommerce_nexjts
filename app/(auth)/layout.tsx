import { ModeToogle } from '@/components/custom/mode-toogle';
import { SelectLanguage } from '@/components/custom/select-language';
import { buttonVariants } from '@/components/ui/button';
import { env } from '@/lib/env';
import Logo from '@/public/logo.jpg';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('auth_layout');
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href={'/'}
        className={buttonVariants({
          variant: 'outline',
          className: 'absolute top-4 left-4',
        })}
      >
        <ArrowLeft className="size-4" />
        {t('t_back_action')}
      </Link>
      <div className="flex flex-row gap-3 absolute top-4 right-4">
        <SelectLanguage />
        <ModeToogle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href={'/'}
        >
          <Image
            src={Logo}
            alt="Logo"
            width={100}
            height={100}
            className="bg-background p-1 rounded-xl"
          />
          {env.NEXT_PUBLIC_WEB_NAME}
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          {t('t_accepct_1')}{' '}
          <Link
            className="hover:text-primary hover:underline"
            href={'/term-of-service'}
          >
            {t('t_term_of_service')}
          </Link>{' '}
          {t('t_and')}{' '}
          <Link
            className="hover:text-primary hover:underline"
            href={'/privacy-policy'}
          >
            {t('t_policy')}
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
