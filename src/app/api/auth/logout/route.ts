import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear authentication cookies
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
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
