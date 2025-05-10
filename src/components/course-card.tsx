import React from 'react';
import type { Course } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Book, BarChart2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
      <CardHeader className="p-0 relative">
        <Image
          src={course.imageUrl || `https://picsum.photos/seed/${course.id}/400/225`}
          alt={course.title}
          data-ai-hint="course image"
          width={400}
          height={225}
          className="object-cover w-full h-48"
        />
        <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
          {course.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl mb-2 leading-tight h-14 overflow-hidden">
          <Link href={`/courses/${course.id}`} className="hover:text-primary transition-colors">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-3 h-16 overflow-hidden text-ellipsis">
          {course.description}
        </CardDescription>
        <div className="flex items-center text-xs text-muted-foreground space-x-3 mt-auto">
          <span className="flex items-center">
            <Users className="h-3.5 w-3.5 mr-1" /> {course.studentsCount || 0} Students
          </span>
          <span className="flex items-center">
            <Book className="h-3.5 w-3.5 mr-1" /> {course.materialsCount || 0} Materials
          </span>
          <span className="flex items-center">
            <BarChart2 className="h-3.5 w-3.5 mr-1" /> {course.assignmentsCount || 0} Assignments
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          By: {course.teacher.name}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-muted/20 border-t">
        <Button asChild size="sm" className="w-full">
          <Link href={`/courses/${course.id}`}>
            View Course <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
