import React from 'react';
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, Activity, Server, Database } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';

export default async function AdminHealthPage() {
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
  
  // Mock health status
  const systemStatus = {
    api: { name: 'API Service', status: 'Operational', icon: <Server className="h-5 w-5 text-accent" /> },
    database: { name: 'Database', status: 'Operational', icon: <Database className="h-5 w-5 text-accent" /> },
    // Add more services as needed
  };

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
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">System Health</CardTitle>
              <CardDescription>Monitor the status of platform services and view logs.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(systemStatus).map(([key, service]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
              <div className="flex items-center space-x-3">
                {service.icon}
                <span className="font-medium">{service.name}</span>
              </div>
              <Badge variant={service.status === 'Operational' ? 'default' : 'destructive'} className={service.status === 'Operational' ? 'bg-accent text-accent-foreground' : ''}>
                {service.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>System Logs (Placeholder)</CardTitle>
            <CardDescription>Recent system activity logs will be displayed here.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-64 bg-muted/50 rounded-md p-4 text-sm text-muted-foreground overflow-auto">
                <p>[{new Date().toLocaleString()}] INFO: User &apos;admin_001&apos; accessed health page.</p>
                <p>[{new Date(Date.now() - 5*60000).toLocaleString()}] INFO: Database connection successful.</p>
                <p>[{new Date(Date.now() - 10*60000).toLocaleString()}] WARN: High CPU usage detected on API server (mock).</p>
                 {/* More logs would be dynamically loaded here */}
            </div>
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
