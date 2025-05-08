// src/lib/authActions.ts
'use server';

import type { UserRole } from '@/types';
import { setUserRoleCookie } from './server-auth';

export async function updateUserRoleOnServer(role: UserRole): Promise<void> {
  try {
    // Use the server-side function to update cookie
    await setUserRoleCookie(role);
  } catch (error) {
    console.error("Error in updateUserRoleOnServer action:", error);
    throw new Error("Failed to update user role on server");
  }
}
