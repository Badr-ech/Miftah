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

// Helper function to create consistent MongoDB ObjectIds
function createId(): string {
  return new ObjectId().toString();
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
    console.log('Starting seed process...');

    // Create users with hashed passwords
    const defaultPassword = await hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'omar.admin@example.com' },
      update: {},
      create: {
        name: 'Mr. Omar Admin',
        email: 'omar.admin@example.com',
        role: UserRole.ADMIN,
        password: defaultPassword,
        avatarUrl: 'https://picsum.photos/seed/omar/100/100',
      },
    });
    console.log(`Admin user created: ${admin.name}`);

    // Create teacher users
    const teacher1 = await prisma.user.upsert({
      where: { email: 'fatima.teacher@example.com' },
      update: {},
      create: {
        name: 'Prof. Fatima Teacher',
        email: 'fatima.teacher@example.com',
        role: UserRole.TEACHER,
        password: defaultPassword,
        avatarUrl: 'https://picsum.photos/seed/fatima/100/100',
      },
    });
    console.log(`Teacher created: ${teacher1.name}`);

    const teacher2 = await prisma.user.upsert({
      where: { email: 'ali.educator@example.com' },
      update: {},
      create: {
        name: 'Mr. Ali Educator',
        email: 'ali.educator@example.com',
        role: UserRole.TEACHER,
        password: defaultPassword,
        avatarUrl: 'https://picsum.photos/seed/ali/100/100',
      },
    });
    console.log(`Teacher created: ${teacher2.name}`);

    // Create student users
    const student1 = await prisma.user.upsert({
      where: { email: 'amina.student@example.com' },
      update: {},
      create: {
        name: 'Amina Student',
        email: 'amina.student@example.com',
        role: UserRole.STUDENT,
        password: defaultPassword,
        avatarUrl: 'https://picsum.photos/seed/amina/100/100',
      },
    });
    console.log(`Student created: ${student1.name}`);

    const student2 = await prisma.user.upsert({
      where: { email: 'youssef.learner@example.com' },
      update: {},
      create: {
        name: 'Youssef Learner',
        email: 'youssef.learner@example.com',
        role: UserRole.STUDENT,
        password: defaultPassword,
        avatarUrl: 'https://picsum.photos/seed/youssef/100/100',
      },
    });
    console.log(`Student created: ${student2.name}`);

    // Create courses - use create instead of upsert to let PostgreSQL generate the UUIDs
    // First, clean up any existing courses with these titles to avoid conflicts
    await prisma.course.deleteMany({
      where: {
        OR: [
          { title: 'Primary Mathematics Fundamentals' },
          { title: 'Middle School Arabic Language' }
        ]
      }
    });
    
    const mathCourse = await prisma.course.create({
      data: {
        title: 'Primary Mathematics Fundamentals',
        description: 'Introduction to basic arithmetic, shapes, and problem-solving for young learners.',
        category: 'Primary',
        teacherId: teacher1.id,
        imageUrl: 'https://picsum.photos/seed/math_primary/600/400',
        createdAt: new Date('2023-08-01'),
        updatedAt: new Date('2023-10-15'),
      },
    });
    console.log(`Course created: ${mathCourse.title}`);

    const arabicCourse = await prisma.course.create({
      data: {
        title: 'Middle School Arabic Language',
        description: 'Grammar, reading comprehension, and writing skills in Arabic for middle school students.',
        category: 'Middle',
        teacherId: teacher2.id,
        imageUrl: 'https://picsum.photos/seed/arabic_middle/600/400',
        createdAt: new Date('2023-08-05'),
        updatedAt: new Date('2023-11-01'),
      },
    });
    console.log(`Course created: ${arabicCourse.title}`);

    // Before creating enrollments, delete any existing enrollments
    await prisma.courseEnrollment.deleteMany({
      where: {
        OR: [
          {
            userId: student1.id,
            courseId: mathCourse.id
          },
          {
            userId: student2.id,
            courseId: arabicCourse.id
          }
        ]
      }
    });

    // Create enrollments
    const enrollment1 = await prisma.courseEnrollment.create({
      data: {
        userId: student1.id,
        courseId: mathCourse.id,
        progress: 65,
        lastAccessed: new Date(),
      },
    });
    console.log(`Enrollment created for ${student1.name} in ${mathCourse.title}`);

    const enrollment2 = await prisma.courseEnrollment.create({
      data: {
        userId: student2.id,
        courseId: arabicCourse.id,
        progress: 30,
        lastAccessed: new Date(),
      },
    });
    console.log(`Enrollment created for ${student2.name} in ${arabicCourse.title}`);
    
    // Create course materials
    await prisma.courseMaterial.create({
      data: {
        title: 'Introduction to Numbers',
        type: MaterialType.VIDEO,
        url: 'https://example.com/videos/intro-numbers.mp4',
        courseId: mathCourse.id,
      },
    });

    await prisma.courseMaterial.create({
      data: {
        title: 'Shapes Worksheet',
        type: MaterialType.FILE,
        url: 'https://example.com/files/shapes-worksheet.pdf',
        courseId: mathCourse.id,
      },
    });

    await prisma.courseMaterial.create({
      data: {
        title: 'Arabic Alphabet',
        type: MaterialType.VIDEO,
        url: 'https://example.com/videos/arabic-alphabet.mp4',
        courseId: arabicCourse.id,
      },
    });

    console.log('Course materials created successfully');

    // Create assignments
    const mathAssignment = await prisma.assignment.create({
      data: {
        title: 'Addition Worksheet',
        description: 'Complete the addition problems on the worksheet.',
        dueDate: new Date('2024-05-20'),
        totalPoints: 100,
        courseId: mathCourse.id,
      },
    });

    const arabicAssignment = await prisma.assignment.create({
      data: {
        title: 'Grammar Exercise 1',
        description: 'Complete the grammar exercises in the textbook.',
        dueDate: new Date('2024-05-25'),
        totalPoints: 50,
        courseId: arabicCourse.id,
      },
    });

    console.log('Assignments created successfully');
    
    // Create assignment submissions
    await prisma.assignmentSubmission.create({
      data: {
        studentId: student1.id,
        assignmentId: mathAssignment.id,
        status: SubmissionStatus.GRADED,
        grade: 'A',
        content: 'Submission content goes here...',
        feedback: 'Excellent work! All problems correctly solved.',
      },
    });

    console.log('Assignment submissions created successfully');

    // Create announcements
    await prisma.announcement.create({
      data: {
        title: 'Welcome to Mathematics Class',
        content: 'Welcome to our Mathematics class. I look forward to teaching you all!',
        authorId: teacher1.id,
        courseId: mathCourse.id,
      },
    });

    await prisma.announcement.create({
      data: {
        title: 'Arabic Language Class Update',
        content: 'Please remember to complete your homework assignments on time.',
        authorId: teacher2.id,
        courseId: arabicCourse.id,
      },
    });

    console.log('Announcements created successfully');

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
