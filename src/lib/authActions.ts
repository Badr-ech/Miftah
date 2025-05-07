// src/lib/authActions.ts
'use server';

import type { UserRole } from '@/types';
import { setServerSideUserRole } from '@/lib/auth';

export async function updateUserRoleOnServer(role: UserRole): Promise<void> {
  try {
    setServerSideUserRole(role);
  } catch (error) {
    console.error("Error in updateUserRoleOnServer action:", error);
    // Depending on the desired behavior, you might want to throw or handle differently
  }
}
