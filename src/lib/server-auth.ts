'use server';

import type { User, UserRole } from '@/types';
import { cookies } from 'next/headers';
import { db } from './db';

export async function getUserRoleFromCookies(): Promise<UserRole | null> {
  try {
    // Get cookie store - cookies() returns a Promise in Next.js
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('userRole');
    console.log(`[server-auth] getUserRoleFromCookies: Raw cookie value is '${roleCookie?.value}'`);
    
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
    // Get cookie store - cookies() returns a Promise in Next.js
    const cookieStore = await cookies();
    cookieStore.set('userRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true, 
      sameSite: 'lax', // Changed from 'strict' to 'lax' for consistency
      secure: process.env.NODE_ENV === 'production', 
    });
    console.log(`[server-auth] setUserRoleCookie: Set userRole cookie to '${role}'`);
  } catch (error) {
    console.error("[server-auth] Error setting user role cookie:", error);
  }
}

export async function getUserIdFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    return userIdCookie?.value || null;
  } catch (error) {
    console.error("[server-auth] Error getting user ID from cookies:", error);
    return null;
  }
}

export async function setUserCookies(userId: string, role: UserRole): Promise<void> {
  try {
    const cookieStore = await cookies();
    
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
    
    console.log(`[server-auth] setUserCookies: Set cookies for user ID '${userId}' with role '${role}'`);
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