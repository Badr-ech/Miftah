import type { Course, User, StudentProgress, EnrolledCourse, UserRole, CourseMaterial, Assignment } from '@/types';

export const mockUsers: User[] = [
  { id: 'user_student_001', name: 'Amina Student', email: 'amina.student@example.com', role: 'student', avatarUrl: 'https://picsum.photos/seed/amina/100/100' },
  { id: 'user_student_002', name: 'Youssef Learner', email: 'youssef.learner@example.com', role: 'student', avatarUrl: 'https://picsum.photos/seed/youssef/100/100' },
  { id: 'user_teacher_001', name: 'Prof. Fatima Teacher', email: 'fatima.teacher@example.com', role: 'teacher', avatarUrl: 'https://picsum.photos/seed/fatima/100/100' },
  { id: 'user_teacher_002', name: 'Mr. Ali Educator', email: 'ali.educator@example.com', role: 'teacher', avatarUrl: 'https://picsum.photos/seed/ali/100/100' },
  { id: 'user_admin_001', name: 'Mr. Omar Admin', email: 'omar.admin@example.com', role: 'admin', avatarUrl: 'https://picsum.photos/seed/omar/100/100' },
];

const defaultImageUrl = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

export const mockCourses: Course[] = [
  {
    id: 'course_math_001',
    title: 'Primary Mathematics Fundamentals',
    description: 'Introduction to basic arithmetic, shapes, and problem-solving for young learners.',
    category: 'Primary',
    teacher: { id: 'user_teacher_001', name: 'Prof. Fatima Teacher', avatarUrl: mockUsers[2].avatarUrl },
    imageUrl: defaultImageUrl('math_primary'),
    materialsCount: 15,
    assignmentsCount: 5,
    studentsCount: 25,
    createdAt: new Date(2023, 8, 1).toISOString(),
    updatedAt: new Date(2023, 10, 15).toISOString(),
  },
  {
    id: 'course_arabic_001',
    title: 'Middle School Arabic Language',
    description: 'Grammar, reading comprehension, and writing skills in Arabic for middle school students.',
    category: 'Middle',
    teacher: { id: 'user_teacher_002', name: 'Mr. Ali Educator', avatarUrl: mockUsers[3].avatarUrl },
    imageUrl: defaultImageUrl('arabic_middle'),
    materialsCount: 22,
    assignmentsCount: 8,
    studentsCount: 18,
    createdAt: new Date(2023, 8, 5).toISOString(),
    updatedAt: new Date(2023, 11, 1).toISOString(),
  },
  {
    id: 'course_physics_001',
    title: 'Secondary School Physics I',
    description: 'Introduction to classical mechanics, thermodynamics, and optics.',
    category: 'Secondary',
    teacher: { id: 'user_teacher_001', name: 'Prof. Fatima Teacher', avatarUrl: mockUsers[2].avatarUrl },
    imageUrl: defaultImageUrl('physics_secondary'),
    materialsCount: 30,
    assignmentsCount: 10,
    studentsCount: 30,
    createdAt: new Date(2023, 9, 1).toISOString(),
    updatedAt: new Date(2023, 11, 20).toISOString(),
  },
  {
    id: 'course_french_001',
    title: 'Primary French Introduction',
    description: 'Basic vocabulary, conversational phrases, and French culture for beginners.',
    category: 'Primary',
    teacher: { id: 'user_teacher_002', name: 'Mr. Ali Educator', avatarUrl: mockUsers[3].avatarUrl },
    imageUrl: defaultImageUrl('french_primary'),
    materialsCount: 12,
    assignmentsCount: 4,
    studentsCount: 20,
    createdAt: new Date(2023, 9, 10).toISOString(),
    updatedAt: new Date(2023, 11, 5).toISOString(),
  }
];

export const mockEnrolledCourses: EnrolledCourse[] = mockCourses.slice(0, 2).map((course, index) => ({
  ...course,
  progress: (index + 1) * 25,
  lastAccessed: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
}));


export const mockStudentProgress: StudentProgress[] = [
  {
    courseId: 'course_math_001',
    courseTitle: 'Primary Mathematics Fundamentals',
    completedAssignments: 3,
    totalAssignments: 5,
    overallGrade: 'B+',
    assignmentSubmissions: [
      { assignmentId: 'math_assign_01', assignmentTitle: 'Addition Worksheet', submittedAt: new Date().toISOString(), grade: 'A', status: 'graded' },
      { assignmentId: 'math_assign_02', assignmentTitle: 'Shapes Quiz', submittedAt: new Date().toISOString(), grade: 'B', status: 'graded' },
      { assignmentId: 'math_assign_03', assignmentTitle: 'Problem Solving Task', status: 'pending' },
    ]
  },
  {
    courseId: 'course_arabic_001',
    courseTitle: 'Middle School Arabic Language',
    completedAssignments: 1,
    totalAssignments: 8,
    overallGrade: 'C',
    assignmentSubmissions: [
       { assignmentId: 'arabic_assign_01', assignmentTitle: 'Grammar Exercise 1', submittedAt: new Date().toISOString(), grade: 'C', status: 'graded' },
       { assignmentId: 'arabic_assign_02', assignmentTitle: 'Reading Comprehension', status: 'pending'},
    ]
  },
];

export const mockCourseMaterials: Record<string, CourseMaterial[]> = {
  'course_math_001': [
    { id: 'mat001', title: 'Chapter 1: Numbers', type: 'file', url: '#', uploadedAt: new Date().toISOString() },
    { id: 'mat002', title: 'Video: Introduction to Addition', type: 'video', url: '#', uploadedAt: new Date().toISOString() },
    { id: 'mat003', title: 'Worksheet: Subtraction Practice', type: 'file', url: '#', uploadedAt: new Date().toISOString() },
  ],
  'course_arabic_001': [
    { id: 'mat004', title: 'Unit 1: Alphabet', type: 'text', content: 'Detailed explanation of the Arabic alphabet...', uploadedAt: new Date().toISOString() },
    { id: 'mat005', title: 'External Resource: Arabic Grammar', type: 'link', url: 'https://example.com/arabic-grammar', uploadedAt: new Date().toISOString() },
  ],
  'course_physics_001': [
    { id: 'mat006', title: 'Lecture Notes: Kinematics', type: 'file', url: '#', uploadedAt: new Date().toISOString() },
  ],
  'course_french_001': [
     { id: 'mat007', title: 'Vocabulary List: Common Phrases', type: 'file', url: '#', uploadedAt: new Date().toISOString() },
  ]
};

export const mockCourseAssignments: Record<string, Assignment[]> = {
  'course_math_001': [
    { id: 'assign001', title: 'Addition Worksheet', description: 'Complete the exercises on page 5.', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), totalPoints: 20 },
    { id: 'assign002', title: 'Shapes Quiz', description: 'Identify different geometric shapes.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), totalPoints: 15 },
  ],
  'course_arabic_001': [
    { id: 'assign003', title: 'Grammar Exercise 1', description: 'Fill in the blanks with correct verb forms.', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), totalPoints: 25 },
  ],
  'course_physics_001': [
     { id: 'assign004', title: 'Lab Report: Free Fall', description: 'Submit your lab report on the free fall experiment.', dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), totalPoints: 50 },
  ],
  'course_french_001': [
    { id: 'assign005', title: 'Oral Presentation: Introduce Yourself', description: 'Record a short video introducing yourself in French.', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), totalPoints: 30 },
  ]
};


export function getMockUserByRole(role: UserRole): User {
  return mockUsers.find(u => u.role === role) || mockUsers[0];
}
