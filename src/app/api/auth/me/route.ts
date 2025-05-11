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
    
    // Get hostname from request for domain debugging
    const host = request.headers.get('host') || 'unknown-host';
    const origin = request.headers.get('origin') || 'unknown-origin';
    console.log(`[auth/me] Request hostname: ${host}, origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[auth/me] App domain config: ${process.env.NEXT_PUBLIC_APP_DOMAIN || 'not set'}`);
    console.log(`[auth/me] App URL config: ${process.env.NEXT_PUBLIC_APP_URL || 'not set'}`);
    
    // Check specific cookies
    console.log(`[auth/me] userId cookie: ${cookies_map['userId'] || 'not found'}`);
    console.log(`[auth/me] userRole cookie: ${cookies_map['userRole'] || 'not found'}`);
    
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
      // Try to recover: upsert a default user for the role in cookies (if present)
      const userRole = cookies_map['userRole'];
      let normalizedRoleUpper: 'STUDENT' | 'TEACHER' | 'ADMIN' = 'STUDENT';
      if (userRole) {
        const lowerRole = userRole.toLowerCase();
        if (lowerRole === 'teacher') { normalizedRoleUpper = 'TEACHER'; }
        else if (lowerRole === 'admin') { normalizedRoleUpper = 'ADMIN'; }
      }
      const email = `default_${normalizedRoleUpper.toLowerCase()}@example.com`;
      const name = `Default ${normalizedRoleUpper.charAt(0) + normalizedRoleUpper.slice(1).toLowerCase()}`;
      const avatarUrl = `https://picsum.photos/seed/${normalizedRoleUpper.toLowerCase()}/100/100`;
      // Import ObjectId for new user creation (remove assignment if not used)
      // const { ObjectId } = await import('bson');
      const upsertedUser = await db.user.upsert({
        where: { email },
        update: {
          name,
          avatarUrl,
          role: normalizedRoleUpper,
        },
        create: {
          id: objectId,
          name,
          email,
          role: normalizedRoleUpper,
          avatarUrl,
          password: '',
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      });
      return NextResponse.json({
        id: upsertedUser.id,
        name: upsertedUser.name,
        email: upsertedUser.email,
        role: upsertedUser.role.toLowerCase(),
        avatarUrl: upsertedUser.avatarUrl
      });
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
