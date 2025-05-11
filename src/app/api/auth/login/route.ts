import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { compare } from 'bcryptjs';
import type { UserRole } from '../../../../types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

  // Find user by email
    console.log(`[auth/login] Attempting login for email: ${email}`);
    
    try {
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          avatarUrl: true
        }
      });

      if (!user) {
        console.log(`[auth/login] No user found with email: ${email}`);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      if (!user.password) {
        console.log(`[auth/login] User found but has no password: ${email}`);
        return NextResponse.json(
          { error: 'Account exists but requires password reset' },
          { status: 401 }
        );
      }
    } catch (dbError) {
      console.error(`[auth/login] Database error when finding user:`, dbError);
      return NextResponse.json(
        { 
          error: 'Database error when authenticating', 
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      );
    }    // Verify password
    try {
      // Make sure we have a valid user object from the previous steps
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          avatarUrl: true
        }
      });
      
      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      console.log(`[auth/login] Found user, verifying password`);
      const passwordMatch = await compare(password, user.password);

      if (!passwordMatch) {
        console.log(`[auth/login] Password verification failed for user: ${email}`);
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }      
      console.log(`[auth/login] Login successful for user: ${email}`);
      
      // Create response with user data
      const response = NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        avatarUrl: user.avatarUrl
      });
      
            // After creating response but before setting cookies
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction 
        ? (process.env.NEXT_PUBLIC_APP_DOMAIN || undefined) 
        : undefined;
      
      console.log(`[auth/login] Setting cookies for: ${email}, environment: ${process.env.NODE_ENV}, domain: ${domain || 'default'}`);
      
      // Then update both cookie sets to include domain
      response.cookies.set({
        name: 'userId',
        value: user.id,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: domain,  // Add this
      });
      
      response.cookies.set({
        name: 'userRole',
        value: user.role.toLowerCase(),
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: domain,  // Add this
      });
      
      return response;
    } catch (passwordError) {
      console.error(`[auth/login] Error verifying password:`, passwordError);
      return NextResponse.json(
        { 
          error: 'Error verifying credentials', 
          details: passwordError instanceof Error ? passwordError.message : String(passwordError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
