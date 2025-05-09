import { PrismaClient } from '../src/generated/prisma/client';
import { hash } from 'bcryptjs';
import { ObjectId } from 'bson';

// Define enums manually since they aren't being properly imported
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

enum MaterialType {
  FILE = 'FILE', 
  VIDEO = 'VIDEO', 
  LINK = 'LINK', 
  TEXT = 'TEXT'
}

enum SubmissionStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  LATE = 'LATE'
}

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database with MongoDB...');

    // Create admin user
    const adminPassword = await hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log('Created admin user:', admin.name);

    // Create teacher
    const teacherPassword = await hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@example.com' },
      update: {},
      create: {
        name: 'Teacher User',
        email: 'teacher@example.com',
        password: teacherPassword,
        role: UserRole.TEACHER,
      },
    });
    console.log('Created teacher user:', teacher.name);

    // Create student
    const studentPassword = await hash('student123', 10);
    const student = await prisma.user.upsert({
      where: { email: 'student@example.com' },
      update: {},
      create: {
        name: 'Student User',
        email: 'student@example.com',
        password: studentPassword,
        role: UserRole.STUDENT,
      },
    });    console.log('Created student user:', student.name);

    // Create course with teacher
    // No need to generate a course ID manually, MongoDB will do this for us
    
    // First check if any course with matching title exists
    const existingCourse = await prisma.course.findFirst({
      where: {
        title: 'Introduction to MongoDB'
      }
    });

    // Create or update course based on existence
    let course;
    if (existingCourse) {
      course = await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          description: 'A comprehensive introduction to MongoDB NoSQL database.',
          category: 'Database',
          teacherId: teacher.id,
        },
      });
    } else {
      course = await prisma.course.create({
        data: {
          title: 'Introduction to MongoDB',
          description: 'A comprehensive introduction to MongoDB NoSQL database.',
          category: 'Database',
          teacherId: teacher.id,
        },
      });
    }
    console.log('Created course:', course.title);

    // Create course materials
    const material = await prisma.courseMaterial.create({
      data: {
        title: 'Getting Started with MongoDB',
        type: MaterialType.TEXT,
        content: 'MongoDB is a document-oriented NoSQL database used for high volume data storage.',
        courseId: course.id,
      },
    });
    console.log('Created course material:', material.title);

    // Create assignment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const assignment = await prisma.assignment.create({
      data: {
        title: 'MongoDB Basics',
        description: 'Complete the basic MongoDB operations tutorial.',
        dueDate: tomorrow,
        totalPoints: 100,
        courseId: course.id,
      },
    });
    console.log('Created assignment:', assignment.title);

    // Enroll student in course
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        progress: 0,
      },
    });
    console.log('Enrolled student in course');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
