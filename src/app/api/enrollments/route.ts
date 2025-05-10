import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    console.log('[API] GET /api/enrollments - Starting request');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      console.log('[API] GET /api/enrollments - Missing userId parameter');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`[API] GET /api/enrollments - Fetching enrollments for userId: ${userId}`);// Define type for the enrollment query result
    type EnrollmentWithCourse = {
      userId: string;
      courseId: string;
      progress: number;
      lastAccessed: Date;
      course: {
        id: string;
        title: string;
        description: string;
        category: string;
        imageUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        teacherId: string;
        teacher: {
          id: string;
          name: string;
          avatarUrl: string | null;
        };
        _count: {
          materials: number;
          assignments: number;
        };
      };
    };

    // Get courses the user is enrolled in
    const enrollments = await db.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                materials: true,
                assignments: true,
              },
            },
          },
        },
      },
    }) as EnrollmentWithCourse[];    // Transform data to match expected format
    const enrolledCourses = enrollments.map((enrollment: EnrollmentWithCourse) => ({
      ...enrollment.course,
      progress: enrollment.progress,
      lastAccessed: enrollment.lastAccessed,
      materialsCount: enrollment.course._count.materials,
      assignmentsCount: enrollment.course._count.assignments,
    }));

    return NextResponse.json(enrolledCourses);
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId } = body;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: 'User ID and Course ID are required' },
        { status: 400 }
      );
    }

    // Check if user already enrolled
    const existingEnrollment = await db.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'User already enrolled in this course' },
        { status: 409 }
      );
    }

    // Create new enrollment
    const newEnrollment = await db.courseEnrollment.create({
      data: {
        userId,
        courseId,
        progress: 0,
        lastAccessed: new Date(),
      },
    });

    return NextResponse.json(newEnrollment, { status: 201 });  } catch (error) {
    console.error('Error enrolling in course:', error);
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
