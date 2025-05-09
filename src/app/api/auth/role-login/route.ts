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
    // Generate a proper UUID for the user ID that Postgres will accept
    function generateUUID() {
      // This creates a valid UUID v4
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    
    const defaultUser = {
      id: generateUUID(),
      name: `Default ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `default_${role}@example.com`,
      role: role.toLowerCase(),
      avatarUrl: `https://picsum.photos/seed/${role}/100/100`
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
        value: role.toLowerCase(),
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
