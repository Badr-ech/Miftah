import type { User, UserRole } from '@/types';

// In a real app, this would involve checking a session, token, etc.
// For now, we'll cycle through roles or allow setting via localStorage for demo.

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
  // Simulate fetching user data
  // In a real app, you might get role from localStorage for demo purposes
  if (typeof window !== 'undefined') {
    const storedRole = localStorage.getItem('currentUserRole') as UserRole | null;
    if (storedRole && mockUsers[storedRole]) {
      return mockUsers[storedRole];
    }
  }
  return mockUsers[currentUserRole];
}

export function setCurrentUserRole(role: UserRole) {
  currentUserRole = role;
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUserRole', role);
  }
}

// Helper to simulate login
export async function login(role: UserRole): Promise<User> {
  setCurrentUserRole(role);
  const user = await getCurrentUser();
  if (!user) throw new Error("Login failed: User not found for role.");
  return user;
}

// Helper to simulate logout
export async function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUserRole');
  }
  // Reset to a default or handle redirection
  // For now, just clears the role. A real app would clear session/token.
}

// This function is to be used in Server Components
// It can't rely on localStorage directly.
// For a real app, this would involve cookies or server-side session management.
// For this mock, we'll keep it simple. A real implementation would differ significantly.
export async function getSessionUser(): Promise<User | null> {
  // This is a placeholder. In a real app with server components,
  // you'd verify a session cookie or similar.
  // For now, it just returns the currently set mock user.
  return mockUsers[currentUserRole];
}
