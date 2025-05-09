import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    courseId: string;
  };
}

export async function GET(
  _request: Request, 
  { params }: RouteParams
) {
  try {
    const { courseId } = params;

    // Get assignments for a specific course
    const assignments = await db.assignment.findMany({
      where: { courseId },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteParams
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
    
    // Create new assignment
    const newAssignment = await db.assignment.create({
      data: {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        totalPoints: body.totalPoints || null,
        courseId: courseId,
      },
    });

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
