import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { RouteParams } from '../../../../../types/next-params';

type CourseIdParams = RouteParams<{
  courseId: string;
}>;

export async function GET(
  _request: Request, 
  { params }: CourseIdParams
) {
  try {
    const { courseId } = params;

    // Get materials for a specific course
    const materials = await db.courseMaterial.findMany({
      where: { courseId },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching course materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: CourseIdParams
) {
  try {
    const { courseId } = params;
    const body = await request.json();
    
    // Validate course exists
    const course = await db.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Create new material
    const newMaterial = await db.courseMaterial.create({
      data: {
        title: body.title,
        type: body.type,
        url: body.url,
        content: body.content,
        courseId: courseId,
      },
    });

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error('Error creating course material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
