/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Course, Assignment, GradeRecord, Notification, AuditLog, Transaction } from './types';

// ============================================================================
// DETERMINISTIC COMPREHENSIVE GENERATOR FOR 500+ USERS CENTER DATABASE
// ============================================================================
const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Lâm', 'Mai', 'Thịnh', 'Tạ', 'Đinh'];
const MIDDLE_NAMES_MALE = ['Văn', 'Hữu', 'Minh', 'Đức', 'Thành', 'Quốc', 'Anh', 'Tuấn', 'Hoàng', 'Quang', 'Trọng', 'Thanh', 'Duy', 'Gia', 'Đình', 'Xuân', 'Kim'];
const MIDDLE_NAMES_FEMALE = ['Thị', 'Phượng', 'Thanh', 'My', 'Trà', 'Ngọc', 'Thảo', 'Khánh', 'Như', 'Ánh', 'Mai', 'Quỳnh', 'Cẩm', 'Hồng', 'Kiều', 'Bích'];
const LAST_NAMES_MALE = ['Nam', 'Khánh', 'Hùng', 'Sơn', 'Huy', 'Hoàng', 'Thái', 'Lâm', 'Dương', 'Bình', 'Hải', 'Phong', 'Phúc', 'Kiệt', 'Tú', 'Bách', 'Nghĩa', 'Thịnh', 'Tấn', 'Toàn', 'Minh', 'Khoa', 'Kiên', 'Long', 'Đạt', 'Cường', 'Vĩnh'];
const LAST_NAMES_FEMALE = ['Hương', 'Trinh', 'Vy', 'Hà', 'Linh', 'Thảo', 'Hạnh', 'Trang', 'Chi', 'Nga', 'Phượng', 'Thư', 'Trúc', 'Tú', 'Ánh', 'Ngọc', 'Yến', 'Lan', 'Hồng', 'Diệp', 'Anh', 'Nguyệt', 'Hằng', 'Duyên', 'Mỹ'];
const MAJORS = [
  'Software Engineering',
  'Information Technology',
  'Digital Marketing',
  'Business Administration',
  'Data Science',
  'Information Security',
  'Graphic Design',
  'Artificial Intelligence'
];
const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-orange-500', 'bg-cyan-500', 'bg-rose-500'];

export const DEPARTMENTS = [
  'Bộ môn Công nghệ phần mềm',
  'Bộ môn Khoa học Máy tính & AI',
  'Bộ môn An toàn Thông tin & Mạng',
  'Bộ môn Khoa học Dữ liệu & HTTT',
  'Bộ môn Thiết kế Đồ họa & Game',
  'Bộ môn Quản trị Kinh doanh',
  'Bộ môn Tiếp thị Số'
];

const GENERATED_USERS: User[] = [];
const GENERATED_GRADES: GradeRecord[] = [];
const GENERATED_TRANSACTIONS: Transaction[] = [];
const GENERATED_AUDIT_LOGS: AuditLog[] = [];

// Deterministic seed PRNG
let seedValue = 98765;
function random() {
  seedValue = (seedValue * 9301 + 49297) % 233280;
  return seedValue / 233280;
}

function getItem<T>(arr: T[]): T {
  const idx = Math.floor(random() * arr.length);
  return arr[idx];
}

// Generate exactly 483 users to reach exactly 500 total (17 hardcoded + 483 generated)
for (let i = 1; i <= 483; i++) {
  const isFemale = random() > 0.5;
  const isTeacher = i <= 15; // 15 extra teachers
  const isManager = i > 15 && i <= 20; // 5 extra managers
  const isStudent = i > 20; // 463 extra students
  
  const firstName = getItem(FIRST_NAMES);
  const middleName = isFemale ? getItem(MIDDLE_NAMES_FEMALE) : getItem(MIDDLE_NAMES_MALE);
  const lastName = isFemale ? getItem(LAST_NAMES_FEMALE) : getItem(LAST_NAMES_MALE);
  const name = `${firstName} ${middleName} ${lastName}`;
  
  // Initials
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const avatar_color = getItem(COLORS);
  
  // Clean email
  const cleanAscii = name.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, ".");
  
  const role = isTeacher ? 'teacher' : (isManager ? 'manager' : 'student');
  const emailHost = isStudent ? 'student.vn' : 'lms.vn';
  const email = `${cleanAscii}.${i}@${emailHost}`;
  const userId = `usr-gen-${i}`;
  
  const joinedDate = new Date(1758326400000 - Math.floor(random() * 31536000000));
  const joinedAt = joinedDate.toISOString();
  const lastLoginDate = new Date(1779494400000 - Math.floor(random() * 86400 * 30 * 1000));
  const lastLogin = lastLoginDate.toISOString();
  
  const phone = '09' + Math.floor(10000000 + random() * 90000000).toString();
  const status = random() > 0.96 ? 'inactive' : 'active';
  
  const newUser: User = {
    id: userId,
    email,
    name,
    role,
    avatar_initials: initials,
    avatar_color,
    status,
    joinedAt,
    lastLogin,
    phone,
  };
  
  if (isStudent) {
    newUser.major = getItem(MAJORS);
    const snNumber = 9 + (i - 20); // starts after SV20250009
    newUser.studentId = `SV2025${snNumber.toString().padStart(4, '0')}`;
    const rawGpa = 2.4 + random() * 1.6;
    newUser.gpa = Math.round(rawGpa * 100) / 100;
  } else if (isTeacher || isManager) {
    newUser.department = DEPARTMENTS[i % DEPARTMENTS.length];
  }
  
  GENERATED_USERS.push(newUser);
}

