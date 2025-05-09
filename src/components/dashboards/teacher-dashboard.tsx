import type { User, Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Users, BarChartHorizontalBig, Eye } from 'lucide-react';
import { use } from 'react';

interface TeacherDashboardProps {
  user: User;
}

async function fetchTeacherCourses(teacherId: string): Promise<Course[]> {
  try {
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/api/courses`);
    apiUrl.searchParams.append('teacherId', teacherId);
    
    const response = await fetch(apiUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      console.error('Failed to fetch teacher courses:', await response.text());
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return [];
  }
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  // Fetch courses taught by this teacher from the API
  const coursesTaughtPromise = fetchTeacherCourses(user.id);
  const coursesTaught = use(coursesTaughtPromise);

  const summaryStats = {
    totalCourses: coursesTaught.length,
    totalStudents: coursesTaught.reduce((sum, course) => sum + (course.studentsCount || 0), 0),
    assignmentsToGrade: 5, // Mock data
  };

  return (
    <div className="space-y-6">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard title="Total Courses" value={summaryStats.totalCourses.toString()} icon={<BookTextIcon className="h-6 w-6 text-primary" />} />
          <StatCard title="Total Students" value={summaryStats.totalStudents.toString()} icon={<Users className="h-6 w-6 text-primary" />} />
          <StatCard title="Assignments to Grade" value={summaryStats.assignmentsToGrade.toString()} icon={<BarChartHorizontalBig className="h-6 w-6 text-primary" />} link="/teacher/grading" />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-foreground">My Courses</h2>
          <Button asChild>
            <Link href="/teacher/courses/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Course
            </Link>
          </Button>
        </div>
        {coursesTaught.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesTaught.map((course) => (
              <Card key={course.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                   <Image 
                    src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/200`} 
                    alt={course.title}
                    data-ai-hint="course teaching"
                    width={400} 
                    height={200} 
                    className="object-cover w-full h-40" 
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-1">{course.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-2">
                    {course.category} | {course.studentsCount || 0} Students
                  </CardDescription>
                  <p className="text-xs text-muted-foreground h-10 overflow-hidden text-ellipsis">
                    {course.description}
                  </p>
                </CardContent>
                <CardFooter className="p-4 bg-muted/30 flex justify-between items-center">
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
            <CardContent className="p-6 text-center text-muted-foreground">
              <p className="mb-2">You haven&apos;t created any courses yet.</p>
              <Button asChild>
                <Link href="/teacher/courses/new">Create Your First Course</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Placeholder for recent student submissions or other relevant teacher info */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                    <CardTitle className="text-lg">View Student Analytics</CardTitle>
                    <CardDescription>Track overall student performance and engagement.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" asChild><Link href="/teacher/analytics">Go to Analytics</Link></Button>
                </CardFooter>
            </Card>
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                    <CardTitle className="text-lg">Communication Center</CardTitle>
                    <CardDescription>Manage announcements and messages with students.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" asChild><Link href="/teacher/communication">Open Messages</Link></Button>
                </CardFooter>
            </Card>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  link?: string;
}

function StatCard({ title, value, icon, link }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </>
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {link ? <Link href={link} className="block">{content}</Link> : content}
      </CardContent>
    </Card>
  );
}

function BookTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  )
}
