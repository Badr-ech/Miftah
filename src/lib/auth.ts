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
          clientSideCurrentUser = userData;
          clientSideCurrentUserRole = userData.role;
          return userData;
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
    return await getServerUser();
  } catch (e) {
    console.error("[auth.ts] getCurrentUser (server path): Error using getServerUser:", e);
    return null;
  }
}

// For backwards compatibility - simulate login with just a role
export async function loginWithRole(role: UserRole): Promise<User> {
  try {
    // Directly set the role cookie without trying to find a specific user
    // This simplified approach bypasses the need for specific user credentials
    const response = await fetch('/api/auth/role-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error(`Role login failed for ${role}`);
    }

    const userData = await response.json();
    
    // Update client-side cache
    clientSideCurrentUser = userData;
    clientSideCurrentUserRole = role;
    
    return userData;
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
    
    // Update client-side cache
    clientSideCurrentUser = userData;
    clientSideCurrentUserRole = userData.role;
    
    return userData;
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
    
    // Clear client-side cache
    clientSideCurrentUser = null;
    clientSideCurrentUserRole = 'student';
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUserRole');
    }
  } catch (error) {
    console.error('[auth.ts] Logout error:', error);
    throw error;
  }
}