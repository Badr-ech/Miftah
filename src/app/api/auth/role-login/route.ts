import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { UserRole } from '../../../../types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }    // For demo purposes, we'll skip DB lookup and just create a default user
    // This ensures the quick login always works
    
    // Import ObjectId from bson to generate MongoDB compatible IDs
    const { ObjectId } = await import('bson');
    
    // Generate a MongoDB ObjectId instead of UUID
    function generateObjectId() {
      return new ObjectId().toHexString();
    }
      
    // Normalize role for consistency
    // First handle any possible case variations
    let normalizedRole;
    
    if (typeof role === 'string') {
      const lowerRole = role.toLowerCase();
      if (['student', 'teacher', 'admin'].includes(lowerRole)) {
        normalizedRole = lowerRole;
      } else {
        // Try to handle uppercase formats or other variants
        const upperRole = role.toUpperCase();
        if (upperRole === 'STUDENT') normalizedRole = 'student';
        else if (upperRole === 'TEACHER') normalizedRole = 'teacher';
        else if (upperRole === 'ADMIN') normalizedRole = 'admin';
        else normalizedRole = 'student'; // Default to student if unrecognized
      }
    } else {
      // If role is somehow not a string, default to student
      normalizedRole = 'student';
    }
    
    console.log(`[role-login] Normalized role from '${role}' to '${normalizedRole}'`);
    
    const defaultUser = {
      id: generateObjectId(),
      name: `Default ${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}`,
      email: `default_${normalizedRole}@example.com`,
      role: normalizedRole, // Always use normalized lowercase role
      avatarUrl: `https://picsum.photos/seed/${normalizedRole}/100/100`
    };
    
    // Create response with user data
    const response = NextResponse.json(defaultUser);
      // Set domain based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction 
      ? (process.env.NEXT_PUBLIC_APP_DOMAIN || undefined)
      : undefined;

    console.log(`[role-login] Setting cookies for environment: ${process.env.NODE_ENV}, domain: ${domain || 'default'}`);
    
    // Set cookies for authentication with improved settings for cross-environment compatibility
    response.cookies.set({
      name: 'userId',
      value: defaultUser.id,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',     // Use 'lax' for better cross-site compatibility
      secure: isProduction, // Only secure in production
      domain: domain,       // Set domain if in production
    });
    
    response.cookies.set({
      name: 'userRole',
      value: normalizedRole,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',     // Use 'lax' for better cross-site compatibility
      secure: isProduction, // Only secure in production
      domain: domain,       // Set domain if in production
    });
      
      return response;
  } catch (error) {
    console.error('Role login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
