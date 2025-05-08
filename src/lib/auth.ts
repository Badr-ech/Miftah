import type { User, UserRole } from '@/types';
import { cookies } from 'next/headers';

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
  
  // Server-side: Check for role in cookies first
  try {
    const cookieStore = cookies();
    const roleCookie = cookieStore.get('userRole');
    const roleFromCookie = roleCookie?.value as UserRole;
    
    if (roleFromCookie && mockUsers[roleFromCookie]) {
      if (currentUserRole !== roleFromCookie) {
        currentUserRole = roleFromCookie; // Update server-side module variable
      }
      return mockUsers[roleFromCookie];
    }
  } catch (error) {
    // If cookies() fails (e.g., in middleware), fall back to module-scoped variable
    console.log("Couldn't access cookies, falling back to module variable");
  }
  
  // Fall back to module-scoped variable
  return mockUsers[currentUserRole];
}

// Called by server actions to update the role in the server's module scope.
export function setServerSideUserRole(newRole: UserRole): void {
  currentUserRole = newRole;
  
  // Also update in cookies for better server-side consistency
  try {
    const cookieStore = cookies();
    // Set the cookie with HttpOnly: false so client JavaScript can read it too
    cookieStore.set('userRole', newRole, { 
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: false,
      sameSite: 'strict'
    });
  } catch (error) {
    console.error("Failed to set cookie in server action:", error);
    // Continue anyway - the module-scoped variable was still updated
  }
}

// Called from client components (login page, UserRoleSwitcher)
// Updates client state and calls a server action to update server state.
export async function setCurrentUserRole(newRole: UserRole): Promise<void> {
  // Update client-side module variable
  currentUserRole = newRole;

  // Update localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserRole', newRole);
    
    // Also update in document.cookie for better cross-request consistency
    document.cookie = `userRole=${newRole};path=/;max-age=${60*60*24};SameSite=Strict`;
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
    // Clear localStorage
    localStorage.removeItem('currentUserRole');
    
    // Clear the cookie by setting an expired date
    document.cookie = 'userRole=; path=/; max-age=0; SameSite=Strict';
  }
  
  // Reset to default and update server state
  await setCurrentUserRole('student');
}

// This function is to be used in Server Components
// It needs to check cookies first for consistency
export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const roleCookie = cookieStore.get('userRole');
    const roleFromCookie = roleCookie?.value as UserRole | undefined;
    
    if (roleFromCookie && mockUsers[roleFromCookie]) {
      // Sync the module variable with the cookie value for consistency
      if (currentUserRole !== roleFromCookie) {
        currentUserRole = roleFromCookie;
      }
      return mockUsers[roleFromCookie];
    }
  } catch (error) {
    console.log("Couldn't access cookies in getSessionUser, falling back to module variable");
  }
  
  // Fall back to module-scoped variable
  return mockUsers[currentUserRole];
}
