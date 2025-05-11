import React from 'react';
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';

export default async function AdminSettingsPage() {
  let user = await getCurrentUser();
  const normalizedRole = user?.role?.toLowerCase();
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
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Platform Settings</CardTitle>
              <CardDescription>Configure global settings for the Miftah Platform.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Various platform configuration options will be available here.</p>
          {/* Example Setting Field (Uncomment and adapt)
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <Label htmlFor="maintenance-mode" className="font-semibold">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable access for non-admins.</p>
            </div>
            <Switch id="maintenance-mode" disabled />
          </div>
          <div>
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input id="platform-name" defaultValue="Miftah Platform" disabled />
          </div>
          */}
          <Button disabled>Save Settings (Coming Soon)</Button>
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
