import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/business'];

// Routes that require admin authentication
const adminRoutes = ['/admin/dashboard', '/admin/businesses'];

// Public routes (redirect to dashboard if already authenticated)
const publicOnlyRoutes = ['/login', '/signup', '/'];

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get tokens from cookies
    const userToken = request.cookies.get('mm_token')?.value;
    const adminToken = request.cookies.get('mm_admin_token')?.value;

    // Check if route is protected (requires user auth)
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if route is admin protected
    const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Check if route is public-only (login, signup)
    const isPublicOnlyRoute = publicOnlyRoutes.some((route) =>
        pathname === route
    );

    // Admin route protection
    if (isAdminRoute && !adminToken) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Protected route protection
    if (isProtectedRoute && !userToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from login/signup pages
    // Redirect authenticated users away from login/signup pages
    if (isPublicOnlyRoute) {
        // If admin is logged in, redirect to admin dashboard
        if (adminToken) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

        // If user is logged in, redirect to business dashboard
        if (userToken) {
            // Try to get businessId from cookie or redirect to home
            const businessId = request.cookies.get('mm_business_id')?.value;
            if (businessId) {
                return NextResponse.redirect(new URL(`/dashboard/${businessId}`, request.url));
            }
            // If no businessId, let them continue to signup to create one
        }
    }

    // Allow admin login page for unauthenticated admins
    if (pathname === '/admin/login' && adminToken) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - splash (public captive portal pages)
         * - public assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|splash|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)',
    ],
};
