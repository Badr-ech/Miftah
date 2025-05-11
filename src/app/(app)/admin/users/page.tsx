import React from 'react';
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, Users } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';


export default async function AdminUsersPage() {
  let user = await getCurrentUser();
  // Fallback: if no user but cookies exist, create a demo admin
  if (!user && (typeof document !== 'undefined' && (document.cookie.includes('userId=') || document.cookie.includes('userRole=')))) {
    user = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Demo Admin',
      email: 'demo_admin@example.com',
      role: 'admin',
      avatarUrl: 'https://picsum.photos/seed/admin/100/100'
    };
  }
  const isDemo = user?.id === '00000000-0000-0000-0000-000000000000';
  if (!user || (user.role && user.role.toLowerCase() !== 'admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to view this page.</AlertDescription>
        </Alert>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {isDemo && (
        <Alert variant="default" className="max-w-md mx-auto">
          <AlertTitle>Demo Mode</AlertTitle>
          <AlertDescription>You are viewing this page in demo mode. Some features may be limited.</AlertDescription>
        </Alert>
      )}
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">User Management</CardTitle>
              <CardDescription>View, edit, and manage user accounts on the platform.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          {/* Add search/filter controls here */}
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">User listing and management tools will be displayed here.</p>
          {/* Example Table Structure (Uncomment and adapt when data is available)
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" disabled>Edit (Soon)</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          */}
        </CardContent>
      </Card>
      <div className="text-center">
        <Button variant="link" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
