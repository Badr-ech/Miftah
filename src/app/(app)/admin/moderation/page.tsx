import React from 'react';
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, ShieldAlert, Flag, UserX, MessageCircleOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

export default async function AdminModerationPage() {
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

  // Mock data for reported items - replace with real data
  const reportedContent = [
    { id: 'rc001', type: 'Comment', contentSnippet: "This comment is inappropriate...", reportedBy: 'Youssef L.', date: new Date().toISOString(), status: 'Pending Review' },
    { id: 'rc002', type: 'Course Material', contentSnippet: "Copyrighted video uploaded to Physics I...", reportedBy: 'Fatima T.', date: new Date(Date.now() - 24*60*60*1000).toISOString(), status: 'Resolved' },
  ];
  const flaggedUsers = [
    { id: 'fu001', userName: 'TroubleMaker23', reason: 'Spamming forums', lastActivity: new Date(Date.now() - 2*24*60*60*1000).toISOString(), status: 'Warned' },
  ];

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
            <ShieldAlert className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Content Moderation</CardTitle>
              <CardDescription>Review reported content, manage flagged users, and maintain platform integrity.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reported-content" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-md">
          <TabsTrigger value="reported-content"><Flag className="mr-2 h-4 w-4" /> Reported Content</TabsTrigger>
          <TabsTrigger value="flagged-users"><UserX className="mr-2 h-4 w-4" /> Flagged Users</TabsTrigger>
        </TabsList>

        <TabsContent value="reported-content" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Reported Content</CardTitle>
              <CardDescription>Items reported by users for review.</CardDescription>
            </CardHeader>
            <CardContent>
              {reportedContent.length > 0 ? (
                <ul className="space-y-4">
                  {reportedContent.map(item => (
                    <li key={item.id} className="p-4 border rounded-md bg-muted/30 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-foreground">Type: {item.type} <span className="text-xs text-muted-foreground">({item.status})</span></p>
                          <p className="text-sm text-muted-foreground mt-1 italic">&ldquo;{item.contentSnippet}&rdquo;</p>
                          <p className="text-xs text-muted-foreground mt-1">Reported by: {item.reportedBy} on {new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>Review (Soon)</Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircleOff className="mx-auto h-12 w-12 mb-3" />
                  <p>No content currently reported for review.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flagged-users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Flagged Users</CardTitle>
              <CardDescription>Users flagged for violating community guidelines or terms of service.</CardDescription>
            </CardHeader>
            <CardContent>
              {flaggedUsers.length > 0 ? (
                <ul className="space-y-4">
                  {flaggedUsers.map(item => (
                     <li key={item.id} className="p-4 border rounded-md bg-muted/30 hover:shadow-sm">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-semibold text-foreground">{item.userName} <span className="text-xs text-muted-foreground">({item.status})</span></p>
                         <p className="text-sm text-muted-foreground mt-1">Reason: {item.reason}</p>
                         <p className="text-xs text-muted-foreground mt-1">Last Activity: {new Date(item.lastActivity).toLocaleDateString()}</p>
                       </div>
                       <Button variant="destructive" size="sm" disabled>Take Action (Soon)</Button>
                     </div>
                   </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserX className="mx-auto h-12 w-12 mb-3" />
                  <p>No users currently flagged.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button variant="link" asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
