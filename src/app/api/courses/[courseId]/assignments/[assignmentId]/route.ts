import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface RouteParams {
  params: {
    courseId: string;
    assignmentId: string;
  };
}

export async function GET(
  _request: Request, 
  { params }: RouteParams
) {
  try {
    const { assignmentId } = params;

    // Get assignment details with submissions count
    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { assignmentId } = params;
    const body = await request.json();
    
    // Update assignment
    const updatedAssignment = await db.assignment.update({
      where: { id: assignmentId },
      data: {
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
        totalPoints: body.totalPoints || null,
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const { assignmentId } = params;
    
    // Delete assignment (cascades to submissions)
    await db.assignment.delete({
      where: { id: assignmentId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
