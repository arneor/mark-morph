import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const adminToken = request.cookies.get('mm_admin_token')?.value;
    const isLoginPage = request.nextUrl.pathname === '/login';
    const isProtectedRoute = !isLoginPage &&
        !request.nextUrl.pathname.startsWith('/_next') &&
        !request.nextUrl.pathname.startsWith('/api') &&
        !request.nextUrl.pathname.includes('favicon');

    // Redirect unauthenticated admin users to login
    if (isProtectedRoute && !adminToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect authenticated admins away from login page
    if (isLoginPage && adminToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
