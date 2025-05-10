import type { User, UserRole } from '../types';

// This variable is module-scoped for client-side immediate use
let clientSideCurrentUserRole: UserRole = 'student'; 
let clientSideCurrentUser: User | null = null;

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window !== 'undefined') { // Client-side
    // If we already have a user cached in memory, return it
    if (clientSideCurrentUser) {
      return clientSideCurrentUser;
    }
    
    // Otherwise, fetch the user from the server
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData) {
          // Always normalize the role when getting user data
          const normalizedRole = normalizeRole(userData.role);
          
          // Create normalized user object
          clientSideCurrentUser = {
            ...userData,
            role: normalizedRole
          };
          
          clientSideCurrentUserRole = normalizedRole;
          console.log(`[auth.ts] getCurrentUser: User role normalized from ${userData.role} to ${normalizedRole}`);
          return clientSideCurrentUser;
        }
      }
      return null;
    } catch (error) {
      console.error('[auth.ts] Error fetching current user:', error);
      return null;
    }
  }
  
  // Server-side: Delegate to the cookie-based method
  try {
    const { getServerUser } = await import('../lib/server-auth');
    const serverUser = await getServerUser();
    
    if (serverUser) {
      // Always normalize the role on the server side too
      const normalizedRole = normalizeRole(serverUser.role);
      return {
        ...serverUser,
        role: normalizedRole
      };
    }
    return null;
  } catch (e) {
    console.error("[auth.ts] getCurrentUser (server path): Error using getServerUser:", e);
    return null;
  }
}

// Helper function to normalize role to lowercase form for consistency
function normalizeRole(role: UserRole): UserRole {
  if (!role) return 'student'; // Default to student if no role provided
  
  // Convert to lowercase and check if it's one of our standard roles
  const normalized = typeof role === 'string' ? role.toLowerCase() : 'student';
  
  if (['student', 'teacher', 'admin'].includes(normalized)) {
    return normalized as UserRole;
  }
  
  // Handle uppercase variants if needed
  if (role.toUpperCase() === 'STUDENT') return 'student';
  if (role.toUpperCase() === 'TEACHER') return 'teacher';
  if (role.toUpperCase() === 'ADMIN') return 'admin';
  
  console.warn(`[auth.ts] Unknown role format: ${role}, defaulting to student`);
  return 'student';
}

// For backwards compatibility - simulate login with just a role
export async function loginWithRole(role: UserRole): Promise<User> {
  try {
    // Normalize the role before sending to the API
    const normalizedRole = normalizeRole(role);
    
    console.log(`[auth.ts] loginWithRole: Normalized role from ${role} to ${normalizedRole}`);
    
    // Directly set the role cookie without trying to find a specific user
    // This simplified approach bypasses the need for specific user credentials
    const response = await fetch('/api/auth/role-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: normalizedRole }),
    });

    if (!response.ok) {
      throw new Error(`Role login failed for ${normalizedRole}`);
    }

    const userData = await response.json();
    
    // Update client-side cache with normalized role
    clientSideCurrentUser = {
      ...userData,
      role: normalizedRole // Ensure client cache has normalized role
    };
    clientSideCurrentUserRole = normalizedRole;
    
    if (!clientSideCurrentUser) {
      throw new Error("Failed to get user data after role login");
    }
    return clientSideCurrentUser;
  } catch (error) {
    console.error('[auth.ts] LoginWithRole error:', error);
    throw error;
  }
}

// Main login function with email/password
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();
    
    // Normalize the role for consistency
    const normalizedRole = normalizeRole(userData.role);
    
    // Update client-side cache with normalized role
    clientSideCurrentUser = {
      ...userData,
      role: normalizedRole
    };
    clientSideCurrentUserRole = normalizedRole;
    
    console.log(`[auth.ts] login: User role normalized from ${userData.role} to ${normalizedRole}`);
    
    if (!clientSideCurrentUser) {
      throw new Error("Failed to get user data after login");
    }
    return clientSideCurrentUser;
  } catch (error) {
    console.error('[auth.ts] Login error:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Logout failed');
    }
    
    // Clear client-side cache - use normalized default role
    clientSideCurrentUser = null;
    clientSideCurrentUserRole = normalizeRole('student');
    
    console.log(`[auth.ts] logout: Cleared user session, reset to default role: ${clientSideCurrentUserRole}`);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserRole');
    }
  } catch (error) {
    console.error('[auth.ts] Logout error:', error);
    throw error;
  }
}