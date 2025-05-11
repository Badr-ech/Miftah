'use server';

import type { User, UserRole } from '../types';
import { cookies } from 'next/headers';
import { db } from './db';

export async function getUserRoleFromCookies(): Promise<UserRole | null> {
  try {
    // Skip cookie access during static build phase
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return null;
    }
    
    // During static build, we need to handle cookies() failing gracefully
    // Get cookie store - cookies() returns a Promise in Next.js
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // When building statically or during SSG, this function might be called 
      // but cookies() will throw an error - return null in this case
      console.warn('[server-auth] getUserRoleFromCookies: Unable to access cookies (likely during static generation)');
      return null; 
    }
    
    const roleCookie = cookieStore.get('userRole');
    const userIdCookie = cookieStore.get('userId');
    
    // Don't log in production to avoid excessive logs
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[server-auth] getUserRoleFromCookies: Raw cookie value is '${roleCookie?.value}'`);
      console.log(`[server-auth] getUserRoleFromCookies: User ID cookie exists: ${!!userIdCookie}`);
    }
    
    // Validate the role value - always normalize to lowercase
    if (roleCookie && roleCookie.value) {
      const lowerCaseRole = roleCookie.value.toLowerCase();
      
      // Map recognized roles to our standard lowercase format
      if (lowerCaseRole === 'student' || lowerCaseRole === 'teacher' || lowerCaseRole === 'admin') {
        return lowerCaseRole as UserRole;
      } else {
        // Try handling any uppercase variants
        const upperCaseRole = roleCookie.value.toUpperCase();
        if (upperCaseRole === 'STUDENT') return 'student';
        if (upperCaseRole === 'TEACHER') return 'teacher';
        if (upperCaseRole === 'ADMIN') return 'admin';
        
        console.warn(`[server-auth] getUserRoleFromCookies: Invalid role value in cookie: '${roleCookie.value}'`);
      }
    }
    return null;
  } catch (error) {
    console.error("[server-auth] Error getting user role from cookies:", error);
    return null;
  }
}

export async function setUserRoleCookie(role: UserRole): Promise<void> {
  try {
    // Skip cookie setting during static build phase
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }
    
    // During static build, we need to handle cookies() failing gracefully
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // When building statically, this function might be called 
      // but cookies() will throw an error - just return in this case
      console.warn('[server-auth] setUserRoleCookie: Unable to access cookies (likely during static generation)');
      return;
    }
    
    cookieStore.set('userRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, 
      sameSite: 'lax', // Changed from 'strict' to 'lax' for consistency
      secure: process.env.NODE_ENV === 'production', 
    });
    
    // Don't log in production to avoid excessive logs
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[server-auth] setUserRoleCookie: Set userRole cookie to '${role}'`);
    }
  } catch (error) {
    console.error("[server-auth] Error setting user role cookie:", error);
  }
}

export async function getUserIdFromCookies(): Promise<string | null> {
  try {
    // Skip cookie access during static build phase
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return null;
    }
    
    // During static build, we need to handle cookies() failing gracefully
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // When building statically, this function might be called 
      // but cookies() will throw an error - return null in this case
      console.warn('[server-auth] getUserIdFromCookies: Unable to access cookies (likely during static generation)');
      return null;
    }
    
    const userIdCookie = cookieStore.get('userId');
    return userIdCookie?.value || null;
  } catch (error) {
    console.error("[server-auth] Error getting user ID from cookies:", error);
    return null;
  }
}

