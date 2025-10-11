import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'vi', 'jp'],
  defaultLocale: 'vi',
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
