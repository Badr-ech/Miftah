import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Using path alias as configured in tsconfig.json - import kept for reference
// @ts-expect-error - Ignoring path resolution issue with middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getServerUser } from 'lib/server-auth';

// This is a simplified middleware. A real app would use a robust session management library.
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public pages like login, home, etc.
  const publicPaths = ['/login', '/logout', '/'];
  if (publicPaths.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) { // Exclude static files
    return NextResponse.next();
  }
  
  // For this mock, we can't directly use the client-side `getCurrentUser` or localStorage.
  // We'd typically check a session cookie here.
  // Let's simulate this by using a header or a simplified check if possible,
  // or assume that if not public, it requires auth.
  // `getServerUser` is a placeholder for a server-side compatible auth check.
  
  // A more robust check would be:
  // const session = await getIronSession(request, sessionOptions); // Example using iron-session
  // if (!session.user) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  
  // Simplified check for demo:
  // If there's no specific "public" route, assume auth is required.
  // This part is highly dependent on how auth is truly implemented.
  // For now, we'll assume `getServerUser` can be called, understanding it's a mock.
  // In a real app, this would be an actual server-side session check.

  // The current `getServerUser` is a mock that depends on a global variable.
  // This is NOT suitable for production but serves the demo.
  // A real middleware would parse a secure, httpOnly cookie.
  
  // For the purpose of this scaffold, let's assume if they are trying to access /dashboard or /courses/* etc.
  // they should be "logged in". We can't truly check without a proper session mechanism.  // So, we'll allow access and let the page components handle the user state.
  // This is not ideal but necessary given the limitations of the mock auth.
  // Skip authentication checks in production build for static routes
  // This helps avoid 'Dynamic server usage' errors during build
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }  // For production deployments, check for cookies before redirecting
  const userRole = request.cookies.get('userRole');
  const userId = request.cookies.get('userId');
  
  // Log for debugging
  console.log(`[Middleware] Path: ${pathname}, UserRole: ${userRole?.value}, UserId: ${userId?.value}`);
  
  // Special handling for routes that need auth
  const protectedRoutes = [
    '/dashboard',
    '/progress',
    '/study-plan',
    '/teacher',
    '/admin',
    '/courses'
  ];
  
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route));
  
  // If the URL path is under protected routes and no authentication cookies exist
  if (needsAuth && (!userRole?.value && !userId?.value)) {
    // For the demo, redirect to login page
    console.log(`[Middleware] No auth cookies found for protected path ${pathname}, redirecting to /login`);
    
    // Clone the URL to avoid mutating the original
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Store original destination
    
    return NextResponse.redirect(loginUrl);
  }
  
  // Continue with the request but ensure it passes through our modified headers
  const response = NextResponse.next();
  
  // Add Secure attribute for cookies in production
  if (process.env.NODE_ENV === 'production') {
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || undefined;
    
    console.log(`[Middleware] Production environment detected, using domain: ${domain || 'default'}`);
    
    // Modify headers to help with CORS and cookie issues
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    
    // If we have cookies, update them to ensure they're properly set
    if (userId?.value) {
      response.cookies.set({
        name: 'userId',
        value: userId.value,
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
        domain: domain
      });
    }
    
    if (userRole?.value) {
      response.cookies.set({
        name: 'userRole',
        value: userRole.value,
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: true,
        domain: domain
      });
    }
  }


  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// We're also adding dynamic route handling in page files
