import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import type { UserRole } from '../../../../types';

export async function GET(request: Request) {
  try {
    // Read the request cookies
    const requestCookies = request.headers.get('cookie') || '';
    // Parse cookies manually
    const cookies_map = Object.fromEntries(
      requestCookies.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=');
        return [name, value];
      })
    );    const userId = cookies_map['userId'];
    
    if (!userId) {
      return NextResponse.json(null);
    }
    
    // Import the MongoDB helper functions
    const { ensureObjectId } = await import('../../../../lib/mongodb-helpers');
    
    // Convert UUID to MongoDB ObjectId if necessary
    const objectId = ensureObjectId(userId);
    
    if (!objectId) {
      console.error(`[auth/me] Invalid user ID format: ${userId}`);
      return NextResponse.json(null);
    }
    
    const user = await db.user.findUnique({
      where: { id: objectId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true
      }
    });
      if (!user) {
      // User ID in cookie doesn't match any user in DB
      // Create response with null data
      const response = NextResponse.json(null);
      
      // Clear cookies
      response.cookies.set({
        name: 'userId',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
      });
      
      response.cookies.set({
        name: 'userRole',
        value: '',
        path: '/',
        maxAge: 0, // Expires immediately
      });
      
      return response;
    }
      // Return user data
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() as UserRole,
      avatarUrl: user.avatarUrl
    });
    
    return response;
  } catch (error) {
    console.error('Error getting current user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
