
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, MessageSquare, Send } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function TeacherCommunicationPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'teacher') {
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

  // Mock data - replace with real data fetching and state management
  const announcements = [
    { id: 'anno1', title: 'Midterm Exam Schedule', date: '2024-05-10', content: 'The midterm exam for Physics I will be on May 20th.' },
    { id: 'anno2', title: 'Welcome to New Semester', date: '2024-01-15', content: 'Welcome back! Hope you had a great break.' },
  ];

  const messages = [
    { id: 'msg1', studentName: 'Amina Student', course: 'Primary Mathematics', snippet: 'I have a question about homework...', unread: true },
    { id: 'msg2', studentName: 'Youssef Learner', course: 'Middle School Arabic', snippet: 'Can you clarify the deadline for...', unread: false },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Communication Center</CardTitle>
              <CardDescription>Manage announcements and messages with your students.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-sm">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Announcements</CardTitle>
              <CardDescription>Post updates and important information for your students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Create New Announcement</h3>
                {/* Placeholder for form */}
                <div className="space-y-3 p-4 border rounded-md bg-muted/30">
                    <Input placeholder="Announcement Title" />
                    <Textarea placeholder="Announcement content..." rows={3}/>
                    {/* Add select for course if teacher has multiple courses */}
                    <Button disabled><Send className="mr-2 h-4 w-4" /> Post Announcement (Coming Soon)</Button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Existing Announcements</h3>
                {announcements.length > 0 ? (
                  <ul className="space-y-3">
                    {announcements.map(anno => (
                      <li key={anno.id} className="p-3 border rounded-md hover:shadow-sm">
                        <p className="font-semibold">{anno.title} <span className="text-xs text-muted-foreground">({anno.date})</span></p>
                        <p className="text-sm text-muted-foreground">{anno.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No announcements posted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Messages</CardTitle>
              <CardDescription>Respond to queries and communicate directly with students.</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <ul className="space-y-3">
                  {messages.map(msg => (
                    <li key={msg.id} className={`p-3 border rounded-md hover:shadow-sm ${msg.unread ? 'bg-primary/5 border-primary/50' : ''}`}>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">{msg.studentName} <span className="text-xs text-muted-foreground">({msg.course})</span></p>
                        {msg.unread && <span className="text-xs font-semibold text-primary">New</span>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.snippet}</p>
                       <Button variant="link" size="sm" className="p-0 h-auto mt-1" disabled>View Message (Coming Soon)</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">No messages yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center mt-8">
        <Button variant="link" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
