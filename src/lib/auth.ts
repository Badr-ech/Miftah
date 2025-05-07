import type { User, UserRole } from '@/types';

// This variable is module-scoped.
// Server instances of this module will have their own `currentUserRole`.
// Client instances will have theirs.
let currentUserRole: UserRole = 'student'; // Default role

const mockUsers: Record<UserRole, User> = {
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
      if (currentUserRole !== storedRole) {
        currentUserRole = storedRole; // Sync client-side module variable
      }
      return mockUsers[storedRole];
    }
    // If localStorage is empty, use the current client-side module variable
    return mockUsers[currentUserRole];
  }
  // Server-side: Uses the module-scoped `currentUserRole`, hopefully updated by a server action.
  return mockUsers[currentUserRole];
}

// Called by server actions to update the role in the server's module scope.
export function setServerSideUserRole(newRole: UserRole): void {
  currentUserRole = newRole;
}

// Called from client components (login page, UserRoleSwitcher)
// Updates client state and calls a server action to update server state.
export async function setCurrentUserRole(newRole: UserRole): Promise<void> {
  // Update client-side module variable
  currentUserRole = newRole;

  // Update localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserRole', newRole);
  }

  // Call server action to update server's understanding of the role
  try {
    // Dynamically import the server action module
    const authActions = await import('@/lib/authActions');
    await authActions.updateUserRoleOnServer(newRole);
  } catch (error) {
    console.error("Failed to update role on server via action:", error);
    // Decide how to handle this error. For a mock, we might proceed,
    // knowing server state might be out of sync.
  }
}

export async function login(role: UserRole): Promise<User> {
  await setCurrentUserRole(role);
  // getCurrentUser will be called on the client after login actions complete.
  // It should pick up the role from client-side currentUserRole or localStorage.
  const user = await getCurrentUser(); 
  if (!user) throw new Error("Login failed: User not found for role.");
  return user;
}

export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUserRole');
  }
  // Reset to a default or handle redirection
  // For now, just clears the role. A real app would clear session/token.
  // Call setCurrentUserRole to update both client and server state to default 'student'
  await setCurrentUserRole('student'); 
}

// This function is to be used in Server Components
// It can't rely on localStorage directly.
// It relies on the server-side module-scoped `currentUserRole`.
export async function getSessionUser(): Promise<User | null> {
  return mockUsers[currentUserRole];
}
