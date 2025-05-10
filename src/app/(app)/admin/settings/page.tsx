
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, Settings } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  // Normalize the role for consistent checking
  const normalizedRole = user?.role?.toLowerCase();
  if (!user || normalizedRole !== 'admin') {
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
