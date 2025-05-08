import type { User, UserRole } from '@/types';

// This variable is module-scoped for client-side immediate use,
// but server-side relies on cookies via server-auth.
let clientSideCurrentUserRole: UserRole = 'student'; 

export const mockUsers: Record<UserRole, User> = {
  student: {
    id: 'user_student_001',
    name: 'Amina Student',
    email: 'amina.student@example.com',
    role: 'student',
    avatarUrl: 'https://picsum.photos/seed/amina/100/100',
  },
  teacher: {
    id: 'user_teacher_001',
    name: 'Prof. Fatima Teacher',
    email: 'fatima.teacher@example.com',
    role: 'teacher',
    avatarUrl: 'https://picsum.photos/seed/fatima/100/100',
  },
  admin: {
    id: 'user_admin_001',
    name: 'Mr. Omar Admin',
    email: 'omar.admin@example.com',
    role: 'admin',
    avatarUrl: 'https://picsum.photos/seed/omar/100/100',
  },
};

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window !== 'undefined') { // Client-side
    const storedRole = localStorage.getItem('currentUserRole') as UserRole | null;
    if (storedRole && mockUsers[storedRole]) {
      clientSideCurrentUserRole = storedRole; // Sync client-side module variable
      // console.log(`[auth.ts] getCurrentUser (client): Role from localStorage: '${storedRole}'`);
      return mockUsers[storedRole];
    }
    // If localStorage is empty, use the current client-side module variable, then update localStorage
    // console.log(`[auth.ts] getCurrentUser (client): Role from module-scope: '${clientSideCurrentUserRole}', updating localStorage.`);
    localStorage.setItem('currentUserRole', clientSideCurrentUserRole);
    return mockUsers[clientSideCurrentUserRole];
  }
  
  // Server-side: Delegate to the cookie-based method
  try {
    // console.log("[auth.ts] getCurrentUser (server): Delegating to server-auth.getServerUser().");
    const { getServerUser: getSrvUser } = await import('@/lib/server-auth');
    return await getSrvUser();
  } catch (e) {
    console.error("[auth.ts] getCurrentUser (server path): Error importing/using getServerUser:", e);
    console.warn(`[auth.ts] getCurrentUser (server path): Fallback to default student due to error.`);
    return mockUsers.student; // Fallback to default student on error.
  }
}

// Called from client components (login page)
export async function setCurrentUserRole(newRole: UserRole): Promise<void> {
  clientSideCurrentUserRole = newRole; // Update client-side module variable for immediate consistency if needed.

  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserRole', newRole);
    console.log(`[auth.ts] setCurrentUserRole (client): Set localStorage role to '${newRole}'`);
  }

  try {
    console.log(`[auth.ts] setCurrentUserRole: Calling server action to update role to '${newRole}'.`);
    const authActions = await import('@/lib/authActions');
    await authActions.updateUserRoleOnServer(newRole);
    console.log(`[auth.ts] setCurrentUserRole: Server action completed for role '${newRole}'.`);
  } catch (error) {
    console.error("[auth.ts] setCurrentUserRole: Failed to update role on server via action:", error);
    // Depending on app requirements, this might be a critical error.
  }
}

export async function login(role: UserRole): Promise<User> {
  console.log(`[auth.ts] login: Initiating login for role '${role}'.`);
  await setCurrentUserRole(role); // This sets localStorage and triggers server cookie update.
  
  // For client-side, directly return the user based on the selected role for immediate UI update.
  // Server components will re-render based on the cookie after router.refresh().
  const userForClient = mockUsers[role]; 
  
  if (!userForClient) {
    console.error(`[auth.ts] login: User not found for role '${role}' in mockUsers map.`);
    throw new Error(`Login failed: User mapping for role '${role}' not found.`);
  }
  console.log(`[auth.ts] login: Login process initiated for '${userForClient.name}' (Role: ${userForClient.role}). Client page should refresh.`);
  return userForClient;
}

export async function logout(): Promise<void> {
  console.log("[auth.ts] logout: Initiating logout.");
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUserRole');
    console.log("[auth.ts] logout (client): Removed currentUserRole from localStorage.");
  }
  // Reset role to 'student' and update server-side httpOnly cookie via server action.
  await setCurrentUserRole('student'); 
  console.log("[auth.ts] logout: Role reset to 'student'. Server cookie update initiated.");
}