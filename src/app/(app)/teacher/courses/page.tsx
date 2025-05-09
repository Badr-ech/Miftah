
import { getCurrentUser } from '../../../../lib/auth';
import { mockCourses } from '../../../../lib/mock-data';
import type { Course, User } from '../../../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Eye, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';

export default async function TeacherCoursesPage() {
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

  // In a real app, fetch courses taught by this teacher.
  const coursesTaught = mockCourses.filter(course => course.teacher.id === user.id);

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">Manage Your Courses</CardTitle>
              <CardDescription>
                View, edit, or create new courses.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/teacher/courses/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Course
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {coursesTaught.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesTaught.map((course) => (
            <Card key={course.id} className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
              <CardHeader className="p-0 relative">
                <Link href={`/courses/${course.id}`}>
                  <Image
                    src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/200`}
                    alt={course.title}
                    data-ai-hint="course image"
                    width={400}
                    height={200}
                    className="object-cover w-full h-40 hover:opacity-90 transition-opacity"
                  />
                </Link>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                  <Link href={`/courses/${course.id}`}>{course.title}</Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mb-3">
                  {course.category} | {course.studentsCount || 0} Students
                </CardDescription>
                <p className="text-xs text-muted-foreground h-10 overflow-hidden text-ellipsis">
                  {course.description}
                </p>
              </CardContent>
              <CardFooter className="p-4 bg-muted/30 border-t flex justify-between items-center">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/teacher/courses/${course.id}/edit`}>
                    <Edit3 className="mr-2 h-4 w-4" /> Manage
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/courses/${course.id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <CardTitle>No Courses Found</CardTitle>
            <CardDescription className="mt-2">
              You haven&apos;t created any courses yet. Get started by creating your first course.
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/teacher/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
