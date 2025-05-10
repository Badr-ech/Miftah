import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { UserRole } from '../../../../types';

export async function GET(request: Request) {
  try {
    // Read the request cookies
    const requestCookies = request.headers.get('cookie') || '';
    // Parse cookies manually
    const cookies_map = Object.fromEntries(
      requestCookies.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return [name, value];
      })
    );
    
    // Log for debugging
    console.log(`[auth/me] Available cookies: ${JSON.stringify(Object.keys(cookies_map))}`);
    
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
      
      // Clear cookies
      response.cookies.set({
        name: 'userId',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
      });
      
      response.cookies.set({
        name: 'userRole',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
      });
      
      return response;
    }
      // Return user data
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() as UserRole,
      avatarUrl: user.avatarUrl
    });
    
    return response;
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
