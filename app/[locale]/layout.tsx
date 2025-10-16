import {NextIntlClientProvider} from "next-intl";
import {notFound} from "next/navigation";
import React from "react";
import Header from "@/components/layout/Header";

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;

    let messages;
    try {
        messages = (await import(`../../messages/${locale}/common.json`)).default;
    } catch {
        notFound();
    }

    return (
        <div>
            <NextIntlClientProvider locale={locale} messages={messages}>
                <div className="w-full h-screen">
                    <div className="[--header-height:calc(--spacing(14))]">
                        <Header/>
                        {children}
                    </div>
                </div>
            </NextIntlClientProvider>
        </div>
    );
}