export async function setUserCookies(userId: string, role: UserRole): Promise<void> {
  try {
    // Skip cookie setting during static build phase
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }
    
    // During static build, we need to handle cookies() failing gracefully
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // When building statically, this function might be called 
      // but cookies() will throw an error - just return in this case
      console.warn('[server-auth] setUserCookies: Unable to access cookies (likely during static generation)');
      return;
    }
    
    // Get environment setting
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Create cookie options
    const cookieOptions = {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, 
      sameSite: 'lax' as const,
      secure: isProduction,
    };
    
    // Add debug logging for production environments
    if (isProduction) {
      console.log(`[server-auth] Setting cookies in production environment, APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'not set'}`);
    }
    
    // Set user ID cookie
    cookieStore.set('userId', userId, cookieOptions);
    
    // Set user role cookie
    cookieStore.set('userRole', role, cookieOptions);
    
    // Don't log in production to avoid excessive logs
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[server-auth] setUserCookies: Set cookies for user ID '${userId}' with role '${role}'`);
    }
  } catch (error) {
    console.error("[server-auth] Error setting user cookies:", error);
  }
}

export async function getServerUser(): Promise<User | null> {
  try {
    const userId = await getUserIdFromCookies();
        if (userId) {
      try {
        // Import the MongoDB helper for UUID to ObjectId conversion
        const { ensureObjectId } = await import('./mongodb-helpers');
        
        // Ensure we have a valid MongoDB ObjectId (convert from UUID if necessary)
        const objectId = ensureObjectId(userId);
        
        if (!objectId) {
          console.error(`[server-auth] Invalid user ID format: ${userId}`);
          return null;
        }
        
        // Fetch user from database using the converted ID
        const dbUser = await db.user.findUnique({
          where: { id: objectId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true
          }
        });
        
        if (dbUser) {
          // User found in database
          // Normalize role to lowercase for consistency across environments
          const normalizedRole = dbUser.role.toString().toLowerCase();
          
          const user: User = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: normalizedRole as UserRole,
            avatarUrl: dbUser.avatarUrl || undefined
          };
          
          console.log(`[server-auth] getServerUser: Successfully found user '${user.name}' with role '${normalizedRole}'`);
          return user;
        }
      } catch (dbError) {
        console.error('[server-auth] Error fetching user from database:', dbError);
        // Continue to the fallback case below instead of failing
      }    // This block is handled in the try-catch above
    }
    
    // If no userId or no user found, fallback to role-based method for backward compatibility    
    const role = await getUserRoleFromCookies();    
    if (role) {
      try {        // Find a user with the specified role
        // Use the uppercase version of the role which is one of the valid UserRole literals
        const upperRole = role.toUpperCase() as "ADMIN" | "TEACHER" | "STUDENT";
        const dbUser = await db.user.findFirst({
          where: { 
            role: upperRole
          }, // Now we have a correctly typed role value
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true
          }        });
        
        // Log for debugging
        if (!dbUser) {
          console.log(`[server-auth] No user found with role '${role.toUpperCase()}'`);
        }
        
        if (dbUser) {
          // Normalize role to lowercase for consistency
          const normalizedRole = dbUser.role.toString().toLowerCase();
          
          const user: User = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: normalizedRole as UserRole,
            avatarUrl: dbUser.avatarUrl || undefined
          };
          
          // Set the userId cookie for future requests
          await setUserCookies(user.id, normalizedRole as UserRole);
          
          console.log(`[server-auth] getServerUser: Found user by role '${role}': ${user.name}`);
          return user;
        }
      } catch (dbError) {
        console.error('[server-auth] Error finding user by role:', dbError);
      }
      
      // If we reach here, we have a role cookie but couldn't find a matching user
      // For demo purposes, create a fake user that matches what the client expects
      const demoUser: User = {
        id: "00000000-0000-0000-0000-000000000000", // Use a valid UUID format
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        email: `demo_${role}@example.com`,
        role: role as UserRole,
        avatarUrl: `https://picsum.photos/seed/${role}/100/100`
      };
      
      console.log(`[server-auth] getServerUser: Created demo user for role '${role}'`);
      return demoUser;
    }
    
    console.warn('[server-auth] getServerUser: No user found in database, returning null');
    return null;
  } catch (error) {
    console.error("[server-auth] Error in getServerUser:", error);
    return null;
  }
}