// Generate matches for grades, transactions and audit logs
GENERATED_USERS.forEach((usr, idx) => {
  if (usr.role === 'student') {
    // Register in 1 to 3 courses
    const studentCourses = ['crs-swe301', 'crs-mad101', 'crs-pro102', 'crs-iot302', 'crs-mkt101', 'crs-dbm202', 'crs-dsc201', 'crs-bus101']
      .filter(() => random() > 0.65);
      
    if (studentCourses.length === 0) {
      studentCourses.push('crs-swe301');
    }
    
    studentCourses.forEach((crsId, cIdx) => {
      const attendance = Math.round((8.0 + random() * 2.0) * 10) / 10;
      const midterm = Math.round((6.0 + random() * 4.0) * 10) / 10;
      const assignments_avg = Math.round((6.5 + random() * 3.5) * 10) / 10;
      const isCompleted = crsId === 'crs-bus101';
      const final = isCompleted ? Math.round((5.0 + random() * 5.0) * 10) / 10 : (random() > 0.3 ? Math.round((5.0 + random() * 5.0) * 10) / 10 : 0);
      
      GENERATED_GRADES.push({
        id: `grd-gen-${usr.id}-${cIdx}`,
        studentId: usr.id,
        courseId: crsId,
        attendance,
        midterm,
        final,
        assignments_avg,
      });
    });
    
    const hasPaid = random() > 0.35;
    const isScholarship = random() > 0.9;
    const scholar = isScholarship ? 3000000 : undefined;
    
    GENERATED_TRANSACTIONS.push({
      id: `tx-gen-${usr.studentId}`,
      studentId: usr.id,
      studentName: usr.name,
      studentCode: usr.studentId || '',
      amount: 15300000,
      status: hasPaid ? 'paid' : (random() > 0.5 ? 'pending' : 'unpaid'),
      dueDate: '2026-06-30T23:59:00Z',
      type: 'tuition',
      scholarshipAmt: scholar,
      paidAt: hasPaid ? new Date(1779494400000 - Math.floor(random() * 86400 * 15 * 1000)).toISOString() : undefined,
    });
  }
});

// Generate audit logs
GENERATED_USERS.slice(0, 50).forEach((usr, idx) => {
  const actions = ['LOGIN_SUCCESS', 'VIEW_GRADES', 'RE_EXAM_REGISTER', 'TUITION_PAY_RETRY'];
  const action = getItem(actions);
  const resource = action === 'LOGIN_SUCCESS' ? 'SYSTEM_AUTH' : (action === 'VIEW_GRADES' ? `${usr.id} / CURRENT_SEMESTER` : 'FINANCE_GATEWAY');
  
  GENERATED_AUDIT_LOGS.push({
    id: `log-gen-${idx}`,
    timestamp: new Date(1779494400000 - Math.floor(random() * 86400 * 5 * 1000)).toISOString(),
    userEmail: usr.email,
    role: usr.role,
    action,
    resource,
    ip: `14.161.${Math.floor(random() * 255)}.${Math.floor(random() * 255)}`,
    status: 'success',
  });
});

