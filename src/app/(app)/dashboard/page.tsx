import React from 'react';
import { getServerUser } from '../../../lib/server-auth';
import type { UserRole } from '../../../types';
import { StudentDashboard } from '../../../components/dashboards/student-dashboard';
import { TeacherDashboard } from '../../../components/dashboards/teacher-dashboard';
import { AdminDashboard } from '../../../components/dashboards/admin-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import Link from 'next/link';
import { Button } from '../../../components/ui/button';

export default async function DashboardPage() {
  // Try to get the user from server auth
  let user = await getServerUser();
  
  // Fallback for demo mode: If server-side auth fails, check for a userRole cookie
  if (!user) {    const { cookies } = await import('next/headers');    try {
      const cookieStore = await cookies();
      // Access the cookie value correctly
      const userRoleCookie = cookieStore.get('userRole')?.value;
      
      if (userRoleCookie) {        // Create a demo user for the role
        user = {
          id: '00000000-0000-0000-0000-000000000000',
          name: `Demo ${userRoleCookie.charAt(0).toUpperCase() + userRoleCookie.slice(1)}`,
          email: `demo_${userRoleCookie}@example.com`,
          role: userRoleCookie as UserRole,
          avatarUrl: `https://picsum.photos/seed/${userRoleCookie}/100/100`
        };
        console.log(`[DashboardPage] Created demo user for role: ${userRoleCookie}`);
      }
    } catch (error) {
      console.error("[DashboardPage] Error creating fallback user:", error);
    }
  }
  
  // Log user information
  if (user) {
    console.log(`[DashboardPage] Rendering dashboard for user: ${user.name}, role: ${user.role}`);
  } else {
    console.error("[DashboardPage] User object is null or undefined.");
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              Could not retrieve user information. Please try logging in again.
            </AlertDescription>
          </Alert>
           <Button asChild><Link href="/login">Go to Login</Link></Button>
      </div>
    );
  }  // Normalize the role to lowercase for consistent comparison
  const normalizedRole = user.role.toLowerCase();

  // Debug information - visible in development
  console.log(`[DashboardPage] Rendering dashboard for normalized role: ${normalizedRole}`);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back, {user.name}!</CardTitle>
          <CardDescription>Here&apos;s what&apos;s happening on Miftah Platform today.</CardDescription>
        </CardHeader>
      </Card>      
      {/* Development helper - will show role in dev tools but not on page */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="sr-only">{`Debug - User role: "${user.role}" (Normalized: "${normalizedRole}")`}</div>
      )}
      
      {/* Rendering the appropriate dashboard based on normalized role */}
      {normalizedRole === 'student' && <StudentDashboard user={user} />}
      {normalizedRole === 'teacher' && <TeacherDashboard user={user} />}
      {normalizedRole === 'admin' && <AdminDashboard user={user} />}
      
      {/* Fallback for unknown roles */}
      {!['student', 'teacher', 'admin'].includes(normalizedRole) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
          <p>Unknown user role: {user.role}</p>
          <p>Please contact support if you believe this is an error.</p>
        </div>
      )}
    </div>
  );
}