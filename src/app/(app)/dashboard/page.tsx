import { getServerUser } from '../../../lib/server-auth';
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
  if (!user) {
    const { cookies } = await import('next/headers');
    try {
      const cookieStore = cookies();
      const roleCookie = cookieStore.get('userRole');
      
      if (roleCookie) {
        // Create a demo user for the role
        user = {
          id: '00000000-0000-0000-0000-000000000000',
          name: `Demo ${roleCookie.value.charAt(0).toUpperCase() + roleCookie.value.slice(1)}`,
          email: `demo_${roleCookie.value}@example.com`,
          role: roleCookie.value as any,
          avatarUrl: `https://picsum.photos/seed/${roleCookie.value}/100/100`
        };
        console.log(`[DashboardPage] Created demo user for role: ${roleCookie.value}`);
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
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome back, {user.name}!</CardTitle>
          <CardDescription>Here&apos;s what&apos;s happening on Miftah Platform today.</CardDescription>
        </CardHeader>
      </Card>      {/* Log the actual role value for debugging */}
      <div className="hidden">{`Debug - User role: "${user.role}" (Type: ${typeof user.role})`}</div>
      
      {/* Use case-insensitive comparison just to be safe */}
      {user.role.toLowerCase() === 'student' && <StudentDashboard user={user} />}
      {user.role.toLowerCase() === 'teacher' && <TeacherDashboard user={user} />}
      {user.role.toLowerCase() === 'admin' && <AdminDashboard user={user} />}
    </div>
  );
}