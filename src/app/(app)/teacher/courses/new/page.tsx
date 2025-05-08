
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, PlusCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CourseCategory } from '@/types';


export default async function NewCoursePage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to create a new course.</AlertDescription>
        </Alert>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }
  
  const categories: CourseCategory[] = ["Primary", "Middle", "Secondary"];

  // This would be a form
  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <PlusCircle className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Create New Course</CardTitle>
              <CardDescription>Fill in the details to create a new course.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Placeholder for form fields */}
           <div>
              <Label htmlFor="newCourseTitle">Course Title</Label>
              <Input id="newCourseTitle" placeholder="e.g., Introduction to Algebra" />
          </div>
          <div>
              <Label htmlFor="newCourseDescription">Description</Label>
              <Textarea id="newCourseDescription" placeholder="A brief overview of the course content and objectives." rows={5} />
          </div>
          <div>
              <Label htmlFor="newCourseCategory">Category</Label>
              <Select>
                <SelectTrigger id="newCourseCategory">
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
          </div>
          {/* Add more fields: image upload, initial materials/assignments setup etc. */}
          <Button disabled>Create Course (Coming Soon)</Button>
        </CardContent>
      </Card>
       <div className="text-center">
        <Button variant="link" asChild>
            <Link href="/teacher/courses">Cancel and Back to My Courses</Link>
        </Button>
      </div>
    </div>
  );
}
