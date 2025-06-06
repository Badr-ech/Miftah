import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { getServerUser } from '../../../lib/server-auth';

export async function GET(
  request: Request
) {
  try {
    console.log('[API] GET /api/courses - Starting request');
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const teacherId = searchParams.get('teacherId');
    
    console.log(`[API] GET /api/courses - Filters: category=${category || 'none'}, query=${query || 'none'}, teacherId=${teacherId || 'none'}`);// Build filter conditions based on parameters
    const whereCondition: {
      category?: string;
      teacherId?: string;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {};

    if (category) {
      whereCondition.category = category;
    }

    if (teacherId) {
      whereCondition.teacherId = teacherId;
    }

    if (query) {
      whereCondition.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }// Define a type for the course query result
    type CourseWithCounts = {
      id: string;
      title: string;
      description: string;
      category: string;
      imageUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      teacher: {
        id: string;
        name: string;
        avatarUrl: string | null;
      };
      materials: { id: string }[];
      assignments: { id: string }[];
      enrollments: { id: string }[];
    };

    // Get courses with their teacher info and counts
    const courses = await db.course.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        teacher: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        materials: {
          select: {
            id: true,
          },
        },
        assignments: {
          select: {
            id: true,
          },
        },
        enrollments: {
          select: {
            id: true,
          },
        },
      },
    }) as CourseWithCounts[];    console.log(`[API] GET /api/courses - Found ${courses.length} courses`);
    
    // Transform the data to include counts
    const transformedCourses = courses.map((course: CourseWithCounts) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      teacher: course.teacher,
      imageUrl: course.imageUrl,
      materialsCount: course.materials.length,
      assignmentsCount: course.assignments.length,
      studentsCount: course.enrollments.length,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));

    return NextResponse.json(transformedCourses);  } catch (error) {
    console.error('Error fetching courses:', error);
    // More detailed error response
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name || 'Unknown'
      },
      { status: 500 }
    );
  }
}

// Add POST method to create a new course
export async function POST(
  request: Request
) {
  try {    const user = await getServerUser();
    
    // Only teachers can create courses - normalize role
    const normalizedRole = user?.role?.toLowerCase();
    if (!user || normalizedRole !== 'teacher') {
      console.warn(`[API courses] Access denied: user role ${user?.role} (normalized: ${normalizedRole})`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get course data from request body
    const courseData = await request.json();
    
    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the course
    const newCourse = await db.course.create({
      data: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        imageUrl: courseData.imageUrl || null,
        teacherId: user.id,
      },
    });
    
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
