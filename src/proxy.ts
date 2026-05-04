import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  
  if (isAdminPath) {
    const authCookie = request.cookies.get('admin_auth');
    const isAuthenticated = authCookie?.value === 'true';

    // If trying to access admin pages but not authenticated, redirect to login
    if (!isAuthenticated && !isLoginPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If trying to access login page but already authenticated, redirect to admin home
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL('/admin/hebergements', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
