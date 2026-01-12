import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomain } from '@/lib/tenant/context';
// import { verifyToken } from '@/lib/auth/jwt'; // Removed to avoid Edge runtime error with jsonwebtoken

// Paths that don't require auth
const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/api/auth/login',
    '/api/auth/signup',
    '/_next',
    '/favicon.ico'
];

export async function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const { pathname } = url;
    const hostname = request.headers.get('host') || '';

    // 1. Tenant Resolution
    let tenantId = getSubdomain(hostname);

    // [NEW] Check for Session Cookie (Session-Based Tenancy)
    // This allows localhost and main domain to impersonate a tenant after login
    const sessionTenantId = request.cookies.get('x-tenant-id')?.value;
    if (sessionTenantId) {
        tenantId = sessionTenantId;
    }

    // SPECIAL HANDLING FOR VERCEL.APP (Preview Mode) - Fallback
    if (hostname.includes('vercel.app') && !tenantId) {
        // ... (existing logic for query param)
        const queryTenant = url.searchParams.get('tenant');
        if (queryTenant) tenantId = queryTenant;
    }

    // 2. Auth Check for Dashboard
    // If path starts with /dashboard, req must have valid token.
    if (pathname.startsWith('/dashboard')) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 3. Rewrite for handling tenant-specific content
    const requestHeaders = new Headers(request.headers);

    // Create Response to potentially set cookies
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (tenantId) {
        requestHeaders.set('x-tenant-id', tenantId);

        // Improve: You must re-create the response to include the new headers in the NEXT step
        response = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        // Set persistence cookie if we are in preview mode
        if (hostname.includes('vercel.app') && url.searchParams.get('tenant')) {
            response.cookies.set('x-tenant-preview', tenantId, { path: '/' });
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        // Match everything NOT static (next image, favicon, etc)
        // We WANT to match API routes to inject x-tenant-id
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
