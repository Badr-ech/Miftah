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
    const normalizedRole = role.toLowerCase();
    
    const defaultUser = {
      id: generateObjectId(),
      name: `Default ${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)}`,
      email: `default_${normalizedRole}@example.com`,
      role: normalizedRole,
      avatarUrl: `https://picsum.photos/seed/${normalizedRole}/100/100`
    };
    
    // Create response with user data
    const response = NextResponse.json(defaultUser);
    
    // Set cookies for authentication
    response.cookies.set({
      name: 'userId',
      value: defaultUser.id,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      });
        response.cookies.set({
        name: 'userRole',
        value: normalizedRole,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',      });
      
      return response;
  } catch (error) {
    console.error('Role login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
