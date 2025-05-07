'use client';

import type { User } from '@/types';
import { mockUsers, mockCourses } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BookOpen, Settings, ShieldAlert, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  // In a real app, fetch these stats from the backend.
  const totalUsers = mockUsers.length;
  const totalCourses = mockCourses.length;
  const totalTeachers = mockUsers.filter(u => u.role === 'teacher').length;
  const totalStudents = mockUsers.filter(u => u.role === 'student').length;

  const userDistributionData = [
    { name: 'Students', count: totalStudents, fill: 'var(--color-students)' },
    { name: 'Teachers', count: totalTeachers, fill: 'var(--color-teachers)' },
    { name: 'Admins', count: mockUsers.filter(u => u.role === 'admin').length, fill: 'var(--color-admins)' },
  ];

  const courseDistributionData = [
    { name: 'Primary', count: mockCourses.filter(c => c.category === 'Primary').length, fill: 'var(--color-primary-cat)' },
    { name: 'Middle', count: mockCourses.filter(c => c.category === 'Middle').length, fill: 'var(--color-middle-cat)' },
    { name: 'Secondary', count: mockCourses.filter(c => c.category === 'Secondary').length, fill: 'var(--color-secondary-cat)' },
  ];

  const chartConfig = {
    students: { label: 'Students', color: 'hsl(var(--chart-1))' },
    teachers: { label: 'Teachers', color: 'hsl(var(--chart-2))' },
    admins: { label: 'Admins', color: 'hsl(var(--chart-3))' },
    'primary-cat': { label: 'Primary', color: 'hsl(var(--chart-4))' },
    'middle-cat': { label: 'Middle', color: 'hsl(var(--chart-5))' },
    'secondary-cat': { label: 'Secondary', color: 'hsl(var(--chart-1))' }, // Re-use for variation
  } satisfies import('@/components/ui/chart').ChartConfig;


  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={totalUsers.toString()} icon={<Users className="h-6 w-6 text-primary" />} />
        <StatCard title="Total Courses" value={totalCourses.toString()} icon={<BookOpen className="h-6 w-6 text-primary" />} />
        <StatCard title="Total Teachers" value={totalTeachers.toString()} icon={<Users className="h-6 w-6 text-accent" />} />
        <StatCard title="Total Students" value={totalStudents.toString()} icon={<Users className="h-6 w-6 text-secondary-foreground" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown of user roles on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDistributionData} layout="vertical" margin={{ right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent hideLabel />} />
                  <Legend />
                  <Bar dataKey="count" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Course Categories</CardTitle>
            <CardDescription>Distribution of courses across educational levels.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseDistributionData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                  <Legend />
                  <Bar dataKey="count" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Administrative Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AdminActionCard
            title="User Management"
            description="Manage all user accounts, roles, and permissions."
            icon={<Users className="h-8 w-8 text-primary" />}
            link="/admin/users"
            actionText="Manage Users"
          />
          <AdminActionCard
            title="Platform Settings"
            description="Configure global settings for the Miftah Platform."
            icon={<Settings className="h-8 w-8 text-primary" />}
            link="/admin/settings"
            actionText="Configure Settings"
          />
          <AdminActionCard
            title="System Health"
            description="Monitor system status, logs, and performance."
            icon={<Activity className="h-8 w-8 text-primary" />}
            link="/admin/health"
            actionText="View System Health"
          />
          <AdminActionCard
            title="Content Moderation"
            description="Review and manage reported content or user activity."
            icon={<ShieldAlert className="h-8 w-8 text-destructive" />}
            link="/admin/moderation"
            actionText="Moderate Content"
          />
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon}
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  actionText: string;
}

function AdminActionCard({ title, description, icon, link, actionText }: AdminActionCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex-row items-center space-x-4 pb-4">
        {icon}
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={link}>{actionText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
