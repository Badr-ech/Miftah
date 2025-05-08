// src/lib/authActions.ts
'use server';

import type { UserRole } from '@/types';
import { setUserRoleCookie, getUserRoleFromCookies } from './server-auth';

export async function updateUserRoleOnServer(role: UserRole): Promise<void> {
  try {
    console.log(`[authActions] updateUserRoleOnServer: Action called to set role to '${role}'.`);
    await setUserRoleCookie(role);
    // Verification step (optional, for debugging)
    const newRoleFromCookie = await getUserRoleFromCookies();
    console.log(`[authActions] updateUserRoleOnServer: Role set. Verification read from cookie: '${newRoleFromCookie}'. Expected: '${role}'.`);
    if (newRoleFromCookie !== role) {
        console.error(`[authActions] updateUserRoleOnServer: Cookie verification failed! Expected '${role}', got '${newRoleFromCookie}'.`);
    }
  } catch (error) {
    console.error("[authActions] Error in updateUserRoleOnServer action:", error);
    // Consider re-throwing or returning an error status if this is critical for UI feedback
    throw new Error("Failed to update user role on server");
  }
}