export const INITIAL_USERS: User[] = [
  // 4 Main demo accounts
  {
    id: 'usr-admin',
    email: 'admin@lms.vn',
    name: 'Nguyễn Văn Admin',
    role: 'admin',
    avatar_initials: 'AD',
    avatar_color: 'bg-red-500',
    status: 'active',
    joinedAt: '2025-09-01T08:00:00Z',
    lastLogin: '2026-05-23T02:00:00Z',
    phone: '0901234567',
  },
  {
    id: 'usr-manager',
    email: 'manager@lms.vn',
    name: 'Trần Thị Quản Lý',
    role: 'manager',
    avatar_initials: 'QL',
    avatar_color: 'bg-purple-500',
    status: 'active',
    joinedAt: '2025-09-03T09:00:00Z',
    lastLogin: '2026-05-23T01:30:00Z',
    phone: '0912345678',
    department: 'Phòng Quản lý Đào tạo',
  },
  {
    id: 'usr-teacher',
    email: 'teacher@lms.vn',
    name: 'Lê Hoàng Minh',
    role: 'teacher',
    avatar_initials: 'HM',
    avatar_color: 'bg-blue-500',
    status: 'active',
    joinedAt: '2025-09-05T10:00:00Z',
    lastLogin: '2026-05-22T14:45:00Z',
    phone: '0923456789',
    department: 'Bộ môn Công nghệ phần mềm',
  },
  {
    id: 'usr-student',
    email: 'student@lms.vn',
    name: 'Phạm Minh Quân',
    role: 'student',
    avatar_initials: 'MQ',
    avatar_color: 'bg-emerald-500',
    status: 'active',
    joinedAt: '2025-09-10T11:00:00Z',
    lastLogin: '2026-05-23T01:15:00Z',
    phone: '0934567890',
    major: 'Software Engineering',
    studentId: 'SV20250001',
    gpa: 3.65,
  },
  
  // Teachers (3 additional)
  {
    id: 'usr-prof-binh',
    email: 'binh.nguyen@lms.vn',
    name: 'GS. Nguyễn Thanh Bình',
    role: 'teacher',
    avatar_initials: 'TB',
    avatar_color: 'bg-indigo-500',
    status: 'active',
    joinedAt: '2024-02-15T08:30:00Z',
    lastLogin: '2026-05-22T10:30:00Z',
    phone: '0981122334',
    department: 'Bộ môn Khoa học Máy tính & AI',
  },
  {
    id: 'usr-prof-huong',
    email: 'huong.pham@lms.vn',
    name: 'TS. Phạm Chi Mai Hương',
    role: 'teacher',
    avatar_initials: 'MH',
    avatar_color: 'bg-pink-500',
    status: 'active',
    joinedAt: '2024-05-20T14:15:00Z',
    lastLogin: '2026-05-21T09:20:00Z',
    phone: '0982233445',
    department: 'Bộ môn Tiếp thị Số',
  },
  {
    id: 'usr-prof-dung',
    email: 'dung.le@lms.vn',
    name: 'ThS. Lê Việt Dũng',
    role: 'teacher',
    avatar_initials: 'VD',
    avatar_color: 'bg-teal-500',
    status: 'active',
    joinedAt: '2024-11-01T15:00:00Z',
    lastLogin: '2026-05-22T16:10:00Z',
    phone: '0983344556',
    department: 'Bộ môn An toàn Thông tin & Mạng',
  },

  // Managers (2 total: Trần Thị Quản Lý + 1 more)
  {
    id: 'usr-manager2',
    email: 'khanh.vu@lms.vn',
    name: 'Vũ Quốc Khánh',
    role: 'manager',
    avatar_initials: 'QK',
    avatar_color: 'bg-amber-500',
    status: 'active',
    joinedAt: '2025-01-10T10:00:00Z',
    lastLogin: '2026-05-20T08:45:00Z',
    phone: '0979876543',
    department: 'Phòng Khảo thí & Đảm bảo chất lượng',
  },

  // Students (8 additional)
  {
    id: 'usr-std-hung',
    email: 'hung.nguyen@student.vn',
    name: 'Nguyễn Tiến Hưng',
    role: 'student',
    avatar_initials: 'TH',
    avatar_color: 'bg-cyan-500',
    status: 'active',
    joinedAt: '2025-09-11T09:00:00Z',
    lastLogin: '2026-05-22T15:30:00Z',
    phone: '0945566778',
    major: 'Information Technology',
    studentId: 'SV20250002',
    gpa: 3.42,
  },
  {
    id: 'usr-std-linh',
    email: 'linh.hoang@student.vn',
    name: 'Hoàng Phương Linh',
    role: 'student',
    avatar_initials: 'PL',
    avatar_color: 'bg-orange-500',
    status: 'active',
    joinedAt: '2025-09-12T10:15:00Z',
    lastLogin: '2026-05-23T00:45:00Z',
    phone: '0946677889',
    major: 'Digital Marketing',
    studentId: 'SV20250003',
    gpa: 3.88,
  },
  {
    id: 'usr-std-dieu',
    email: 'dieu.trinh@student.vn',
    name: 'Trịnh Huyền Diệu',
    role: 'student',
    avatar_initials: 'HD',
    avatar_color: 'bg-rose-500',
    status: 'active',
    joinedAt: '2025-09-12T11:30:00Z',
    lastLogin: '2026-05-22T08:30:00Z',
    phone: '0947788990',
    major: 'Business Administration',
    studentId: 'SV20250004',
    gpa: 2.95,
  },
  {
    id: 'usr-std-nam',
    email: 'nam.vovan@student.vn',
    name: 'Võ Văn Nam',
    role: 'student',
    avatar_initials: 'VN',
    avatar_color: 'bg-blue-600',
    status: 'active',
    joinedAt: '2025-09-13T13:00:00Z',
    lastLogin: '2026-05-21T18:20:00Z',
    phone: '0948899001',
    major: 'Software Engineering',
    studentId: 'SV20250005',
    gpa: 3.20,
  },
  {
    id: 'usr-std-vy',
    email: 'vy.ngoc@student.vn',
    name: 'Ngô Ngọc Tường Vy',
    role: 'student',
    avatar_initials: 'TV',
    avatar_color: 'bg-teal-600',
    status: 'active',
    joinedAt: '2025-09-14T14:45:00Z',
    lastLogin: '2026-05-22T21:10:00Z',
    phone: '0949900112',
    major: 'Information Technology',
    studentId: 'SV20250006',
    gpa: 3.72,
  },
  {
    id: 'usr-std-son',
    email: 'son.lam@student.vn',
    name: 'Lâm Thanh Sơn',
    role: 'student',
    avatar_initials: 'TS',
    avatar_color: 'bg-green-700',
    status: 'active',
    joinedAt: '2025-09-15T09:00:00Z',
    lastLogin: '2026-05-23T02:05:00Z',
    phone: '0941122334',
    major: 'Data Science',
    studentId: 'SV20250007',
    gpa: 3.10,
  },
  {
    id: 'usr-std-ha',
    email: 'ha.buitran@student.vn',
    name: 'Bùi Trần Thu Hà',
    role: 'student',
    avatar_initials: 'TH',
    avatar_color: 'bg-pink-600',
    status: 'active',
    joinedAt: '2025-09-15T10:30:00Z',
    lastLogin: '2026-05-22T17:40:00Z',
    phone: '0942233445',
    major: 'Digital Marketing',
    studentId: 'SV20250008',
    gpa: 3.51,
  },
  {
    id: 'usr-std-hoang',
    email: 'hoang.khoi@student.vn',
    name: 'Nguyễn Khôi Hoàng',
    role: 'student',
    avatar_initials: 'KH',
    avatar_color: 'bg-indigo-600',
    status: 'inactive',
    joinedAt: '2025-09-16T11:00:00Z',
    lastLogin: '2026-05-15T09:15:00Z',
    phone: '0943344556',
    major: 'Software Engineering',
    studentId: 'SV20250009',
    gpa: 2.15,
  },
  ...GENERATED_USERS
];

