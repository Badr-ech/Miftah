import type { Course, CourseMaterial, Assignment } from '../../../../types';
import { getCurrentUser } from '../../../../lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { FileText, Video, Link as LinkIcon, ListChecks, Edit3, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../../components/ui/avatar';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";

interface CourseDetailPageProps {
  params: { courseId: string };
}

// Extended types for database responses
interface DBCourseMaterial {
  id: string;
  title: string;
  type: string;
  description: string | null;
  url: string | null;
  content: string | null;
  uploadedAt: string;
}

interface DBAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  totalPoints: number | null;
}

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
  materials: DBCourseMaterial[];
  assignments: DBAssignment[];
  studentsCount: number;
  materialsCount: number;
  assignmentsCount: number;
  isEnrolled?: boolean;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const paramsObj = await params;
  const courseId = paramsObj.courseId;
  const user = await getCurrentUser();

  // Fetch course data from the API
  let course: DBCourse | null = null;
  let materials: DBCourseMaterial[] = [];
  let assignments: DBAssignment[] = [];
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses/${courseId}`, {
      cache: 'no-store', // Don't cache the response
      next: { tags: ['courses', `course-${courseId}`] }, // Cache tags for revalidation
    });
    
    if (response.ok) {
      course = await response.json();
      materials = course?.materials || [];
      assignments = course?.assignments || [];
    }
  } catch (error) {
    console.error('Error fetching course:', error);
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] gap-4">
        <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Course Not Found</AlertTitle>
            <AlertDescription>
            The course you are looking for does not exist or may have been removed.
            </AlertDescription>
          </Alert>
           <Button asChild><Link href="/courses">Back to Courses</Link></Button>
      </div>
    );
  }

  const isTeacherOwner = user?.role === 'teacher' && user.id === course.teacher.id;
  const isAdmin = user?.role === 'admin';
  // For students, use the enrollment status from the API
  const isEnrolledStudent = user?.role === 'student' && course.isEnrolled; 

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="p-0 relative">
          <Image
            src={course.imageUrl || `https://picsum.photos/seed/${course.id}/1200/400`}
            alt={course.title}
            data-ai-hint="course banner"
            width={1200}
            height={400}
            className="object-cover w-full h-64 md:h-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 md:p-8">
            <Badge variant="secondary" className="mb-2 bg-opacity-80 backdrop-blur-sm">{course.category}</Badge>
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary-foreground">{course.title}</CardTitle>
            <CardDescription className="text-md md:text-lg text-primary-foreground/90 mt-1 max-w-3xl">
              {course.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={course.teacher.avatarUrl || undefined} alt={course.teacher.name} data-ai-hint="teacher avatar" />
                <AvatarFallback>{course.teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{course.teacher.name}</p>
                <p className="text-sm text-muted-foreground">Instructor</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">About this course</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {/* Longer description or syllabus highlights could go here */}
                Welcome to {course.title}! This course is designed to provide a comprehensive understanding of {course.category.toLowerCase()} level concepts. 
                Throughout this course, you will engage with various materials, complete assignments, and have the opportunity to interact with your peers and instructor.
                <br/><br/>
                Key learning objectives:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Objective 1 specific to this course.</li>
                  <li>Objective 2 related to the subject matter.</li>
                  <li>Objective 3 focusing on skill development.</li>
                </ul>
              </p>
            </div>
          </div>
          <div className="md:col-span-1 space-y-4">
             <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Course Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Students:</strong> {course.studentsCount || 'N/A'}</p>
                <p><strong>Last Updated:</strong> {new Date(course.updatedAt).toLocaleDateString()}</p>
                <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
            {(isTeacherOwner || isAdmin) && (
              <Button asChild className="w-full">
                <Link href={`/teacher/courses/${course.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Course
                </Link>
              </Button>
            )}
            {isEnrolledStudent && (
              <Button className="w-full bg-accent hover:bg-accent/90">
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete (Demo)
              </Button>
            )}
            {!isEnrolledStudent && user && user.role !== 'teacher' && (
                 <Button className="w-full">Enroll Now</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="materials" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:max-w-sm">
          <TabsTrigger value="materials">
            <FileText className="mr-2 h-4 w-4" /> Course Materials ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <ListChecks className="mr-2 h-4 w-4" /> Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>        <TabsContent value="materials">
          <div className="space-y-4 mt-4">
            {materials.length > 0 ? materials.map(material => (
              <MaterialItem key={material.id} material={material} />
            )) : <p className="text-muted-foreground p-4 text-center">No materials uploaded for this course yet.</p>}
          </div>
        </TabsContent><TabsContent value="assignments">
          <div className="space-y-4 mt-4">
            {assignments.length > 0 ? assignments.map(assignment => (
              <AssignmentItem key={assignment.id} assignment={assignment} courseId={courseId} />
            )) : <p className="text-muted-foreground p-4 text-center">No assignments posted for this course yet.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MaterialItem({ material }: { material: DBCourseMaterial }) {
  const getIcon = () => {
    switch (material.type) {
      case 'file': return <FileText className="h-5 w-5 text-primary" />;
      case 'video': return <Video className="h-5 w-5 text-primary" />;
      case 'link': return <LinkIcon className="h-5 w-5 text-primary" />;
      case 'text': return <FileText className="h-5 w-5 text-primary" />; // Or a different icon for text content
      default: return <FileText className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <h4 className="font-semibold text-foreground">{material.title}</h4>
            <p className="text-xs text-muted-foreground">Type: {material.type} | Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
          </div>
        </div>
        {material.url && (material.type === 'file' || material.type === 'video' || material.type === 'link') && (
          <Button variant="outline" size="sm" asChild>
            <a href={material.url} target="_blank" rel="noopener noreferrer">
              {material.type === 'file' ? <Download className="mr-2 h-4 w-4" /> : null}
              {material.type === 'file' ? 'Download' : 'View'} 
            </a>
          </Button>
        )}
         {material.type === 'text' && (
          <Button variant="outline" size="sm">View Content</Button>
        )}
      </CardContent>
    </Card>
  );
}

function AssignmentItem({ assignment, courseId }: { assignment: DBAssignment, courseId: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-foreground">{assignment.title}</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-2">{assignment.description}</p>
            <p className="text-xs text-muted-foreground">
              Due: {new Date(assignment.dueDate).toLocaleDateString()}
              {assignment.totalPoints !== null && ` | Points: ${assignment.totalPoints}`}
            </p>
          </div>
          <Button variant="default" size="sm" asChild>
            <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>View Assignment</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
