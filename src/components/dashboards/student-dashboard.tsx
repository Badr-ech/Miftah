import React from 'react';
import type { User, EnrolledCourse, StudentProgress } from '../../types';
import { mockStudentProgress } from '../../lib/mock-data'; // We'll keep this for now, but replace it later
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookText, CheckCircle } from 'lucide-react';
import { use } from 'react';

interface StudentDashboardProps {
  user: User;
}

async function fetchEnrolledCourses(userId: string): Promise<EnrolledCourse[]> {
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/enrollments`);
  apiUrl.searchParams.append('userId', userId);
  
  const response = await fetch(apiUrl, { cache: 'no-store' });
  
  if (!response.ok) {
    console.error('Failed to fetch enrolled courses:', await response.text());
    return [];
  }
  
  return response.json();
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  // Fetch enrolled courses from the API
  const enrolledCoursesPromise = fetchEnrolledCourses(user.id);
  const enrolledCourses: EnrolledCourse[] = use(enrolledCoursesPromise);
  const progressSummary: StudentProgress[] = mockStudentProgress; // We'll keep this for now

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">My Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image 
                    src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/200`} 
                    alt={course.title}
                    data-ai-hint="course thumbnail"
                    width={400} 
                    height={200} 
                    className="object-cover w-full h-40" 
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden text-ellipsis">
                    {course.description}
                  </CardDescription>
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <Progress value={course.progress || 0} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 bg-muted/30">
                  <Button asChild variant="default" size="sm" className="w-full">
                    <Link href={`/courses/${course.id}`}>
                      Continue Learning <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <BookText className="mx-auto h-12 w-12 mb-4" />
              <p className="mb-2">You are not enrolled in any courses yet.</p>
              <Button asChild>
                <Link href="/courses">Explore Courses</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Recent Activity & Progress</h2>
        {progressSummary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {progressSummary.map((summary) => (
              <Card key={summary.courseId} className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">{summary.courseTitle}</CardTitle>
                  <CardDescription>
                    {summary.completedAssignments} / {summary.totalAssignments} assignments completed. 
                    {summary.overallGrade && ` Overall Grade: ${summary.overallGrade}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {summary.assignmentSubmissions?.slice(0, 3).map(sub => (
                      <li key={sub.assignmentId} className="flex items-center justify-between p-2 rounded-md bg-background hover:bg-muted/50 transition-colors">
                        <div className="flex items-center">
                          <CheckCircle className={`mr-2 h-4 w-4 ${sub.status === 'graded' || sub.status === 'submitted' ? 'text-accent' : 'text-muted-foreground'}`} />
                          <span>{sub.assignmentTitle}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            sub.status === 'graded' ? 'bg-accent/20 text-accent-foreground' : 
                            sub.status === 'submitted' ? 'bg-primary/20 text-primary-foreground' : 
                            'bg-muted text-muted-foreground'
                          }`}>
                          {sub.status === 'graded' && sub.grade ? `Graded: ${sub.grade}` : sub.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                   <Button asChild variant="outline" size="sm">
                    <Link href={`/progress/${summary.courseId}`}>View Full Progress</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <p>No progress information available yet.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
