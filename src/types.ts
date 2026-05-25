/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'manager' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar_initials: string;
  avatar_color: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  lastLogin: string;
  phone: string;
  major?: string;
  department?: string; // For teachers and managers (Bộ môn giảng dạy)
  studentId?: string;
  gpa?: number; // For students
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  loginAt: string;
}

export interface ScheduleSlot {
  day: number; // 2 to 6 (Monday to Friday as Thứ 2 -> Thứ 6)
  slot: number; // 1 to 4 (e.g. 1: 07:30-09:30, 2: 09:45-11:45, 3: 13:00-15:00, 4: 15:15-17:15)
  room: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  teacherId: string;
  status: 'active' | 'completed' | 'draft';
  enrolled: number;
  maxEnroll: number;
  progress: number; // average progress
  thumbnail_color: string;
  thumbnail_emoji: string;
  schedule: ScheduleSlot[];
  description: string;
}

export interface Submission {
  studentId: string;
  studentName: string;
  submittedAt: string;
  fileUrl: string;
  notes: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: 'homework' | 'project' | 'midterm' | 'quiz';
  dueDate: string;
  maxScore: number;
  status: 'open' | 'closed';
  description: string;
  submissions: Submission[];
}

export interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  attendance: number;       // scale 0-10, weighing 10%
  midterm: number;          // scale 0-10, weighing 30%
  final: number;            // scale 0-10, weighing 50%
  assignments_avg: number;  // scale 0-10, weighing 10%
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific userId
  type: 'info' | 'warning' | 'success' | 'danger' | 'announcement';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  role: string;
  action: string;
  resource: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}

export interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'pending';
  dueDate: string;
  paidAt?: string;
  type: 'tuition' | 'exam_fee' | 'library_fee';
  scholarshipAmt?: number;
}
