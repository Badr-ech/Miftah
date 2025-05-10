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

// Helper function to generate dates
const getRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get a future date
const getFutureDate = (daysAhead: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date;
};

async function main() {
  try {
    console.log('Seeding database with MongoDB...');
    await clearExistingData();

    // Create admin users
    const admins = await createAdmins();
    
    // Create teachers
    const teachers = await createTeachers();
    
    // Create students
    const students = await createStudents();
    
    // Create courses
    const courses = await createCourses(teachers);
    
    // Create course materials, assignments, and enrollments
    await populateCoursesWithData(courses, students);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function clearExistingData() {
  console.log('Clearing existing data...');
  await prisma.assignmentSubmission.deleteMany({});
  await prisma.assignment.deleteMany({});
  await prisma.courseMaterial.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Existing data cleared');
}

async function createAdmins() {
  console.log('Creating admin users...');
  
  const adminData = [
    { name: 'Admin User', email: 'admin@example.com', password: 'admin123' },
    { name: 'System Admin', email: 'sysadmin@example.com', password: 'sysadmin456' }
  ];
  
  const admins = [];
  
  for (const data of adminData) {
    const hashedPassword = await hash(data.password, 10);
    const admin = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    admins.push(admin);
    console.log('Created admin user:', admin.name);
  }
  
  return admins;
}

async function createTeachers() {
  console.log('Creating teacher users...');
  
  const teacherData = [
    { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@example.com', password: 'teacher123' },
    { name: 'Prof. Michael Lee', email: 'michael.lee@example.com', password: 'teacher456' },
    { name: 'Dr. Emily Chen', email: 'emily.chen@example.com', password: 'teacher789' },
    { name: 'Prof. Robert Wilson', email: 'robert.wilson@example.com', password: 'teacher101' },
    { name: 'Dr. Priya Sharma', email: 'priya.sharma@example.com', password: 'teacher202' }
  ];
  
  const teachers = [];
  
  for (const data of teacherData) {
    const hashedPassword = await hash(data.password, 10);
    const teacher = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.TEACHER,
      },
    });
    teachers.push(teacher);
    console.log('Created teacher user:', teacher.name);
  }
  
  return teachers;
}

async function createStudents() {
  console.log('Creating student users...');
  
  const studentData = [
    { name: 'Alex Thompson', email: 'alex.thompson@example.com', password: 'student123' },
    { name: 'Emma Rodriguez', email: 'emma.rodriguez@example.com', password: 'student456' },
    { name: 'Jamal Williams', email: 'jamal.williams@example.com', password: 'student789' },
    { name: 'Sophie Kim', email: 'sophie.kim@example.com', password: 'student101' },
    { name: 'Carlos Mendez', email: 'carlos.mendez@example.com', password: 'student202' },
    { name: 'Aisha Patel', email: 'aisha.patel@example.com', password: 'student303' },
    { name: 'Tyler Johnson', email: 'tyler.johnson@example.com', password: 'student404' },
    { name: 'Olivia Chan', email: 'olivia.chan@example.com', password: 'student505' },
    { name: 'Marcus Brown', email: 'marcus.brown@example.com', password: 'student606' },
    { name: 'Zoe Garcia', email: 'zoe.garcia@example.com', password: 'student707' }
  ];
  
  const students = [];
  
  for (const data of studentData) {
    const hashedPassword = await hash(data.password, 10);
    const student = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    });
    students.push(student);
    console.log('Created student user:', student.name);
  }
  
  return students;
}

async function createCourses(teachers: any[]) {
  console.log('Creating courses...');
  
  const courseData = [
    {
      title: 'Introduction to MongoDB',
      description: 'A comprehensive introduction to MongoDB NoSQL database with hands-on exercises.',
      category: 'Database',
      imageUrl: 'https://example.com/images/mongodb.jpg',
      teacherId: teachers[0].id
    },
    {
      title: 'Advanced Web Development',
      description: 'Master the latest frameworks and tools for modern web application development.',
      category: 'Web Development',
      imageUrl: 'https://example.com/images/webdev.jpg',
      teacherId: teachers[1].id
    },
    {
      title: 'Data Science Fundamentals',
      description: 'Learn the core concepts and tools for data analysis and visualization.',
      category: 'Data Science',
      imageUrl: 'https://example.com/images/datascience.jpg',
      teacherId: teachers[2].id
    },
    {
      title: 'Cloud Computing with AWS',
      description: 'Deploy scalable applications using Amazon Web Services infrastructure.',
      category: 'Cloud Computing',
      imageUrl: 'https://example.com/images/aws.jpg',
      teacherId: teachers[3].id
    },
    {
      title: 'Mobile App Development',
      description: 'Create cross-platform mobile applications using React Native.',
      category: 'Mobile Development',
      imageUrl: 'https://example.com/images/mobiledev.jpg',
      teacherId: teachers[4].id
    },
    {
      title: 'Artificial Intelligence Basics',
      description: 'Introduction to AI concepts, machine learning algorithms, and practical applications.',
      category: 'Artificial Intelligence',
      imageUrl: 'https://example.com/images/ai.jpg',
      teacherId: teachers[0].id
    }
  ];
  
  const courses = [];
  
  for (const data of courseData) {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: data.imageUrl,
        teacherId: data.teacherId,
      },
    });
    courses.push(course);
    console.log('Created course:', course.title);
  }
  
  return courses;
}

