-- PostgreSQL Setup Script for Miftah Educational Platform
-- This script sets up the database and creates some sample data
-- Run this script as the postgres superuser

-- Create database
CREATE DATABASE miftah;
\c miftah;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema (optional, Prisma uses public by default)
-- CREATE SCHEMA miftah;

-- Create user roles enum type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER', 'ADMIN');
    END IF;
END
$$;

-- Create material type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'material_type') THEN
        CREATE TYPE material_type AS ENUM ('FILE', 'VIDEO', 'LINK', 'TEXT');
    END IF;
END
$$;

-- Create submission status enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'LATE');
    END IF;
END
$$;

-- Create users table
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "emailVerified" TIMESTAMP,
    password VARCHAR(255),
    "avatarUrl" VARCHAR(255),
    role user_role NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS "Course" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    "imageUrl" VARCHAR(255),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "teacherId" UUID NOT NULL,
    FOREIGN KEY ("teacherId") REFERENCES "User" (id)
);

-- Create course enrollment table
CREATE TABLE IF NOT EXISTS "CourseEnrollment" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "enrolledAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "lastAccessed" TIMESTAMP NOT NULL DEFAULT NOW(),
    progress FLOAT NOT NULL DEFAULT 0,
    "userId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" (id) ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course" (id) ON DELETE CASCADE,
    UNIQUE ("userId", "courseId")
);

-- Create course materials table
CREATE TABLE IF NOT EXISTS "CourseMaterial" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type material_type NOT NULL,
    url VARCHAR(255),
    content TEXT,
    "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "courseId" UUID NOT NULL,
    FOREIGN KEY ("courseId") REFERENCES "Course" (id) ON DELETE CASCADE
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS "Assignment" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "dueDate" TIMESTAMP NOT NULL,
    "totalPoints" INTEGER,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "courseId" UUID NOT NULL,
    FOREIGN KEY ("courseId") REFERENCES "Course" (id) ON DELETE CASCADE
);

-- Create assignment submissions table
CREATE TABLE IF NOT EXISTS "AssignmentSubmission" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    grade VARCHAR(10),
    status submission_status NOT NULL DEFAULT 'PENDING',
    content TEXT,
    feedback TEXT,
    "assignmentId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    FOREIGN KEY ("assignmentId") REFERENCES "Assignment" (id) ON DELETE CASCADE,
    FOREIGN KEY ("studentId") REFERENCES "User" (id) ON DELETE CASCADE,
    UNIQUE ("assignmentId", "studentId")
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "Message" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    "sentAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "senderId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    FOREIGN KEY ("senderId") REFERENCES "User" (id) ON DELETE CASCADE,
    FOREIGN KEY ("receiverId") REFERENCES "User" (id) ON DELETE CASCADE
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS "Announcement" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "authorId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    FOREIGN KEY ("authorId") REFERENCES "User" (id) ON DELETE CASCADE,
    FOREIGN KEY ("courseId") REFERENCES "Course" (id) ON DELETE CASCADE
);

-- Create student progress table
CREATE TABLE IF NOT EXISTS "StudentProgress" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "completedAssignments" INTEGER NOT NULL DEFAULT 0,
    "totalAssignments" INTEGER NOT NULL DEFAULT 0,
    "overallGrade" VARCHAR(10),
    "lastUpdated" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" UUID UNIQUE NOT NULL,
    "courseId" VARCHAR(255) NOT NULL,
    UNIQUE ("userId", "courseId")
);

-- Create indexes for better performance
CREATE INDEX idx_course_teacher_id ON "Course" ("teacherId");
CREATE INDEX idx_enrollment_user_id ON "CourseEnrollment" ("userId");
CREATE INDEX idx_enrollment_course_id ON "CourseEnrollment" ("courseId");
CREATE INDEX idx_material_course_id ON "CourseMaterial" ("courseId");
CREATE INDEX idx_assignment_course_id ON "Assignment" ("courseId");
CREATE INDEX idx_submission_assignment_id ON "AssignmentSubmission" ("assignmentId");
CREATE INDEX idx_submission_student_id ON "AssignmentSubmission" ("studentId");
CREATE INDEX idx_message_sender_id ON "Message" ("senderId");
CREATE INDEX idx_message_receiver_id ON "Message" ("receiverId");
CREATE INDEX idx_announcement_author_id ON "Announcement" ("authorId");
CREATE INDEX idx_announcement_course_id ON "Announcement" ("courseId");

