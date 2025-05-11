import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('[auth/logout] Processing logout request');
    
    // Get hostname from request for domain debugging
    const host = request.headers.get('host') || 'unknown-host';
    
    // Create response
    const response = NextResponse.json({ success: true });
    
    // Get domain setting based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction 
      ? (process.env.NEXT_PUBLIC_APP_DOMAIN || undefined) 
      : undefined;
      
    // Remove www prefix if present for better cookie compatibility
    const domainWithoutWww = domain?.replace(/^www\./, '') || undefined;
    
    console.log(`[auth/logout] Clearing cookies with domain: ${domainWithoutWww || 'default'}, host: ${host}, environment: ${process.env.NODE_ENV}`);
    
    // Clear authentication cookies
    response.cookies.set({
      name: 'userId',
      value: '',
      path: '/',
      maxAge: 0, // Expires immediately
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      domain: domainWithoutWww,
    });
    
    response.cookies.set({
      name: 'userRole',
      value: '',
      path: '/',
      maxAge: 0, // Expires immediately
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      domain: domainWithoutWww,
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