async function populateCoursesWithData(courses: any[], students: any[]) {
  for (const course of courses) {
    // Create course materials
    await createCourseMaterials(course.id);
    
    // Create assignments
    await createAssignments(course.id);
    
    // Enroll random students
    await enrollRandomStudents(course.id, students);
    
    // Create announcements
    await createAnnouncements(course);
  }
}

async function createCourseMaterials(courseId: string) {
  console.log(`Creating materials for course ${courseId}...`);
  
  const materialData = [
    {
      title: 'Getting Started Guide',
      type: MaterialType.TEXT,
      content: 'This comprehensive guide will help you get started with the course content and requirements.'
    },
    {
      title: 'Introduction Video',
      type: MaterialType.VIDEO,
      url: 'https://example.com/videos/intro-lecture.mp4'
    },
    {
      title: 'Additional Resources',
      type: MaterialType.LINK,
      url: 'https://example.com/resources/additional-reading'
    },
    {
      title: 'Week 1 Slides',
      type: MaterialType.FILE,
      url: 'https://example.com/files/week1-slides.pdf'
    },
    {
      title: 'Key Concepts Overview',
      type: MaterialType.TEXT,
      content: 'This document outlines all the key concepts that will be covered in this course, with detailed explanations and examples.'
    }
  ];
  
  // Add some randomization - not all courses get all materials
  const materialsToCreate = materialData.slice(0, Math.floor(Math.random() * 3) + 3);
  
  for (const data of materialsToCreate) {
    const material = await prisma.courseMaterial.create({
      data: {
        ...data,
        courseId,
      },
    });
    console.log('Created course material:', material.title);
  }
}

async function createAssignments(courseId: string) {
  console.log(`Creating assignments for course ${courseId}...`);
  
  const assignmentData = [
    {
      title: 'Week 1 Quiz',
      description: 'Complete this quiz to test your understanding of the first week concepts.',
      totalPoints: 50
    },
    {
      title: 'Midterm Project',
      description: 'Develop a small project implementing the concepts learned in the first half of the course.',
      totalPoints: 200
    },
    {
      title: 'Final Exam',
      description: 'Comprehensive exam covering all course materials and concepts.',
      totalPoints: 300
    },
    {
      title: 'Research Paper',
      description: 'Write a research paper on a topic related to the course content.',
      totalPoints: 150
    },
    {
      title: 'Group Presentation',
      description: 'Prepare and deliver a group presentation on an assigned topic.',
      totalPoints: 100
    }
  ];
  
  // Add some randomization - not all courses get all assignments
  const assignmentsToCreate = assignmentData.slice(0, Math.floor(Math.random() * 3) + 2);
  
  for (let i = 0; i < assignmentsToCreate.length; i++) {
    const data = assignmentsToCreate[i];
    const dueDate = getFutureDate((i + 1) * 7); // Each assignment due a week apart
    
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        dueDate,
        courseId,
      },
    });
    console.log('Created assignment:', assignment.title);
  }
}

async function enrollRandomStudents(courseId: string, students: any[]) {
  console.log(`Enrolling students in course ${courseId}...`);
  
  // Shuffle students array
  const shuffled = [...students].sort(() => 0.5 - Math.random());
  
  // Select random number of students (between 3 and 8)
  const selectedStudents = shuffled.slice(0, Math.floor(Math.random() * 6) + 3);
  
  for (const student of selectedStudents) {
    const progress = Math.random() * 100; // Random progress between 0 and 100
    
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: student.id,
        courseId: courseId,
        progress: progress,
        lastAccessed: getRandomDate(new Date(2025, 0, 1), new Date()) // Random date in 2025 up to now
      },
    });
    console.log(`Enrolled student ${student.name} in course with progress ${progress.toFixed(2)}%`);
  }
}

async function createAnnouncements(course: any) {
  console.log(`Creating announcements for course ${course.id}...`);
  
  const announcementData = [
    {
      title: 'Welcome to the course!',
      content: 'Welcome to our course! I\'m excited to have you all joining this semester. Please review the syllabus and reach out if you have any questions.'
    },
    {
      title: 'Assignment Update',
      content: 'The deadline for the first assignment has been extended by 3 days. Please submit your work by the new deadline.'
    },
    {
      title: 'Guest Lecture Announcement',
      content: 'We will have an industry expert joining us next week for a special lecture. Attendance is highly recommended.'
    }
  ];
  
  // Add some randomization - not all courses get all announcements
  const announcementsToCreate = announcementData.slice(0, Math.floor(Math.random() * 2) + 1);
  
  for (const data of announcementsToCreate) {
    const announcement = await prisma.announcement.create({
      data: {
        ...data,
        authorId: course.teacherId,
        courseId: course.id,
        createdAt: getRandomDate(new Date(2025, 3, 1), new Date()) // Random date in April 2025 up to now
      },
    });
    console.log('Created announcement:', announcement.title);
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