-- Insert sample admin user (password: admin123)
INSERT INTO "User" (id, name, email, password, "avatarUrl", role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Mr. Omar Admin', 'omar.admin@example.com', '$2a$10$6OjwkzHoY0oXc6NVsJTcE.YSVXxB8wNLQnvs3XqYgQmiuA.Bi7Ir2', 'https://picsum.photos/seed/omar/100/100', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert sample teachers (password: teacher123)
INSERT INTO "User" (id, name, email, password, "avatarUrl", role)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'Prof. Fatima Teacher', 'fatima.teacher@example.com', '$2a$10$jMdudPAGv.Td5DzqhkA2YeSzYdYs1VDxiUuQBMTKzOyF9se5FaRem', 'https://picsum.photos/seed/fatima/100/100', 'TEACHER'),
  ('00000000-0000-0000-0000-000000000003', 'Mr. Ali Educator', 'ali.educator@example.com', '$2a$10$jMdudPAGv.Td5DzqhkA2YeSzYdYs1VDxiUuQBMTKzOyF9se5FaRem', 'https://picsum.photos/seed/ali/100/100', 'TEACHER')
ON CONFLICT (email) DO NOTHING;

-- Insert sample students (password: student123)
INSERT INTO "User" (id, name, email, password, "avatarUrl", role)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 'Amina Student', 'amina.student@example.com', '$2a$10$yffGsYK7NKA5DeM.6FZK2OCNKlr7CsLIyvPe/8vHv.J9TDWnH3KX.', 'https://picsum.photos/seed/amina/100/100', 'STUDENT'),
  ('00000000-0000-0000-0000-000000000005', 'Youssef Learner', 'youssef.learner@example.com', '$2a$10$yffGsYK7NKA5DeM.6FZK2OCNKlr7CsLIyvPe/8vHv.J9TDWnH3KX.', 'https://picsum.photos/seed/youssef/100/100', 'STUDENT')
ON CONFLICT (email) DO NOTHING;

-- Insert sample courses
INSERT INTO "Course" (id, title, description, category, "imageUrl", "teacherId", "createdAt", "updatedAt")
VALUES 
  ('00000000-0000-0000-0000-000000000010', 'Primary Mathematics Fundamentals', 'Introduction to basic arithmetic, shapes, and problem-solving for young learners.', 'Primary', 'https://picsum.photos/seed/math_primary/600/400', '00000000-0000-0000-0000-000000000002', '2023-08-01', '2023-10-15'),
  ('00000000-0000-0000-0000-000000000011', 'Middle School Arabic Language', 'Grammar, reading comprehension, and writing skills in Arabic for middle school students.', 'Middle', 'https://picsum.photos/seed/arabic_middle/600/400', '00000000-0000-0000-0000-000000000003', '2023-08-05', '2023-11-01')
ON CONFLICT (id) DO NOTHING;

-- Insert sample enrollments
INSERT INTO "CourseEnrollment" (id, "userId", "courseId", progress, "lastAccessed")
VALUES
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 65, NOW()),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000011', 30, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample materials
INSERT INTO "CourseMaterial" (id, title, type, url, "courseId")
VALUES
  ('00000000-0000-0000-0000-000000000030', 'Introduction to Numbers', 'VIDEO', 'https://example.com/videos/intro-numbers.mp4', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000031', 'Shapes Worksheet', 'FILE', 'https://example.com/files/shapes-worksheet.pdf', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000032', 'Arabic Alphabet', 'VIDEO', 'https://example.com/videos/arabic-alphabet.mp4', '00000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;

-- Insert sample assignments
INSERT INTO "Assignment" (id, title, description, "dueDate", "totalPoints", "courseId")
VALUES
  ('00000000-0000-0000-0000-000000000040', 'Addition Worksheet', 'Complete the addition problems on the worksheet.', '2024-05-20', 100, '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000041', 'Grammar Exercise 1', 'Complete the grammar exercises in the textbook.', '2024-05-25', 50, '00000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;

-- Insert sample submissions
INSERT INTO "AssignmentSubmission" (id, "studentId", "assignmentId", status, grade, content, feedback)
VALUES
  ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000040', 'GRADED', 'A', 'Submission content goes here...', 'Excellent work! All problems correctly solved.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample announcements
INSERT INTO "Announcement" (id, title, content, "authorId", "courseId")
VALUES
  ('00000000-0000-0000-0000-000000000060', 'Welcome to Mathematics Class', 'Welcome to our Mathematics class. I look forward to teaching you all!', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010'),
  ('00000000-0000-0000-0000-000000000061', 'Arabic Language Class Update', 'Please remember to complete your homework assignments on time.', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000011')
ON CONFLICT (id) DO NOTHING;