// Ensure all initial and generated users have a password compliant with their role
INITIAL_USERS.forEach(u => {
  if (!u.password) {
    u.password = u.role === 'admin' ? 'Admin@123' : u.role === 'manager' ? 'Manager@123' : u.role === 'teacher' ? 'Teacher@123' : 'Student@123';
  }
});

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-swe301',
    code: 'SWE301',
    name: 'Introduction to Software Engineering',
    credits: 3,
    teacherId: 'usr-teacher', // Lê Hoàng Minh
    status: 'active',
    enrolled: 48,
    maxEnroll: 50,
    progress: 78,
    thumbnail_color: 'from-blue-500 to-indigo-500',
    thumbnail_emoji: '💻',
    schedule: [
      { day: 2, slot: 1, room: 'R301' }, // Monday Period 1
      { day: 4, slot: 2, room: 'R301' }, // Wednesday Period 2
    ],
    description: 'Fundamental principles of software engineering. Agile methodology, design patterns, UML, unit testing and project lifecycle models.',
  },
  {
    id: 'crs-mad101',
    code: 'MAD101',
    name: 'Discrete Mathematics',
    credits: 3,
    teacherId: 'usr-prof-binh', // GS. Nguyễn Thanh Bình
    status: 'active',
    enrolled: 72,
    maxEnroll: 80,
    progress: 88,
    thumbnail_color: 'from-purple-500 to-pink-500',
    thumbnail_emoji: '🔢',
    schedule: [
      { day: 3, slot: 2, room: 'R102' }, // Tuesday Period 2
      { day: 5, slot: 3, room: 'R102' }, // Thursday Period 3
    ],
    description: 'Set theory, propositional and predicate logic, combinatorics, graph theory, relations and algebraic structures applied in computing.',
  },
  {
    id: 'crs-pro102',
    code: 'PRN211',
    name: 'Cross-Platform Applications with .NET',
    credits: 4,
    teacherId: 'usr-teacher', // Lê Hoàng Minh
    status: 'active',
    enrolled: 32,
    maxEnroll: 40,
    progress: 65,
    thumbnail_color: 'from-teal-500 to-emerald-500',
    thumbnail_emoji: '📱',
    schedule: [
      { day: 2, slot: 3, room: 'Lab 201' },
      { day: 5, slot: 1, room: 'Lab 201' },
    ],
    description: 'Building multi-platform native desktop and web applications using C#, .NET MAUI, ASP.NET Core, and Entity Framework Core.',
  },
  {
    id: 'crs-iot302',
    code: 'IOT302',
    name: 'IoT (Internet of Things) Foundations',
    credits: 3,
    teacherId: 'usr-prof-dung', // ThS. Lê Việt Dũng
    status: 'active',
    enrolled: 25,
    maxEnroll: 30,
    progress: 90,
    thumbnail_color: 'from-amber-500 to-orange-500',
    thumbnail_emoji: '⚡',
    schedule: [
      { day: 3, slot: 1, room: 'Lab 105' },
      { day: 5, slot: 2, room: 'Lab 105' },
    ],
    description: 'Designing smart system solutions. Hands-on microcontrollers (Arduino, ESP32), sensor networks, wireless networks, and AWS IoT broker.',
  },
  {
    id: 'crs-mkt101',
    code: 'MKT101',
    name: 'Introduction to Modern Digital Marketing',
    credits: 3,
    teacherId: 'usr-prof-huong', // TS. Phạm Chi Mai Hương
    status: 'active',
    enrolled: 120,
    maxEnroll: 150,
    progress: 82,
    thumbnail_color: 'from-rose-500 to-pink-500',
    thumbnail_emoji: '🎯',
    schedule: [
      { day: 4, slot: 3, room: 'Hall A' },
      { day: 6, slot: 1, room: 'Hall A' },
    ],
    description: 'Modern SEO strategies, social media branding, pay-per-click advertisements, conversion funnel optimization and Google Analytics dashboards.',
  },
  {
    id: 'crs-dbm202',
    code: 'DBM202',
    name: 'Relational Database Systems & SQL',
    credits: 3,
    teacherId: 'usr-prof-binh',
    status: 'active',
    enrolled: 55,
    maxEnroll: 60,
    progress: 75,
    thumbnail_color: 'from-cyan-500 to-blue-500',
    thumbnail_emoji: '🗄️',
    schedule: [
      { day: 2, slot: 2, room: 'R302' },
      { day: 6, slot: 2, room: 'R302' },
    ],
    description: 'Database design, normalization (1NF-BCNF), indexes, transactions, and intermediate SQL querying with MySQL and PostgreSQL.',
  },
  {
    id: 'crs-dsc201',
    code: 'DSC201',
    name: 'Fundamentals of Data Science',
    credits: 4,
    teacherId: 'usr-prof-dung',
    status: 'active',
    enrolled: 19,
    maxEnroll: 25,
    progress: 40,
    thumbnail_color: 'from-indigo-500 to-violet-500',
    thumbnail_emoji: '📊',
    schedule: [
      { day: 3, slot: 4, room: 'Lab 310' },
      { day: 6, slot: 3, room: 'Lab 310' },
    ],
    description: 'Extracting valuable insights from data. Using Python, Pandas, Numpy, data cleaning, statistical modeling, and scikit-learn algorithms.',
  },
  {
    id: 'crs-bus101',
    code: 'BUS101',
    name: 'Business Negotiation & Communication',
    credits: 3,
    teacherId: 'usr-prof-huong',
    status: 'completed',
    enrolled: 40,
    maxEnroll: 40,
    progress: 100,
    thumbnail_color: 'from-slate-500 to-slate-700',
    thumbnail_emoji: '🤝',
    schedule: [
      { day: 4, slot: 4, room: 'R105' },
      { day: 6, slot: 4, room: 'R105' },
    ],
    description: 'Strategic planning, body language decoding, mock negotiations, and cross-cultural communication patterns in global companies.',
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  // SWE301 Assignments
  {
    id: 'asg-swe1',
    courseId: 'crs-swe301',
    title: 'Software Requirement Specification (SRS)',
    type: 'project',
    dueDate: '2026-06-05T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Create a comprehensive SRS document for an E-Commerce storefront including UML Use Case diagrams, activity diagrams, and user stories.',
    submissions: [
      {
        studentId: 'usr-student',
        studentName: 'Phạm Minh Quân',
        submittedAt: '2026-05-22T10:15:00Z',
        fileUrl: 'srs_pham_minh_quan.pdf',
        notes: 'Attached PDF includes the fully specified actors and activity flow charts.',
        score: 9.5,
        feedback: 'Excellent breakdown of actors and modularized stories. Good job!',
        status: 'graded',
      },
      {
        studentId: 'usr-std-hung',
        studentName: 'Nguyễn Tiến Hưng',
        submittedAt: '2026-05-21T14:30:00Z',
        fileUrl: 'srs_nguyen_tien_hung.pdf',
        notes: 'Final SRS draft submitted. Please review.',
        score: 8.0,
        feedback: 'Clear requirements but UML diagrams could have more detail.',
        status: 'graded',
      }
    ]
  },
  {
    id: 'asg-swe2',
    courseId: 'crs-swe301',
    title: 'Basic Architecture and Git Flow Task',
    type: 'homework',
    dueDate: '2026-05-28T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Setup a repository, create design patterns (Singleton or Factory), and submit a pull request link showcasing a solid rebase flow pattern.',
    submissions: [
      {
        studentId: 'usr-student',
        studentName: 'Phạm Minh Quân',
        submittedAt: '2026-05-23T01:00:00Z',
        fileUrl: 'git_architecture_pr.txt',
        notes: 'Hi teacher, my PR is on GitHub: https://github.com/mquan/swe-git-flow. Included Singleton class!',
        status: 'pending',
      }
    ]
  },
  
  // MAD101 Assignments
  {
    id: 'asg-mad1',
    courseId: 'crs-mad101',
    title: 'Propositional Logic Proof Assignment',
    type: 'homework',
    dueDate: '2026-05-20T23:59:00Z',
    maxScore: 10,
    status: 'closed',
    description: 'Solve the 10 logic puzzle proofs using deduction laws, and convert them to conjunctive normal form.',
    submissions: [
      {
        studentId: 'usr-student',
        studentName: 'Phạm Minh Quân',
        submittedAt: '2026-05-19T18:30:00Z',
        fileUrl: 'mad_hw1_done.pdf',
        notes: 'Scanned handwritten proof sheets.',
        score: 10,
        feedback: 'Fantastic logical proofs. 10/10!',
        status: 'graded',
      },
      {
        studentId: 'usr-std-linh',
        studentName: 'Hoàng Phương Linh',
        submittedAt: '2026-05-20T11:00:00Z',
        fileUrl: 'linh_mad_ex.pdf',
        notes: 'I formatted it with LaTeX, hope it reads clean.',
        score: 10,
        feedback: 'Beautiful latex formatting and rigorous mathematical steps.',
        status: 'graded',
      }
    ]
  },
  {
    id: 'asg-mad2',
    courseId: 'crs-mad101',
    title: 'Graph Theory & Dijkstra Algorithm Map Application',
    type: 'project',
    dueDate: '2026-06-15T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Implement Dijkstra shortest path search in Python using an adjacency list matrix. Show benchmark results for 1000 nodes.',
    submissions: []
  },

  // PRN211 Assignments
  {
    id: 'asg-prn1',
    courseId: 'crs-pro102',
    title: 'WPF Inventory Manager Design',
    type: 'homework',
    dueDate: '2026-06-01T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Create a local responsive WPF inventory system connecting via SQLite database, enforcing MVVM structure patterns.',
    submissions: [
      {
        studentId: 'usr-student',
        studentName: 'Phạm Minh Quân',
        submittedAt: '2026-05-23T01:50:00Z',
        fileUrl: 'wpf_inventory_app.zip',
        notes: 'Includes SQLite DB and clean solution structure',
        status: 'pending'
      }
    ]
  },

  // IOT302 Assignments
  {
    id: 'asg-iot1',
    courseId: 'crs-iot302',
    title: 'Smart Room Temperature Control Lab',
    type: 'quiz',
    dueDate: '2026-05-25T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Upload ESP32 source code triggering simulated relay logs matching DHT11 sensor limits.',
    submissions: [
      {
        studentId: 'usr-student',
        studentName: 'Phạm Minh Quân',
        submittedAt: '2026-05-22T08:00:00Z',
        fileUrl: 'esp32_relay_dht11.ino',
        notes: 'Source code in C++. Tried with simulated relays on Wokwi.',
        score: 9.0,
        feedback: 'Excellent debounce and sleep control.',
        status: 'graded'
      }
    ]
  },

  // MKT101 Assignments
  {
    id: 'asg-mkt1',
    courseId: 'crs-mkt101',
    title: 'SEO Audit for Travel Site',
    type: 'homework',
    dueDate: '2026-06-12T23:59:00Z',
    maxScore: 10,
    status: 'open',
    description: 'Conduct a deep SEO keyword research and backlinks analysis for a Vietnamese hospitality startup.',
    submissions: []
  }
];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    id: 'grd-mq-swe',
    studentId: 'usr-student',
    courseId: 'crs-swe301',
    attendance: 10,
    midterm: 8.5,
    final: 9.0,
    assignments_avg: 8.75,
  },
  {
    id: 'grd-mq-mad',
    studentId: 'usr-student',
    courseId: 'crs-mad101',
    attendance: 10,
    midterm: 10,
    final: 9.5,
    assignments_avg: 10,
  },
  {
    id: 'grd-mq-prn',
    studentId: 'usr-student',
    courseId: 'crs-pro102',
    attendance: 9.0,
    midterm: 8.0,
    final: 0, // Not taken yet
    assignments_avg: 8.5,
  },
  {
    id: 'grd-mq-iot',
    studentId: 'usr-student',
    courseId: 'crs-iot302',
    attendance: 10,
    midterm: 9.0,
    final: 0,
    assignments_avg: 9.0,
  },
  {
    id: 'grd-mq-mkt',
    studentId: 'usr-student',
    courseId: 'crs-mkt101',
    attendance: 8.0,
    midterm: 8.5,
    final: 0,
    assignments_avg: 7.0,
  },

  // Other students
  {
    id: 'grd-th-swe',
    studentId: 'usr-std-hung',
    courseId: 'crs-swe301',
    attendance: 9.5,
    midterm: 7.5,
    final: 8.0,
    assignments_avg: 8.0,
  },
  {
    id: 'grd-pl-mad',
    studentId: 'usr-std-linh',
    courseId: 'crs-mad101',
    attendance: 10,
    midterm: 9.5,
    final: 9.8,
    assignments_avg: 10,
  },
  {
    id: 'grd-hd-mkt',
    studentId: 'usr-std-dieu',
    courseId: 'crs-mkt101',
    attendance: 9.0,
    midterm: 6.5,
    final: 7.0,
    assignments_avg: 6.8,
  },
  ...GENERATED_GRADES
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'all',
    type: 'announcement',
    title: 'Thông báo Nghỉ lễ Quốc tế Lao động',
    body: 'Nhà trường thông báo thời gian nghỉ lễ từ ngày 30/04 đến hết ngày 03/05. Các lớp học bù sẽ được điều phối vào thứ 7 tuần kế tiếp.',
    read: false,
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'all',
    type: 'info',
    title: 'Hạn đăng ký nguyện vọng lớp học hè Kỳ Summer 2026',
    body: 'Cổng đăng ký nguyện vọng học hè trực tuyến đã mở tại phân hệ Đăng Ký Học Tập. Hạn cuối: 28/05/2026.',
    read: false,
    createdAt: '2026-05-22T09:30:00Z',
  },
  {
    id: 'notif-3',
    userId: 'usr-student',
    type: 'success',
    title: 'Điểm bài tập SRS môn SWE301 của bạn đã được công bố',
    body: 'Giảng viên Lê Hoàng Minh đã chấm điểm cho bài nộp Software Requirement Specification. Điểm số: 9.5/10.',
    read: false,
    createdAt: '2026-05-22T16:00:00Z',
  },
  {
    id: 'notif-4',
    userId: 'usr-student',
    type: 'warning',
    title: 'Hạn nộp bài tập Basic Architecture sắp tới',
    body: 'Bạn có bài tập SWE301 cần hoàn thành vào ngày 28/05. Hãy bố trí nộp đúng hạn.',
    read: false,
    createdAt: '2026-05-23T00:10:00Z',
  },
  {
    id: 'notif-5',
    userId: 'usr-teacher',
    type: 'info',
    title: 'Có bài nộp mới môn Cross-Platform Applications with .NET',
    body: 'Sinh viên Phạm Minh Quân đã nộp bài Homework `WPF Inventory Manager Design`.',
    read: false,
    createdAt: '2026-05-23T01:50:00Z',
  },
  {
    id: 'notif-6',
    userId: 'usr-manager',
    type: 'danger',
    title: 'Cảnh báo xung đột phòng học phòng R301',
    body: 'Phát hiện nguy cơ gán lịch học trùng giờ tại phòng R301 vào thứ 2, kiểm tra lịch học thay đổi gần đây.',
    read: false,
    createdAt: '2026-05-21T11:45:00Z',
  },
  {
    id: 'notif-7',
    userId: 'usr-admin',
    type: 'danger',
    title: 'Phát hiện đăng nhập sai 5 lần liên tiếp',
    body: 'Địa chỉ IP 113.190.23.45 đã truy cập sai mật khẩu tài khoản student.vn 5 lần.',
    read: false,
    createdAt: '2026-05-22T23:14:00Z',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-23T02:05:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'LOGIN_SUCCESS',
    resource: 'SYSTEM_AUTH',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: '2026-05-23T01:58:00Z',
    userEmail: 'student@lms.vn',
    role: 'student',
    action: 'ASSIGNMENT_SUBMIT',
    resource: 'crs-pro102 / asg-prn1',
    ip: '118.69.123.8',
    status: 'success',
  },
  {
    id: 'log-3',
    timestamp: '2026-05-23T01:30:00Z',
    userEmail: 'manager@lms.vn',
    role: 'manager',
    action: 'LOGIN_SUCCESS',
    resource: 'SYSTEM_AUTH',
    ip: '14.161.22.90',
    status: 'success',
  },
  {
    id: 'log-4',
    timestamp: '2026-05-23T01:00:00Z',
    userEmail: 'student@lms.vn',
    role: 'student',
    action: 'ASSIGNMENT_SUBMIT',
    resource: 'crs-swe301 / asg-swe2',
    ip: '118.69.123.8',
    status: 'success',
  },
  {
    id: 'log-5',
    timestamp: '2026-05-22T17:45:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'USER_DEACTIVATE',
    resource: 'hoang.khoi@student.vn',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-6',
    timestamp: '2026-05-22T16:00:00Z',
    userEmail: 'teacher@lms.vn',
    role: 'teacher',
    action: 'GRADE_ASSIGNMENT',
    resource: 'crs-swe301 / asg-swe1 / usr-student',
    ip: '42.113.99.182',
    status: 'success',
  },
  {
    id: 'log-7',
    timestamp: '2026-05-22T11:30:00Z',
    userEmail: 'manager@lms.vn',
    role: 'manager',
    action: 'APPROVE_ENROLLMENT',
    resource: 'usr-student / crs-dsc201',
    ip: '14.161.22.90',
    status: 'success',
  },
  {
    id: 'log-8',
    timestamp: '2026-05-22T09:12:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'UPDATE_SETTING',
    resource: 'SYSTEM_SECURITY_POLICY',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-9',
    timestamp: '2026-05-22T08:00:00Z',
    userEmail: 'student@lms.vn',
    role: 'student',
    action: 'LOGIN_SUCCESS',
    resource: 'SYSTEM_AUTH',
    ip: '118.69.123.8',
    status: 'success',
  },
  {
    id: 'log-10',
    timestamp: '2026-05-21T15:20:00Z',
    userEmail: 'teacher@lms.vn',
    role: 'teacher',
    action: 'UPLOAD_MATERIAL',
    resource: 'crs-swe301 / syllabus_swe301_v2.pdf',
    ip: '42.113.99.182',
    status: 'success',
  },
  {
    id: 'log-11',
    timestamp: '2026-05-21T14:45:00Z',
    userEmail: 'teacher@lms.vn',
    role: 'teacher',
    action: 'LOGIN_SUCCESS',
    resource: 'SYSTEM_AUTH',
    ip: '42.113.99.182',
    status: 'success',
  },
  {
    id: 'log-12',
    timestamp: '2026-05-21T11:00:00Z',
    userEmail: 'manager@lms.vn',
    role: 'manager',
    action: 'CREATE_COURSE',
    resource: 'crs-dsc201 / Fundamentals of Data Science',
    ip: '14.161.22.90',
    status: 'success',
  },
  {
    id: 'log-13',
    timestamp: '2026-05-21T10:15:00Z',
    userEmail: 'manager@lms.vn',
    role: 'manager',
    action: 'ASSIGN_TEACHER',
    resource: 'crs-dsc201 / usr-prof-dung',
    ip: '14.161.22.90',
    status: 'success',
  },
  {
    id: 'log-14',
    timestamp: '2026-05-20T16:30:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'RBAC_UPDATE_PERMISSIONS',
    resource: 'ROLE_TEACHER / EXAMS_ACCESS',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-15',
    timestamp: '2026-05-20T14:10:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'USER_CREATE',
    resource: 'usr-prof-huong / TS. Phạm Chi Mai Hương',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-16',
    timestamp: '2026-05-20T09:30:00Z',
    userEmail: 'vovan.nam@student.vn',
    role: 'student',
    action: 'LOGIN_FAILED',
    resource: 'SYSTEM_AUTH',
    ip: '125.235.11.24',
    status: 'failed',
  },
  {
    id: 'log-17',
    timestamp: '2026-05-19T14:00:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'DB_BACKUP',
    resource: 'SYSTEM_BACKUP_S3',
    ip: '113.161.45.101',
    status: 'success',
  },
  {
    id: 'log-18',
    timestamp: '2026-05-19T11:45:00Z',
    userEmail: 'manager@lms.vn',
    role: 'manager',
    action: 'UPDATE_TRANSACTION',
    resource: 'tx-20250001 / SV20250001',
    ip: '14.161.22.90',
    status: 'success',
  },
  {
    id: 'log-19',
    timestamp: '2026-05-18T10:30:00Z',
    userEmail: 'student@lms.vn',
    role: 'student',
    action: 'UPDATE_PROFILE',
    resource: 'student@lms.vn',
    ip: '118.69.123.8',
    status: 'success',
  },
  {
    id: 'log-20',
    timestamp: '2026-05-18T09:00:00Z',
    userEmail: 'admin@lms.vn',
    role: 'admin',
    action: 'FEATURE_FLAG_TOGGLE',
    resource: 'FLAG_ONLINE_PAYMENTS_ENABLED',
    ip: '113.161.45.101',
    status: 'success',
  },
  ...GENERATED_AUDIT_LOGS
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    studentId: 'usr-student', // Phạm Minh Quân
    studentName: 'Phạm Minh Quân',
    studentCode: 'SV20250001',
    amount: 15300000, // 15.3M VND
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-25T11:00:00Z',
    type: 'tuition',
    scholarshipAmt: 3000000,
  },
  {
    id: 'tx-002',
    studentId: 'usr-student',
    studentName: 'Phạm Minh Quân',
    studentCode: 'SV20250001',
    amount: 12500000,
    status: 'unpaid',
    dueDate: '2026-06-30T23:59:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-003',
    studentId: 'usr-std-hung',
    studentName: 'Nguyễn Tiến Hưng',
    studentCode: 'SV20250002',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-28T14:30:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-004',
    studentId: 'usr-std-hung',
    studentName: 'Nguyễn Tiến Hưng',
    studentCode: 'SV20250002',
    amount: 15300000,
    status: 'pending',
    dueDate: '2026-06-30T23:59:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-005',
    studentId: 'usr-std-linh',
    studentName: 'Hoàng Phương Linh',
    studentCode: 'SV20250003',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-20T10:15:00Z',
    type: 'tuition',
    scholarshipAmt: 7650000, // 50%
  },
  {
    id: 'tx-006',
    studentId: 'usr-std-linh',
    studentName: 'Hoàng Phương Linh',
    studentCode: 'SV20250003',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-06-30T23:59:00Z',
    paidAt: '2026-05-18T10:00:00Z',
    type: 'tuition',
    scholarshipAmt: 7650000,
  },
  {
    id: 'tx-007',
    studentId: 'usr-std-dieu',
    studentName: 'Trịnh Huyền Diệu',
    studentCode: 'SV20250004',
    amount: 15300000,
    status: 'unpaid',
    dueDate: '2026-03-31T23:59:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-008',
    studentId: 'usr-std-nam',
    studentName: 'Võ Văn Nam',
    studentCode: 'SV20250005',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-29T16:45:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-009',
    studentId: 'usr-std-nam',
    studentName: 'Võ Văn Nam',
    studentCode: 'SV20250005',
    amount: 15300000,
    status: 'unpaid',
    dueDate: '2026-06-30T23:59:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-010',
    studentId: 'usr-std-vy',
    studentName: 'Ngô Ngọc Tường Vy',
    studentCode: 'SV20250006',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-22T08:30:00Z',
    type: 'tuition',
    scholarshipAmt: 4500000,
  },
  {
    id: 'tx-011',
    studentId: 'usr-std-son',
    studentName: 'Lâm Thanh Sơn',
    studentCode: 'SV20250007',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-30T10:00:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-012',
    studentId: 'usr-std-ha',
    studentName: 'Bùi Trần Thu Hà',
    studentCode: 'SV20250008',
    amount: 15300000,
    status: 'paid',
    dueDate: '2026-03-31T23:59:00Z',
    paidAt: '2026-03-27T15:30:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-013',
    studentId: 'usr-std-ha',
    studentName: 'Bùi Trần Thu Hà',
    studentCode: 'SV20250008',
    amount: 15300000,
    status: 'unpaid',
    dueDate: '2026-06-30T23:59:00Z',
    type: 'tuition',
  },
  {
    id: 'tx-014',
    studentId: 'usr-student',
    studentName: 'Phạm Minh Quân',
    studentCode: 'SV20250001',
    amount: 250000, // library fine
    status: 'paid',
    dueDate: '2026-04-15T23:59:00Z',
    paidAt: '2026-04-10T09:12:00Z',
    type: 'library_fee',
  },
  {
    id: 'tx-015',
    studentId: 'usr-std-dieu',
    studentName: 'Trịnh Huyền Diệu',
    studentCode: 'SV20250004',
    amount: 500000, // re-exam fee
    status: 'paid',
    dueDate: '2026-05-10T23:59:00Z',
    paidAt: '2026-05-08T11:00:00Z',
    type: 'exam_fee',
  },
  ...GENERATED_TRANSACTIONS
];

