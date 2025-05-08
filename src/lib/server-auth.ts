'use server';

import type { User, UserRole } from '@/types';
import { cookies } from 'next/headers';
// Ensure this path is correct and mockUsers is the Record<UserRole, User> map
import { mockUsers as roleToUserMap } from './auth'; 

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

export async function getServerUser(): Promise<User | null> {
  const role = await getUserRoleFromCookies();
  console.log(`[server-auth] getServerUser: Role determined from cookies is '${role}'`);
  
  if (role && roleToUserMap[role]) {
    console.log(`[server-auth] getServerUser: Successfully found user '${roleToUserMap[role].name}' for role '${role}'.`);
    return roleToUserMap[role];
  }
  
  console.warn(`[server-auth] getServerUser: Role '${role}' not found in roleToUserMap or role is null. Defaulting to student user.`);
  return roleToUserMap.student; 
}