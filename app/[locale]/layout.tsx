import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import React from 'react';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let messages;
  try {
    messages = (await import(`../../messages/${locale}/common.json`)).default;
  } catch {
    notFound();
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start">
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  );
}
