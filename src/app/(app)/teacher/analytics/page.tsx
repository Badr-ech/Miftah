
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, BarChart3, Users } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
// Placeholder for chart components if needed later
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export default async function TeacherAnalyticsPage() {
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

  // Mock data for analytics - replace with real data fetching
  const analyticsData = {
    totalStudentsInCourses: 85, // Sum of students in all courses taught by this teacher
    averageCompletionRate: 65, // Percentage
    mostEngagedCourse: "Secondary School Physics I",
    leastEngagedCourse: "Primary French Introduction",
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">Student Analytics</CardTitle>
              <CardDescription>Overview of student performance and engagement in your courses.</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatDisplayCard title="Total Students Enrolled" value={analyticsData.totalStudentsInCourses.toString()} icon={<Users className="text-accent" />} />
        <StatDisplayCard title="Average Completion Rate" value={`${analyticsData.averageCompletionRate}%`} icon={<BarChart3 className="text-accent" />} />
        <StatDisplayCard title="Most Engaged Course" value={analyticsData.mostEngagedCourse} textIsSmall={true} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics (Placeholder)</CardTitle>
          <CardDescription>More charts and detailed breakdowns will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will include charts for student progress distribution, assignment submission rates,
            quiz performance, and more.
          </p>
          {/* Placeholder for charts:
          <ChartContainer config={{}} className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[]}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="uv" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          */}
        </CardContent>
      </Card>
      <div className="text-center">
        <Button variant="link" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

interface StatDisplayCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  textIsSmall?: boolean;
}

function StatDisplayCard({ title, value, icon, textIsSmall = false }: StatDisplayCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="h-5 w-5">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={`font-bold ${textIsSmall ? 'text-xl' : 'text-2xl'}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
