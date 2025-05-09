
import { mockCourses, mockCourseAssignments } from '../../../../../../lib/mock-data';
import type { Course, Assignment } from '../../../../../../types';
import { getCurrentUser } from '../../../../../../lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../../../components/ui/card';
import { Button } from '../../../../../../components/ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from "../../../../../../components/ui/alert";
import { AlertCircle, CalendarDays, CheckSquare, Edit, FileText, Info } from 'lucide-react';
import { Badge } from '../../../../../../components/ui/badge';

interface AssignmentDetailPageProps {
  params: {
    courseId: string;
    assignmentId: string;
  };
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const { courseId, assignmentId } = params;
  const user = await getCurrentUser();

  // In a real app, fetch this data from an API
  const course: Course | undefined = mockCourses.find(c => c.id === courseId);
  const courseAssignments: Assignment[] | undefined = mockCourseAssignments[courseId];
  const assignment: Assignment | undefined = courseAssignments?.find(a => a.id === assignmentId);

  if (!course || !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Assignment Not Found</AlertTitle>
          <AlertDescription>
            The assignment you are looking for does not exist or may have been removed.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/courses/${courseId}`}>Back to Course</Link>
        </Button>
      </div>
    );
  }

  const isStudent = user?.role === 'student';
  // Add logic for teacher/admin if needed (e.g., edit assignment button)
  const isTeacherOwner = user?.role === 'teacher' && user.id === course.teacher.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
                <Link href={`/courses/${courseId}`} className="text-sm text-primary hover:underline mb-1 block">
                    &larr; Back to {course.title}
                </Link>
                <CardTitle className="text-3xl font-bold">{assignment.title}</CardTitle>
                <CardDescription className="text-md text-muted-foreground mt-1">
                    Assignment details and submission portal.
                </CardDescription>
            </div>
            {(isTeacherOwner || isAdmin) && (
                <Button asChild variant="outline">
                    <Link href={`/teacher/courses/${courseId}/assignments/${assignmentId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Assignment
                    </Link>
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" /> Description
                </h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {assignment.description}
                </p>
              </div>

              {isStudent && (
                <Card className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckSquare className="mr-2 h-5 w-5 text-accent" /> Submit Your Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for submission UI */}
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload your assignment file(s) or provide a text submission below.
                    </p>
                    <div className="space-y-4">
                       <Button disabled> {/* Disabled for demo */}
                        <FileText className="mr-2 h-4 w-4" /> Upload File (Coming Soon)
                      </Button>
                      {/* <Textarea placeholder="Or type your submission here..." rows={5} /> */}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full md:w-auto bg-accent hover:bg-accent/90" disabled> {/* Disabled for demo */}
                      Submit Assignment (Coming Soon)
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            <div className="md:col-span-1 space-y-4">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Info className="mr-2 h-5 w-5" /> Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p><strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}</p>
                  </div>
                  {assignment.totalPoints && (
                    <div className="flex items-center">
                      <CheckSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p><strong>Total Points:</strong> {assignment.totalPoints}</p>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Badge variant={course.category === "Primary" ? "default" : course.category === "Middle" ? "secondary" : "outline"}>
                        {course.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