export const RBAC_PERMISSIONS_MATRIX_DEFAULT: Record<string, Record<string, 'Full' | 'Scoped' | 'Read-only' | 'None'>> = {
  'Overview / Dashboard': {
    admin: 'Full',
    manager: 'Full',
    teacher: 'Full',
    student: 'Full',
  },
  'Overview / Analytics & Reports': {
    admin: 'Full',
    manager: 'Full',
    teacher: 'Read-only',
    student: 'None',
  },
  'Users / All Users': {
    admin: 'Full',
    manager: 'Read-only',
    teacher: 'None',
    student: 'None',
  },
  'Academic / Course Catalog': {
    admin: 'Full',
    manager: 'Full',
    teacher: 'Scoped',
    student: 'Read-only',
  },
  'Academic / Schedule & Exams': {
    admin: 'Full',
    manager: 'Full',
    teacher: 'Full',
    student: 'Read-only',
  },
  'Assessment / Grade Book': {
    admin: 'Full',
    manager: 'Read-only',
    teacher: 'Full',
    student: 'Read-only', // student can see their own grades
  },
  'Finance / Tuition Details': {
    admin: 'Full',
    manager: 'Full',
    teacher: 'None',
    student: 'Read-only',
  },
  'System Settings / Security & Permissions': {
    admin: 'Full',
    manager: 'None',
    teacher: 'None',
    student: 'None',
  },
};

