import { db } from '../src/lib/db';
import { mockUsers, mockCourses, mockEnrolledCourses } from '../src/lib/mock-data';
import { ObjectId } from 'bson';

// Define UserRole enum to match the one in the Prisma schema
enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

// Helper function to create MongoDB ObjectIds
function createId(): string {
  return new ObjectId().toString();
}

/**
 * This script helps migrate data from the mock data to the real database.
 * Run this script once to populate your database with the mock data.
 */
async function migrateData() {
  try {
    console.log('Starting data migration...');

    // Migrate users
    console.log('Migrating users...');
    for (const user of mockUsers) {      await db.user.upsert({
        where: { id: user.id },        update: {
          name: user.name,
          email: user.email,
          role: user.role.toUpperCase() as UserRole, // Cast to UserRole enum
          avatarUrl: user.avatarUrl,
        },        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toUpperCase() as UserRole, // Cast to UserRole enum
          avatarUrl: user.avatarUrl,
          password: 'password123', // Default password
        },
      });
    }
    console.log(`${mockUsers.length} users migrated successfully`);

    // Migrate courses
    console.log('Migrating courses...');
    for (const course of mockCourses) {
      await db.course.upsert({
        where: { id: course.id },
        update: {
          title: course.title,
          description: course.description,
          category: course.category,
          imageUrl: course.imageUrl,
          teacherId: course.teacher.id,
          createdAt: new Date(course.createdAt),
          updatedAt: new Date(course.updatedAt),
        },
        create: {
          id: course.id,
          title: course.title,
          description: course.description,
          category: course.category,
          imageUrl: course.imageUrl,
          teacherId: course.teacher.id,
          createdAt: new Date(course.createdAt),
          updatedAt: new Date(course.updatedAt),
        },
      });
    }
    console.log(`${mockCourses.length} courses migrated successfully`);

    // Migrate enrollments
    console.log('Migrating enrollments...');
    for (const course of mockEnrolledCourses) {
      // Assuming student001 is enrolled in all mockEnrolledCourses
      const userId = 'user_student_001';
      
      try {
        await db.courseEnrollment.upsert({
          where: {
            userId_courseId: {
              userId: userId,
              courseId: course.id,
            },
          },
          update: {
            progress: course.progress || 0,
            lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : new Date(),
          },
          create: {
            userId: userId,
            courseId: course.id,
            progress: course.progress || 0,
            lastAccessed: course.lastAccessed ? new Date(course.lastAccessed) : new Date(),
          },
        });
      } catch (err) {
        console.error(`Error enrolling user ${userId} in course ${course.id}:`, err);
      }
    }
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await db.$disconnect();
  }
}

// Run migration
migrateData();
