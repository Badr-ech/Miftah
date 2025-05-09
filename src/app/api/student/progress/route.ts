import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerUser } from '@/lib/server-auth';

export async function GET(
  request: Request
) {
  try {
    const user = await getServerUser();
    
    // Only students can view their progress
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all courses the student is enrolled in
    const enrollments = await db.courseEnrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              }
            },
            assignments: {
              select: {
                id: true,
              }
            },
            materials: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    });

    // Transform data for the frontend
    const progressData = enrollments.map(enrollment => {
      // Calculate progress percentage
      const progressPercentage = enrollment.progress || 0;
      
      // Get assignment stats
      const totalAssignments = enrollment.course.assignments.length;
      
      // In a real app, you would calculate completed assignments
      // Here we're using a mock value based on progress
      const completedAssignments = Math.floor((progressPercentage / 100) * totalAssignments);

      return {
        id: enrollment.course.id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        category: enrollment.course.category,
        imageUrl: enrollment.course.imageUrl,
        teacher: enrollment.course.teacher,
        progress: progressPercentage,
        lastAccessed: enrollment.lastAccessed,
        progressDetail: {
          courseId: enrollment.course.id,
          totalAssignments,
          completedAssignments,
          materialsCount: enrollment.course.materials.length,
          overallGrade: calculateGrade(progressPercentage), // Mock function
        }
      };
    });

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to calculate a letter grade based on percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}
