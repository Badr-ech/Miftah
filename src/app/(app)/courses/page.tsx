import React from 'react';
import type { Course, CourseCategory } from '../../../types';
import { CourseCard } from '../../../components/course-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Input } from '../../../components/ui/input';
import { Search } from 'lucide-react';
import { CourseFilters } from '../../../components/course-filters';

interface CoursesPageProps {
  searchParams: {
    query?: string;
    category?: CourseCategory;
  };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { query, category } = searchParams;

  // Fetch courses from API based on query parameters
  const apiUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/api/courses`);
  
  if (query) {
    apiUrl.searchParams.append('query', query);
  }
  
  if (category) {
    apiUrl.searchParams.append('category', category);
  }
  
  const response = await fetch(apiUrl, { cache: 'no-store' });
  let filteredCourses: Course[] = [];
  
  if (response.ok) {
    filteredCourses = await response.json();
  } else {
    console.error('Failed to fetch courses:', await response.text());
  }

  const categories: CourseCategory[] = ["Primary", "Middle", "Secondary"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Explore Courses</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find the perfect course to expand your knowledge and skills.
        </p>
      </div>
      
      <CourseFilters initialQuery={query} initialCategory={category} />

      <Tabs defaultValue={category || "all"} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:max-w-md mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <CourseGrid courses={filteredCourses} />
        </TabsContent>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat}>
            <CourseGrid courses={filteredCourses.filter(c => c.category === cat)} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function CourseGrid({ courses }: { courses: Course[] }) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground">No Courses Found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filters.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
