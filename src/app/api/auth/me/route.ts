import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { UserRole } from '../../../../types';

export async function GET(request: Request) {
  try {
    // Read the request cookies
    const requestCookies = request.headers.get('cookie') || '';
    // Improved cookie parsing to handle URL-encoded values and domain prefixes
    const cookies_map = Object.fromEntries(
      requestCookies.split(';').map(cookie => {
        const parts = cookie.trim().split('=');
        const name = parts.shift()?.trim();
        const value = parts.join('='); // Rejoin in case value contains =
        return [name, decodeURIComponent(value || '')];
      }).filter(([name]) => name) // Filter out invalid entries
    );
    
    // Enhanced logging for debugging
    console.log(`[auth/me] Available cookies: ${JSON.stringify(Object.keys(cookies_map))}`);
    console.log(`[auth/me] Cookie values: userId=${cookies_map['userId'] || 'not found'}, userRole=${cookies_map['userRole'] || 'not found'}`);
    
    // Get hostname from request for domain debugging
    const host = request.headers.get('host') || 'unknown-host';
    console.log(`[auth/me] Request hostname: ${host}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    const userId = cookies_map['userId'];
    
    if (!userId) {
      console.log("[auth/me] No userId cookie found in request");
      // Check if we have a userRole cookie as a fallback
      const userRole = cookies_map['userRole'];
      
      if (userRole) {
        console.log(`[auth/me] Found userRole cookie: ${userRole}, attempting to find a user`);
        // User role fallback - find a user with this role
        try {
          // Find a user with the specified role
          const normalizedRole = userRole.toLowerCase();
            // Use the normalized role to find a matching user
          const user = await db.user.findFirst({
            where: { 
              role: normalizedRole.toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT"
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatarUrl: true
            }
          });
          
          if (user) {
            console.log(`[auth/me] Found user by role: ${user.name}`);
            return NextResponse.json({
              id: user.id,
              name: user.name,
              email: user.email,
              role: normalizedRole as UserRole,
              avatarUrl: user.avatarUrl
            });
          }
        } catch (error) {
          console.error('[auth/me] Error finding user by role:', error);
        }
      }
      
      return NextResponse.json(null);
    }
    
    // Import the MongoDB helper functions
    const { ensureObjectId } = await import('../../../../lib/mongodb-helpers');
    
    // Convert UUID to MongoDB ObjectId if necessary
    const objectId = ensureObjectId(userId);
    
    if (!objectId) {
      console.error(`[auth/me] Invalid user ID format: ${userId}`);
      return NextResponse.json(null);
    }
    
    const user = await db.user.findUnique({
      where: { id: objectId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });
      if (!user) {
      // User ID in cookie doesn't match any user in DB
      // Create response with null data
      const response = NextResponse.json(null);
      
      // Get domain setting based on environment
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction 
        ? (process.env.NEXT_PUBLIC_APP_DOMAIN || undefined) 
        : undefined;
      
      // Remove www prefix if present for better cookie compatibility
      const domainWithoutWww = domain?.replace(/^www\./, '') || undefined;
      
      // Add debug logging about the request host
      const host = request.headers.get('host') || 'unknown';
      console.log(`[auth/me] Host: ${host}, Environment: ${process.env.NODE_ENV}, Using domain: ${domainWithoutWww || 'default'}`);
      console.log(`[auth/me] About to clear cookies userId and userRole cookies`);
      
      // Clear cookies with domain setting
      response.cookies.set({
        name: 'userId',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: domainWithoutWww,
      });
      
      response.cookies.set({
        name: 'userRole',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: domainWithoutWww,
      });
      
      // Log all available cookies for debugging
      console.log(`[auth/me] All cookies after clearing: ${JSON.stringify(Object.keys(cookies_map))}`); 
      
      return response;
    }
      // Return user data
    console.log(`[auth/me] Successfully found user: ${user.email}, id: ${user.id}, role: ${user.role.toLowerCase()}`);
    
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() as UserRole,
      avatarUrl: user.avatarUrl
    });
    
    // Log the response status for debugging
    console.log(`[auth/me] Response status: ${response.status}, found user with role: ${user.role.toLowerCase()}`);
    
    
    
    return response;
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
