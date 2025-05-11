import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { UserRole } from '../../../../types';

// Import ObjectId from bson to generate MongoDB compatible IDs
const { ObjectId } = await import('bson');

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
    
    // Normalize role for consistency
    // First handle any possible case variations
    let normalizedRole: UserRole;
    let normalizedRoleUpper: UserRole;
    if (typeof role === 'string') {
      const lowerRole = role.toLowerCase();
      if (lowerRole === 'student') { normalizedRole = 'student'; normalizedRoleUpper = 'STUDENT'; }
      else if (lowerRole === 'teacher') { normalizedRole = 'teacher'; normalizedRoleUpper = 'TEACHER'; }
      else if (lowerRole === 'admin') { normalizedRole = 'admin'; normalizedRoleUpper = 'ADMIN'; }
      else { normalizedRole = 'student'; normalizedRoleUpper = 'STUDENT'; }
    } else {
      normalizedRole = 'student';
      normalizedRoleUpper = 'STUDENT';
    }
    
    console.log(`[role-login] Normalized role from '${role}' to '${normalizedRole}'`);
    
    // Upsert a real user in the DB for this role (so protected API routes work)
    const email = `default_${normalizedRole}@example.com`;
    const name = `Default ${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}`;
    const avatarUrl = `https://picsum.photos/seed/${normalizedRole}/100/100`;
    // Use the already-imported ObjectId and generateObjectId function
    // (move the import and function to the top of the file if needed)
    const user = await db.user.upsert({
      where: { email },
      update: {},
      create: {
        id: new ObjectId().toHexString(),
        name,
        email,
        role: normalizedRoleUpper, // Always 'STUDENT', 'TEACHER', or 'ADMIN'
        avatarUrl,
        password: '', // or null if allowed
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      }
    });
    
    // Create response with user data
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      avatarUrl: user.avatarUrl
    });
      // Set domain based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction 
      ? (process.env.NEXT_PUBLIC_APP_DOMAIN || undefined)
      : undefined;

    console.log(`[role-login] Setting cookies for environment: ${process.env.NODE_ENV}, domain: ${domain || 'default'}`);
    
    // Set cookies for authentication with improved settings for cross-environment compatibility
    response.cookies.set({
      name: 'userId',
      value: user.id,
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
