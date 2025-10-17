export type Locale = (typeof locales)[number];

export const locales = ['en', 'vi', 'jp'] as const;
export const defaultLocale: Locale = 'vi';