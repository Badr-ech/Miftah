import React from 'react';
import type { User, UserRole } from '../types';

// This variable is module-scoped for client-side immediate use
let clientSideCurrentUserRole: UserRole = 'student'; 
let clientSideCurrentUser: User | null = null;

// Debug function to inspect cookies
function debugCookies(context: string) {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log(`[auth.ts] ${context} - Current cookies:`, cookies.join(', '));
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window !== 'undefined') { // Client-side
    // If we already have a user cached in memory, return it
    if (clientSideCurrentUser) {
      return clientSideCurrentUser;
    }
    
    // Otherwise, fetch the user from the server    
    try {
      // Log cookies before making the request
      debugCookies('Before getCurrentUser fetch');
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Explicitly include credentials (cookies)
        cache: 'no-store' // Don't cache the response
      });
      
      console.log('[auth.ts] GET /api/auth/me response status:', response.status);
      
      // Log cookies after receiving the response
      debugCookies('After getCurrentUser fetch');
      if (response.ok) {
        const userData = await response.json();
        console.log('[auth.ts] GET /api/auth/me response data:', userData ? 'received data' : 'null');
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
        } else if (clientSideCurrentUser) {
          // If the API returns null but we have a cached user, keep using it
          // This prevents users from being logged out unexpectedly
          console.log('[auth.ts] API returned null but using cached user data');
          return clientSideCurrentUser;
        }
      } else if (clientSideCurrentUser) {
        // If the API call fails but we have a cached user, keep using it
        console.log('[auth.ts] API call failed but using cached user data');
        return clientSideCurrentUser;
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
    
    // Check cookies before login attempt
    debugCookies('Before role-based login');
    
    // Directly set the role cookie without trying to find a specific user
    // This simplified approach bypasses the need for specific user credentials
    const response = await fetch('/api/auth/role-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: normalizedRole }),
      credentials: 'include', // Explicitly include credentials (cookies)
    });

    if (!response.ok) {
      throw new Error(`Role login failed for ${normalizedRole}`);
    }

    const userData = await response.json();
    
    // Check cookies after successful response
    debugCookies('After role-based login');
    
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
    console.log(`[auth.ts] Attempting email login for: ${email}`);
    
    // Check cookies before login attempt
    debugCookies('Before login attempt');
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Explicitly include credentials (cookies)
    });

    console.log(`[auth.ts] Login response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log(`[auth.ts] Login error: ${errorData.error || 'Unknown error'}`);
      throw new Error(errorData.error || 'Login failed');
    }

    const userData = await response.json();
    console.log(`[auth.ts] Login successful for user: ${userData.email}`);
    
    // Check if cookies were properly set after login
    debugCookies('After successful login');
    
    
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
      credentials: 'include', // Include credentials to ensure cookies are sent
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
      // Clear any local storage items
      localStorage.removeItem('currentUserRole');
      
      // Attempt to clear cookies manually as a backup
      document.cookie = 'userId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'userRole=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // If we know the domain, also clear domain-specific cookies
      const domain = window.location.hostname;
      if (domain) {
        document.cookie = `userId=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        document.cookie = `userRole=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }
  } catch (error) {
    console.error('[auth.ts] Logout error:', error);
    throw error;
  }
}