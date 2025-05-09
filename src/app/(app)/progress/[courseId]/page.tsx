
import { getCurrentUser } from '../../../../lib/auth';
import { mockCourses, mockStudentProgress } from '../../../../lib/mock-data';
import type { Course, StudentProgress as StudentProgressType, AssignmentSubmission } from '../../../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../../../components/ui/alert';
import { AlertCircle, CheckCircle, FileText, ListChecks, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import Image from 'next/image';

interface CourseProgressPageProps {
  params: { courseId: string };
}

export default async function CourseProgressPage({ params }: CourseProgressPageProps) {
  const paramsObj = await params;
  const courseId = paramsObj.courseId;
  const user = await getCurrentUser();

  // In a real app, fetch this data from an API, scoped to the current user
  const course: Course | undefined = mockCourses.find(c => c.id === courseId);
  const studentProgress: StudentProgressType | undefined = mockStudentProgress.find(p => p.courseId === courseId);

  if (user?.role !== 'student') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>Only students can view their progress.</AlertDescription>
        </Alert>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }

  if (!course || !studentProgress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Progress Not Found</AlertTitle>
          <AlertDescription>
            Could not find progress information for this course.
          </AlertDescription>
        </Alert>
        <Button asChild><Link href="/dashboard">Back to Dashboard</Link></Button>
      </div>
    );
  }
  
  const overallProgressPercentage = studentProgress.totalAssignments > 0 
    ? (studentProgress.completedAssignments / studentProgress.totalAssignments) * 100 
    : 0;

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0 relative">
          <Image
            src={course.imageUrl || `https://picsum.photos/seed/${course.id}/1200/300`}
            alt={course.title}
            data-ai-hint="course banner"
            width={1200}
            height={300}
            className="object-cover w-full h-48 md:h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <Badge variant="secondary" className="mb-2 bg-opacity-80 backdrop-blur-sm">{course.category}</Badge>
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary-foreground">{course.title}</CardTitle>
            <CardDescription className="text-md text-primary-foreground/90 mt-1 max-w-2xl">
              Your progress in this course.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">Overall Progress</h3>
                <div className="flex items-center gap-4 mb-1">
                  <Progress value={overallProgressPercentage} className="h-3 flex-grow" />
                  <span className="font-semibold text-foreground">{overallProgressPercentage.toFixed(0)}%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {studentProgress.completedAssignments} of {studentProgress.totalAssignments} assignments completed.
                  {studentProgress.overallGrade && ` Current Overall Grade: ${studentProgress.overallGrade}`}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  <ListChecks className="inline-block mr-2 h-5 w-5" />
                  Assignment Status
                </h3>
                {studentProgress.assignmentSubmissions && studentProgress.assignmentSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {studentProgress.assignmentSubmissions.map(submission => (
                      <AssignmentStatusItem key={submission.assignmentId} submission={submission} courseId={course.id}/>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No assignments submitted or tracked yet for this course.</p>
                )}
              </div>
            </div>
            <div className="md:col-span-1 space-y-4">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Course Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Instructor:</strong> {course.teacher.name}</p>
                  <p><strong>Materials:</strong> {course.materialsCount || 0}</p>
                  <p><strong>Total Assignments:</strong> {course.assignmentsCount || studentProgress.totalAssignments}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/courses/${course.id}`}>
                      <FileText className="mr-2 h-4 w-4" /> Go to Course
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center">
        <Button asChild variant="link">
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

interface AssignmentStatusItemProps {
  submission: AssignmentSubmission;
  courseId: string;
}

function AssignmentStatusItem({ submission, courseId }: AssignmentStatusItemProps) {
  const statusColors = {
    graded: 'bg-accent/20 text-accent-foreground',
    submitted: 'bg-primary/20 text-primary-foreground',
    pending: 'bg-muted text-muted-foreground',
    late: 'bg-destructive/20 text-destructive-foreground',
  };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className={`h-5 w-5 ${submission.status === 'graded' || submission.status === 'submitted' ? 'text-accent' : 'text-muted-foreground'}`} />
          <div>
            <h4 className="font-semibold text-foreground">{submission.assignmentTitle}</h4>
            <p className="text-xs text-muted-foreground">
              Status: <span className={`capitalize font-medium px-1.5 py-0.5 rounded-sm text-xs ${statusColors[submission.status]}`}>{submission.status}</span>
              {submission.grade && ` | Grade: ${submission.grade}`}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          {/* This link assumes assignments are viewable under the course page structure */}
          <Link href={`/courses/${courseId}/assignments/${submission.assignmentId}`}>
            View
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

