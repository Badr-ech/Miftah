import React from 'react';
import { getCurrentUser } from '../../../../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import Link from 'next/link';
import { AlertCircle, Edit3 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../../../components/ui/alert';
import { Input } from '../../../../../../components/ui/input';
import { Label } from '../../../../../../components/ui/label';
import { Textarea } from '../../../../../../components/ui/textarea';
import { PagePropsWithParams } from '../../../../../../types/next-params';

type EditCoursePageProps = PagePropsWithParams<{
  courseId: string;
}>;

interface DBCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const user = await getCurrentUser();
  const courseId = params.courseId;

  // Fetch course from the API
  let course: DBCourse | null = null;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses/${courseId}`, {
      cache: 'no-store', // Don't cache the response
      next: { tags: ['courses', `course-${courseId}`] }, // Cache tags for revalidation
    });
    
    if (response.ok) {
      course = await response.json();
    }
  } catch (error) {
    console.error('Error fetching course:', error);
  }
  // Normalize the role for consistent checking
  const normalizedRole = user?.role?.toLowerCase();
  if (!user || normalizedRole !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to edit this course.</AlertDescription>
        </Alert>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  if (!course || course.teacher.id !== user.id) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Course Not Found</AlertTitle>
          <AlertDescription>The course you are trying to edit does not exist or you do not have permission to edit it.</AlertDescription>
        </Alert>
        <Button asChild><Link href="/teacher/courses">Back to My Courses</Link></Button>
      </div>
    );
  }

  // This would be a form, pre-filled with course data
  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Edit3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Edit Course: {course.title}</CardTitle>
              <CardDescription>Modify the details of your course.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Placeholder for form fields */}
            <div>
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input id="courseTitle" defaultValue={course.title} />
            </div>
            <div>
                <Label htmlFor="courseDescription">Description</Label>
                <Textarea id="courseDescription" defaultValue={course.description} rows={5} />
            </div>
            <div>
                <Label htmlFor="courseCategory">Category</Label>
                <Input id="courseCategory" defaultValue={course.category} />
            </div>
             {/* Add more fields as needed: materials, assignments management etc. */}
          <Button disabled>Save Changes (Coming Soon)</Button>
        </CardContent>
      </Card>
      <div className="text-center">
        <Button variant="link" asChild>
            <Link href={`/teacher/courses`}>Back to My Courses</Link>
        </Button>
      </div>
    </div>
  );
}
