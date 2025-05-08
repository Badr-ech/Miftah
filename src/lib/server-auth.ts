'use server';

import type { User, UserRole } from '@/types';
import { cookies } from 'next/headers';
import { mockUsers } from './auth';

// This is for server-side only authentication functions

// Get the user role from cookies
export async function getUserRoleFromCookies(): Promise<UserRole | null> {
  try {
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('userRole');
    return roleCookie?.value as UserRole || null;
  } catch (error) {
    console.error("Error getting user role from cookies:", error);
    return null;
  }
}

// Set user role in cookies
export async function setUserRoleCookie(role: UserRole): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('userRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: false,
      sameSite: 'strict'
    });
  } catch (error) {
    console.error("Error setting user role cookie:", error);
  }
}

// Get server-side user
export async function getServerUser(): Promise<User | null> {
  const role = await getUserRoleFromCookies();
  if (role && mockUsers[role]) {
    return mockUsers[role];
  }
  return mockUsers.student; // Default fallback
}