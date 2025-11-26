import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

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
    seller: ['/seller'],
  };

  const userRole = session.user.role;

  for (const [requiredRole, paths] of Object.entries(roleProtectedPaths)) {
    if (paths.some((p) => pathname.startsWith(p))) {
      if (userRole !== requiredRole) {
        if (requiredRole == 'seller' && userRole == 'user') {
          return NextResponse.redirect(
            new URL('/signup-business', request.url)
          );
        }
        return NextResponse.rewrite(new URL('/403', request.url));
      }
    }
  }

  return NextResponse.next();
}

//   const isRestricted = Object.entries(roleProtectedPaths).find(
//     ([role, paths]) => paths.some((p) => pathname.startsWith(p)),
//   );
//
//   if (isRestricted) {
//     const [requiredRole, _] = isRestricted;
//     if (requiredRole === 'seller' && userRole === 'user') {
//       const url = new URL('/(signup-business)', request.url);
//       return NextResponse.redirect(url);
//     }
//
//     if (userRole === requiredRole) {
//       return NextResponse.next();
//     }
//
//     const url = new URL('/403', request.url);
//     return NextResponse.rewrite(url);
//   }
//
//   return NextResponse.next();
// }

export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!_next|.*\\..*|api/auth/callback|api|auth).*)'],
};
