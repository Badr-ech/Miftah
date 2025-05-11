import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { RouteParams } from '../../../../types/next-params';

type CourseIdParams = RouteParams<{
  courseId: string;
}>;

export async function GET(
  _request: Request, 
  { params }: CourseIdParams
) {
  try {
    const paramsObj = await params;
    const courseId = paramsObj.courseId;

    // Get course details
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        materials: true,
        assignments: true,
        enrollments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform data to include counts
    const transformedCourse = {
      ...course,
      materialsCount: course.materials.length,
      assignmentsCount: course.assignments.length,
      studentsCount: course.enrollments.length,
    };

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
