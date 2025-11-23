import { getSessionUser } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/auth/login',
    '/auth/verify-request',
    '/api/auth',
    '/products',
    '/api/products',
    '/api/stripe/webhook',
    '/search',
    '/shop',
    '/api/shop',
    '/',
  ];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/stripe/webhook')) {
    return NextResponse.next();
  }

  const session = await getSessionUser();
  if (!session) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  //check role
  const roleProtectedPaths = {
    admin: ['/manager'],
  };

  const userRole = session.user.role;

  const isRestricted = Object.entries(roleProtectedPaths).some(
    ([role, paths]) => paths.some((p) => pathname.startsWith(p + '/'))
  );

  if (isRestricted) {
    const allowedRole = Object.entries(roleProtectedPaths).find(([_, paths]) =>
      paths.some((p) => pathname.startsWith(p + '/'))
    )?.[0];

    if (allowedRole && userRole !== allowedRole) {
      const url = new URL('/403', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next|.*\\..*|api/auth/callback|api|auth).*)'],
};
