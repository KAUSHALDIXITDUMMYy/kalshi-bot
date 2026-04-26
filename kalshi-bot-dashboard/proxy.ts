import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /api/bot sub-paths
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/bot')) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Redirect from login to dashboard if already authenticated
  if (pathname === '/' || pathname === '/auth/login') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/dashboard/:path*', '/api/bot/:path*', '/', '/auth/login'],
};
