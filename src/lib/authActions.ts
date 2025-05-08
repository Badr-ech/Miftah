// src/lib/authActions.ts
'use server';

import type { UserRole } from '@/types';
import { setServerSideUserRole } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function updateUserRoleOnServer(role: UserRole): Promise<void> {
  try {
    // Update the module-scoped variable
    setServerSideUserRole(role);
    
    // Directly update cookie to ensure consistency across server requests
    const cookieStore = await cookies();
    cookieStore.set('userRole', role, { 
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: false, // Allow JS access
      sameSite: 'strict'
    });
  } catch (error) {
    console.error("Error in updateUserRoleOnServer action:", error);
    throw new Error("Failed to update user role on server");
  }
}
