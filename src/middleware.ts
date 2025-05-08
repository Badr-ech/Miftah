import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerUser } from '@/lib/server-auth'; // Updated import to use server-auth

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
  // they should be "logged in". We can't truly check without a proper session mechanism.
  // So, we'll allow access and let the page components handle the user state.
  // This is not ideal but necessary given the limitations of the mock auth.

  // If you want to enforce redirection:
  // const user = await getServerUser(); // This is a mock, remember.
  // if (!user && !publicPaths.includes(pathname)) {
  //    console.log(`Middleware: No user found for ${pathname}, redirecting to /login`);
  //    return NextResponse.redirect(new URL('/login?redirectedFrom=${pathname}', request.url));
  // }


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
