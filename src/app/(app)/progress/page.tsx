import React from 'react';
import { getCurrentUser } from '../../../lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { AlertCircle, BookOpen, ListChecks, TrendingUp } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';

// Define types for database responses
interface CourseProgressDetail {
  courseId: string;
  totalAssignments: number;
  completedAssignments: number;
  materialsCount: number;
  overallGrade?: string;
}

interface EnrolledCourseWithProgress {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string | null;
  teacher: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  progress: number;
  lastAccessed: string;
  progressDetail: CourseProgressDetail;
}

export default async function ProgressOverviewPage() {
  // Get the user, but use a 'let' declaration instead of 'const' to allow reassigning
  let currentUser = await getCurrentUser();
  // Normalize the role for consistent checking
  const normalizedRole = currentUser?.role?.toLowerCase();
  
  // Be more lenient - if user exists but role is wrong, redirect to dashboard
  // If no user but we're in this page, assume cookies are valid and proceed
  if (currentUser && normalizedRole !== 'student') {
    console.log(`[ProgressPage] Wrong role: user role ${currentUser.role} (normalized: ${normalizedRole})`);
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="default" className="max-w-md bg-yellow-50 border-yellow-200 text-yellow-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Notice</AlertTitle>
          <AlertDescription>This page is designed for students. Returning to dashboard.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  // If no user object but we got past middleware, treat as a student
  if (!currentUser) {
    console.log("[ProgressPage] No user object but proceeding (cookies may be valid)");
    // Create a temporary demo user
    currentUser = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Demo Student',
      email: 'demo_student@example.com',
      role: 'student',
      avatarUrl: 'https://picsum.photos/seed/student/100/100'
    };
  }
  // Fetch enrolled courses and progress from the API
  let enrolledCourses: EnrolledCourseWithProgress[] = [];
  
  try {
    const response = await fetch('/api/student/progress', {
      cache: 'no-store', // Don't cache the response
      next: { tags: ['enrollments', 'progress'] }, // Cache tags for revalidation
      credentials: 'include' // Ensure cookies are sent with the request
    });
    
    if (response.ok) {
      enrolledCourses = await response.json();
    }
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">My Progress Overview</CardTitle>
            <CardDescription>Track your learning journey across all your courses.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <BookOpen className="h-4 w-4" />
              <AlertTitle>No Courses Enrolled</AlertTitle>
              <AlertDescription>
                You are not currently enrolled in any courses. Explore courses to start learning!
              </AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
                <CardTitle className="text-3xl font-bold">My Progress Overview</CardTitle>
                <CardDescription>Track your learning journey across all your courses.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => {
          const progressDetail = course.progressDetail;
          const overallProgressPercentage = course.progress || 0;

          return (
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
                <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
                  {course.category}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg mb-1 hover:text-primary transition-colors">
                  <Link href={`/courses/${course.id}`}>{course.title}</Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mb-3">
                  Instructor: {course.teacher.name}
                </CardDescription>
                
                <div className="space-y-2 mt-3">                  <div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>Overall Progress</span>
                      <span>{overallProgressPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={overallProgressPercentage} className="h-2" />
                  </div>
                  {progressDetail && (
                    <>
                      <p className="text-xs text-muted-foreground">
                        Assignments: {progressDetail.completedAssignments} / {progressDetail.totalAssignments} completed
                      </p>
                      {progressDetail.overallGrade && (
                        <p className="text-xs text-muted-foreground">
                          Overall Grade: <span className="font-semibold text-foreground">{progressDetail.overallGrade}</span>
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 bg-muted/30 border-t">
                <Button asChild variant="default" size="sm" className="w-full">
                  <Link href={`/progress/${course.id}`}>
                    <ListChecks className="mr-2 h-4 w-4" /> View Detailed Progress
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
