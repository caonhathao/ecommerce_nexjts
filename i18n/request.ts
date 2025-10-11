import { getRequestConfig } from 'next-intl/server';
const DEFAULT_LOCALE = 'vi';

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale ?? DEFAULT_LOCALE;

  return {
    locale: currentLocale,
    messages: {
      // gộp nhiều namespace
      common: (await import(`../messages/${currentLocale}/common.json`)).default,
    },
  };
});
