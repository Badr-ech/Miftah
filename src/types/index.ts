
import React from 'react';
export type UserRole = "admin" | "teacher" | "student" | "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string; 
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: "file" | "video" | "link" | "text";
  url?: string; 
  content?: string; 
  uploadedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; 
  totalPoints?: number;
}

export type CourseCategory = "Primary" | "Middle" | "Secondary";

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  teacher: Pick<User, "id" | "name" | "avatarUrl">; 
  imageUrl?: string;
  materialsCount?: number;
  assignmentsCount?: number;
  studentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnrolledCourse extends Course {
  progress?: number; // 0-100
  lastAccessed?: string;
}

export interface AssignmentSubmission {
  assignmentId: string;
  assignmentTitle: string;
  submittedAt?: string;
  grade?: string;
  status: "submitted" | "pending" | "graded" | "late";
}

export interface StudentProgress {
  courseId: string;
  courseTitle: string;
  completedAssignments: number;
  totalAssignments: number;
  overallGrade?: string; 
  assignmentSubmissions?: AssignmentSubmission[];
}

// For navigation items in sidebar
export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  variant?: "default" | "ghost";
  label?: string;
  roles?: UserRole[]; // Roles that can see this nav item
  children?: NavItem[]; // For sub-menus
}
