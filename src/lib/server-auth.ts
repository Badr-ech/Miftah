'use server';

// @ts-ignore - Ignoring path alias resolution issue
import type { User, UserRole } from '@/types';
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
    } catch (cookieError) {
      // When building statically or during SSG, this function might be called 
      // but cookies() will throw an error - return null in this case
      console.warn('[server-auth] getUserRoleFromCookies: Unable to access cookies (likely during static generation)');
      return null; 
    }
    
    const roleCookie = cookieStore.get('userRole');
    
    // Don't log in production to avoid excessive logs
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[server-auth] getUserRoleFromCookies: Raw cookie value is '${roleCookie?.value}'`);
    }
    
    // Validate the role value
    if (roleCookie && (roleCookie.value === 'student' || roleCookie.value === 'teacher' || roleCookie.value === 'admin')) {
        return roleCookie.value as UserRole;
    }
    if (roleCookie) {
        console.warn(`[server-auth] getUserRoleFromCookies: Invalid role value in cookie: '${roleCookie.value}'`);
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
    } catch (cookieError) {
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
    } catch (cookieError) {
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
    } catch (cookieError) {
      // When building statically, this function might be called 
      // but cookies() will throw an error - just return in this case
      console.warn('[server-auth] setUserCookies: Unable to access cookies (likely during static generation)');
      return;
    }
    
    // Set user ID cookie
    cookieStore.set('userId', userId, { 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', 
    });
    
    // Set user role cookie
    cookieStore.set('userRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, 
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    
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
      // Fetch user from database
      const dbUser = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      });
      
      if (dbUser) {
        // Convert database user to our application's User type
        const user: User = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role.toLowerCase() as UserRole, // Convert to lowercase to match our app's UserRole type
          avatarUrl: dbUser.avatarUrl || undefined
        };
        
        console.log(`[server-auth] getServerUser: Successfully found user '${user.name}' with role '${user.role}'`);
        return user;
      }
    }
    
    // If no userId or no user found, fallback to role-based method for backward compatibility
    const role = await getUserRoleFromCookies();
      if (role) {
      // Find a user with the specified role
      // Cast the role string to match the expected database enum type
      const dbUser = await db.user.findFirst({
        where: { role: role.toUpperCase() as any },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true
        }
      });
      
      if (dbUser) {
        const user: User = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role.toLowerCase() as UserRole,
          avatarUrl: dbUser.avatarUrl || undefined
        };
        
        // Set the userId cookie for future requests
        await setUserCookies(user.id, user.role);
        
        console.log(`[server-auth] getServerUser: Found user by role '${role}': ${user.name}`);
        return user;
      }
    }
    
    console.warn('[server-auth] getServerUser: No user found in database, returning null');
    return null;
  } catch (error) {
    console.error("[server-auth] Error in getServerUser:", error);
    return null;
  }
}