export const FEATURE_FLAGS_DEFAULT = [
  { id: 'flag-reg', name: 'Student Registration Portal', description: 'Allows self-registration for new students in the admissions pool.', enabled: true },
  { id: 'flag-pay', name: 'VNPAY Tuition Integration', description: 'Core gateway routing to Vietnamese local banks for real-time payments.', enabled: true },
  { id: 'flag-gpa', name: 'Hypothetical Grade Simulator', description: 'Enables students to gauge projections and run target CGPA scenarios.', enabled: true },
  { id: 'flag-sms', name: 'SMS Attendance Alerts', description: 'Auto-broadcast alerts to guardians when student is marked Absent.', enabled: false },
  { id: 'flag-mfa', name: 'Two-Factor Auth Enforcement', description: 'Requires email OTP validation for managers and teachers logins.', enabled: false },
  { id: 'flag-log', name: 'Detailed IP Geolocate Auditing', description: 'Traces system activity geolocation headers during CRUD requests.', enabled: true },
  { id: 'flag-vroom', name: 'Virtual Stream (Meet) Integrator', description: 'Embeds dynamic links for livestream inside course schedulers.', enabled: false },
  { id: 'flag-backup', name: 'Automatic S3 Cron Backup', description: 'Triggers atomic database dumps daily at 02:00 UTC.', enabled: true }
];
