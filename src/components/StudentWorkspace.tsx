/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Calendar, Award, AlertTriangle, CheckCircle2, DollarSign, Download, Send, FileCode, Check, Eye, ChevronRight, User, ShieldAlert, Lock, BellRing } from 'lucide-react';
import { Course, User as UserType, Assignment, GradeRecord, Transaction, Submission } from '../types';
import { SVGSparkline } from './Charts';

interface StudentWorkspaceProps {
  courses: Course[];
  assignments: Assignment[];
  gradeRecords: GradeRecord[];
  transactions: Transaction[];
  currentUser: UserType;
  onUpdateAssignment: (a: Assignment) => void;
  onUpdateUser: (u: UserType) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  activeSubPage: string;
  onPageChange: (p: string) => void;
}

export function StudentWorkspace({
  courses,
  assignments,
  gradeRecords,
  transactions,
  currentUser,
  onUpdateAssignment,
  onUpdateUser,
  toast,
  activeSubPage,
  onPageChange,
}: StudentWorkspaceProps) {

  // CORE STUDENT GLOBAL STATES
  const [selectedCourseId, setSelectedCourseId] = useState<string>('crs-swe301');
  const [activeCourseTab, setActiveCourseTab] = useState<'overview' | 'materials' | 'assignments' | 'grades'>('overview');

  // Submit Homework overlay states
  const [submittingAsgId, setSubmittingAsgId] = useState<string | null>(null);
  const [subNotes, setSubNotes] = useState('');
  const [subFileName, setSubFileName] = useState('submission_archive.zip');

  // GPA Simulator State
  const [simulatedClassGradeId, setSimulatedClassGradeId] = useState('grd-mq-prn'); // Defaults to PRN211 (.NET)
  const [hypotheticalCKScore, setHypotheticalCKScore] = useState<number>(8.5);

  // Profile Tabbed State
  const [activeProfileTab, setActiveProfileTab] = useState<'personal' | 'security' | 'notifications'>('personal');
  const [profPhone, setProfPhone] = useState(currentUser.phone);
  const [profName, setProfName] = useState(currentUser.name);
  const [profAddress, setProfAddress] = useState('Khu đô thị Đại học Quốc gia, Thủ Đức, TP. HCM');
  const [profBio, setProfBio] = useState('Đam mê nghiên cứu và phát triển kiến trúc phần mềm Cloud và ứng dụng cross-platform.');
  
  // Security parameters change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Channel configurations
  const [notifEmailActive, setNotifEmailActive] = useState(true);
  const [notifSmsActive, setNotifSmsActive] = useState(false);
  const [notifWebActive, setNotifWebActive] = useState(true);

  // Student Courses Enrolled
  const myEnrolledCourses = courses.filter(c => c.id !== 'crs-bus101'); // Seed enrolled courses

  // Handle student assignment submission action
  const handleSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsgId) return;

    const targetAsg = assignments.find(a => a.id === submittingAsgId);
    if (!targetAsg) return;

    const newSub: Submission = {
      studentId: currentUser.id,
      studentName: currentUser.name,
      submittedAt: new Date().toISOString(),
      fileUrl: subFileName,
      notes: subNotes,
      status: 'pending'
    };

    // Replace or add submission
    const existingIdx = targetAsg.submissions.findIndex(s => s.studentId === currentUser.id);
    let updatedSubmissions = [...targetAsg.submissions];
    if (existingIdx !== -1) {
      updatedSubmissions[existingIdx] = newSub;
    } else {
      updatedSubmissions.push(newSub);
    }

    const updatedAsg = {
      ...targetAsg,
      submissions: updatedSubmissions
    };

    onUpdateAssignment(updatedAsg);
    setSubmittingAsgId(null);
    setSubNotes('');
    toast(`Đã nộp bài tập [${targetAsg.title}] thành công!`, 'success');
  };

  // GPA calculation helper
  const renderAverageGPA = () => {
    const records = gradeRecords.filter(r => r.studentId === currentUser.id);
    if (records.length === 0) return '0.00';
    const sum = records.reduce((acc, r) => {
      // average grade system 10% Attendance, 10% Assignments, 30% Midterm, 50% Final
      const avg = (r.attendance * 0.1) + (r.assignments_avg * 0.1) + (r.midterm * 0.3) + (r.final * 0.5);
      // Scale into scale 4.0
      return acc + (avg / 10) * 4.0;
    }, 0);
    return (sum / records.length).toFixed(2);
  };

  // Handle saving profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      name: profName,
      phone: profPhone,
    };
    onUpdateUser(updated);
    toast('Đã lưu thông tin hồ sơ sinh viên cá nhân thành công!', 'success');
  };

  // Handle password change security
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('Vui lòng điền đầy đủ các trường mật khẩu.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Mật khẩu xác nhận không trùng khớp.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast('Mật khẩu mới phải từ 8 ký tự trở lên.', 'error');
      return;
    }

    toast('Đã cập nhật mật khẩu đăng nhập thành công!', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Determine course detail tabs content
  const activeCourse = courses.find(c => c.id === selectedCourseId) || myEnrolledCourses[0];
  const courseAssignments = assignments.filter(a => a.courseId === activeCourse.id);
  
  // Materials lists
  const courseMaterials = [
    { id: 'm-sw1', name: 'Slide_01_Đề_cương_môn_học.pdf', size: '1.2 MB' },
    { id: 'm-sw2', name: 'Giáo_trình_Thực_hành_Sản_Phẩm.pdf', size: '3.6 MB' },
    { id: 'm-sw3', name: 'Slide_02_Agile_Flow.pdf', size: '1.8 MB' }
  ];

  // Grade record detail table for grades view
  const myGradesRecords = gradeRecords.filter(r => r.studentId === currentUser.id);

  // Simulated Grade projection algorithm
  const getSimulatedOutput = () => {
    const targetRec = gradeRecords.find(r => r.id === simulatedClassGradeId);
    if (!targetRec) return { avg: '0', scale: '0', letter: 'F' };

    const compAttendance = targetRec.attendance;
    const compAssignments = targetRec.assignments_avg;
    const compMidterm = targetRec.midterm;

    // Simulate final exam
    const calculatedAvg = (compAttendance * 0.1) + (compAssignments * 0.1) + (compMidterm * 0.3) + (hypotheticalCKScore * 0.5);
    const gpaScale = (calculatedAvg / 10) * 4.0;
    let letter = 'F';

    if (calculatedAvg >= 8.5) letter = 'A';
    else if (calculatedAvg >= 7.0) letter = 'B';
    else if (calculatedAvg >= 5.5) letter = 'C';
    else if (calculatedAvg >= 4.0) letter = 'D';

    return {
      avg: calculatedAvg.toFixed(2),
      scale: gpaScale.toFixed(2),
      letter
    };
  };

  // Determine deadline chip colors
  const getDeadlineChipColor = (dateStr: string) => {
    const due = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = due - now;

    if (diff < 0) return 'bg-slate-100 text-slate-500 border-slate-200';
    if (diff < 24 * 60 * 60 * 1000 * 2) return 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'; // Urgent icon under 2 days
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  // Student specific tuition
  const myTuitions = transactions.filter(t => t.studentId === currentUser.id);

  return (
    <div className="space-y-6">

      {/* 1. STUDENT DASHBOARD SUBPAGE */}
      {activeSubPage === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Greeting GPA banner hero */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-805 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6" style={{ background: 'linear-gradient(135deg, #1d4ed8, #6d28d9)' }}>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Chào mừng trở lại, {currentUser.name}!</h2>
              <p className="text-blue-100 text-xs md:text-sm mt-1">Chúc bạn một ngày học tập hứng khởi. Hãy hoàn thành các nhiệm vụ đúng thời hạn để duy trì kết quả xuất sắc.</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center gap-3.5 border border-white/10 shrink-0 self-stretch md:self-auto justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none">Trung bình Tích lũy</p>
                <h3 className="text-2xl font-black font-mono leading-none mt-1">{renderAverageGPA()}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-[11px] font-sans tracking-wide">
                Hạng: Xuất Sắc
              </span>
            </div>
          </div>

          {/* KPI Dashboard row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 font-bold" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang học môn</p>
                <h3 className="text-base font-bold text-slate-800">{myEnrolledCourses.length} Khóa học</h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học phí còn lại</p>
                <h3 className="text-base font-bold text-slate-in italic">
                  {myTuitions.find(t => t.status === 'unpaid')?.amount.toLocaleString('vi-VN') || 0} VND
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tổng Tín Chỉ tích</p>
                <h3 className="text-base font-bold text-slate-800 font-mono">15 Tín chỉ</h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn bài tập chờ</p>
                <h3 className="text-base font-bold text-rose-600 font-mono">2 bài chờ nộp</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Timeline Scheduler View */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Lịch học chi tiết hôm nay</h3>
              <div className="space-y-3.5">
                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 font-mono text-[11px] text-slate-400 font-bold mt-1">07:30 - 09:30</div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2.5 shrink-0 shadow-sm"></div>
                  <div className="flex-1 p-3.5 rounded-2xl border border-blue-100 bg-blue-50/20 text-xs">
                    <div className="flex justify-between items-center font-bold text-blue-900">
                      <span>SWE301: Introduction to Software Engineering</span>
                      <span>Phòng: R301</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Giảng viên: Lê Hoàng Minh</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-24 shrink-0 font-mono text-[11px] text-slate-400 font-bold mt-1">13:00 - 15:00</div>
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-2.5 shrink-0"></div>
                  <div className="flex-1 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs">
                    <div className="flex justify-between items-center font-bold text-slate-700">
                      <span>PRN211: Cross-Platform Applications with .NET</span>
                      <span>Phòng: Lab 201</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Giảng viên: Lê Hoàng Minh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines lists sorted for student */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide text-rose-600 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Hạn nộp bài tập gấp</span>
              </h3>
              <div className="space-y-3">
                {assignments
                  .filter(a => a.status === 'open' && !a.submissions.some(s => s.studentId === currentUser.id))
                  .map((asg) => (
                    <div
                      key={asg.id}
                      className={`p-3 rounded-xl border flex justify-between items-center text-xs leading-none ${getDeadlineChipColor(asg.dueDate)}`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold truncate" style={{ maxWidth: '140px' }}>{asg.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCourseId(asg.courseId);
                          onPageChange('courses');
                          setActiveCourseTab('assignments');
                        }}
                        className="px-2 py-1 bg-white border rounded text-[9px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        Nộp Bài
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY COURSES STUDENT VIEW */}
      {activeSubPage === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
            <h1 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-indigo-600 text-lg">🎓</span>
              <span>Quản lý học phần Học Tập môn</span>
            </h1>

            {/* Course Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đổi môn học:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setActiveCourseTab('overview');
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
              >
                {myEnrolledCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-tabs horizontal bar for Student courses detail */}
          <div className="flex gap-2 border-b border-slate-100 pb-px">
            {([
              { id: 'overview', label: 'Tổng quan Đề cương' },
              { id: 'materials', label: 'Tải Slide tài liệu' },
              { id: 'assignments', label: 'Nộp Bài tập (Homeworks)' },
              { id: 'grades', label: 'Liên kết Bảng điểm thành phần' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCourseTab(tab.id)}
                className={`pb-2 px-4 text-xs font-bold transition relative ${
                  activeCourseTab === tab.id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                {activeCourseTab === tab.id && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full transition-all text-indigo-600"></span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content logic switch */}

          {/* OVERVIEW TAB */}
          {activeCourseTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn max-w-xl text-xs text-slate-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-850 text-sm mb-1 text-slate-800">Miêu tả đề án & giáo án</h3>
                <p>{activeCourse.description}</p>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
                <h4 className="font-bold text-indigo-900 mb-1">Giảng viên phụ trách đứng lớp</h4>
                <p className="font-medium text-[11px] text-indigo-700 leading-none">Thầy Lê Hoàng Minh - Email: teacher@lms.vn</p>
              </div>
            </div>
          )}

          {/* MATERIALS TAB */}
          {activeCourseTab === 'materials' && (
            <div className="space-y-3.5 animate-fadeIn max-w-xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tải tệp học thuật</h3>
              {courseMaterials.map((m) => (
                <div key={m.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-indigo-500" />
                    <span className="font-semibold text-slate-700">{m.name}</span>
                  </div>
                  <button
                    onClick={() => toast(`Bắt đầu tải về tệp ${m.name}...`, 'info')}
                    className="p-1 px-2 text-[10px] font-bold border border-slate-200 rounded hover:bg-slate-100 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ({m.size})</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ASSIGNMENTS SUBMISSION TAB */}
          {activeCourseTab === 'assignments' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tra cứu bài tập học phần mảng</h3>
              <div className="space-y-4">
                {courseAssignments.map((asg) => {
                  const submission = asg.submissions.find(s => s.studentId === currentUser.id);

                  return (
                    <div key={asg.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/30 space-y-3 flex flex-col justify-between hover:bg-slate-50/50 transition duration-150">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[9px] uppercase">{asg.type}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}</span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs mt-1.5">{asg.title}</h4>
                          <p className="text-[10px] text-slate-400 leading-normal mt-1">{asg.description}</p>
                        </div>

                        {/* Submission status stamp */}
                        <div className="shrink-0 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono tracking-wide ${
                            submission ? (
                              submission.status === 'graded' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                            ) : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {submission ? (
                              submission.status === 'graded' ? `Đã chấm dứt: ${submission.score}/10` : 'Đã nộp bài ✓'
                            ) : 'Trễ / Chưa nộp'}
                          </span>
                        </div>
                      </div>

                      {/* Grade feedback if graded */}
                      {submission && submission.status === 'graded' && (
                        <div className="p-3 rounded-xl bg-emerald-50 bg-emerald-500/10 border border-emerald-100/50 text-xs text-emerald-800 mt-2">
                          <p className="font-bold">🎯 Lời phê Thầy giáo Minh:</p>
                          <p className="italic text-[11px] mt-0.5">&quot;{submission.feedback || 'Chúc mừng em nộp bài chất lượng tuyệt vời!'}&quot;</p>
                        </div>
                      )}

                      {!submission && (
                        <button
                          onClick={() => setSubmittingAsgId(asg.id)}
                          className="px-3.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[10px] font-extrabold cursor-pointer self-start transition flex items-center gap-1"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Nộp bài ngay (Submit Assignment)</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GRADES TAB */}
          {activeCourseTab === 'grades' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Cơ cấu điểm thành phần môn</h3>
              {(() => {
                const r = gradeRecords.find(g => g.studentId === currentUser.id && g.courseId === activeCourse.id);
                if (!r) return <p className="text-xs text-slate-400 font-medium font-sans">Sổ điểm môn này đang xử lý.</p>;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Điểm danh (10%)</p>
                      <p className="text-base font-black text-slate-800 font-mono mt-1">{r.attendance}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bài tập (10%)</p>
                      <p className="text-base font-black text-slate-800 font-mono mt-1">{r.assignments_avg}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giữa kỳ (30%)</p>
                      <p className="text-base font-black text-slate-800 font-mono mt-1">{r.midterm}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Cuối kỳ (50%)</p>
                      <p className="text-base font-black text-slate-800 font-mono mt-1">{r.final > 0 ? r.final : 'CHƯA CÓ'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* 3. GPA GRADES SIMULATOR PAGE */}
      {activeSubPage === 'grades' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Detailed grade components table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Sổ điểm thành tựu Học tập</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-50">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wide text-center">
                    <th className="py-2.5 px-4 text-left">Học phần lớp</th>
                    <th className="py-2.5 px-3">Chuyên cần (10%)</th>
                    <th className="py-2.5 px-3">Bài tập (10%)</th>
                    <th className="py-2.5 px-3">Giữa kỳ (30%)</th>
                    <th className="py-2.5 px-3">Cuối kỳ (50%)</th>
                    <th className="py-2.5 px-3">Trung bình hệ 10</th>
                    <th className="py-2.5 px-3">Sparkline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myGradesRecords.map((r) => {
                    const crs = courses.find(c => c.id === r.courseId);
                    const avg = ((r.attendance * 0.1) + (r.assignments_avg * 0.1) + (r.midterm * 0.3) + (r.final * 0.5)).toFixed(2);
                    
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition text-center font-mono font-medium text-slate-600">
                        <td className="py-3 px-4 font-semibold text-slate-800 text-left font-sans">{crs?.name}</td>
                        <td className="py-3 px-3">{r.attendance}</td>
                        <td className="py-3 px-3">{r.assignments_avg}</td>
                        <td className="py-3 px-3">{r.midterm}</td>
                        <td className="py-3 px-3">{r.final > 0 ? r.final : 'Chờ thi'}</td>
                        <td className="py-3 px-3 font-bold text-indigo-700 bg-sky-50/20">{avg}</td>
                        <td className="py-3 px-3">
                          <SVGSparkline points={[r.attendance, r.assignments_avg, r.midterm, r.final > 0 ? r.final : 5]} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hypothetical Grade Simulator Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Bộ công cụ Giả lập Điểm thi Kỳ học Summer (Hypothetical GPA simulator)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Chọn lớp học chưa có điểm cuối kỳ và trượt thanh điều khiển để ước lượng điểm tổng đạt được.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Chọn lớp học cần giải lập</label>
                  <select
                    value={simulatedClassGradeId}
                    onChange={(e) => setSimulatedClassGradeId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {myGradesRecords.map(r => {
                      const crs = courses.find(c => c.id === r.courseId);
                      return (
                        <option key={r.id} value={r.id}>{crs?.code} - {crs?.name}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-slate-600 font-mono">
                    <span>Mục tiêu điểm Thi Cuối Kỳ:</span>
                    <span className="text-indigo-600 text-sm">{hypotheticalCKScore} / 10đ</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={hypotheticalCKScore}
                    onChange={(e) => setHypotheticalCKScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold font-mono">
                    <span>Làm sai trượt vỏ chuối (0đ)</span>
                    <span>Điểm Tuyệt Đối (10đ)</span>
                  </div>
                </div>
              </div>

              {/* simulated output */}
              {(() => {
                const sim = getSimulatedOutput();
                return (
                  <div className="flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-150/70 shadow-xs">
                    <p className="text-[10.5px] font-bold text-indigo-600 uppercase tracking-widest text-center">Dự báo kết quả học phần giả lập</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-center py-2">
                      <div className="p-2 border border-slate-50 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400">ĐIỂM TB HỆ 10</p>
                        <p className="text-base font-black text-slate-800 font-mono mt-1">{sim.avg}</p>
                      </div>
                      <div className="p-2 border border-slate-50 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400">CHUYỂN GPA 4.0</p>
                        <p className="text-base font-black text-indigo-700 font-mono mt-1">{sim.scale}</p>
                      </div>
                      <div className="p-2 border border-slate-50 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400">ĐIỂM CHỮ HỌC</p>
                        <p className="text-base font-black text-emerald-600 font-mono mt-1 uppercase">{sim.letter}</p>
                      </div>
                    </div>

                    <p className="text-[10px] text-purple-700 italic text-center font-medium mt-1 leading-normal">
                      💡 Mẹo học thuật: Cố gắng thi điểm cao và điểm danh đủ buổi!
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 4. PROFILE WORKSPACE VIEW FOR ALL ROLES */}
      {activeSubPage === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          {/* Left info box card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-between items-center space-y-4">
            <div className="space-y-3.5 flex flex-col items-center">
              <div className="relative group cursor-pointer select-none">
                <div className={`w-20 h-20 rounded-full ${currentUser.avatar_color} text-white flex items-center justify-center font-black text-2xl shadow-md border-4 border-white ring-4 ring-indigo-50`}>
                  {currentUser.avatar_initials}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 rounded-b-full py-0.5 opacity-0 group-hover:opacity-100 text-[9px] font-semibold text-white transition">
                  Thay đổi
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-850 text-base text-slate-800 font-sans tracking-tight">{currentUser.name}</h3>
                <span className="inline-block mt-0.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase font-mono bg-indigo-50 text-indigo-700 border border-indigo-150">
                  {currentUser.role} badge
                </span>
                <p className="text-[10px] text-slate-400 font-mono font-semibold mt-1">Đăng nhập mới: {new Date().toLocaleTimeString('vi-VN')}</p>
              </div>
            </div>

            <div className="w-full text-left text-xs border-t border-slate-50 pt-4 space-y-2 text-slate-500 font-medium font-sans">
              <p>📍 Chức vụ học thuật: {currentUser.role === 'student' ? 'Sinh viên Khóa 21' : 'Hội đồng Khoa học CNTT'}</p>
              <p>✉️ Email: <span className="font-mono">{currentUser.email}</span></p>
              <p>🗓️ Ngày tham gia: {new Date(currentUser.joinedAt).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Right configurations tab sheets */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 space-y-6">
            <div className="flex gap-2.5 border-b border-slate-100 pb-px">
              {([
                { id: 'personal', label: 'Thông tin cá nhân' },
                { id: 'security', label: 'Bảo mật đăng nhập' },
                { id: 'notifications', label: 'Kênh Thông báo (Channels)' }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProfileTab(tab.id)}
                  className={`pb-2 px-3 text-xs font-bold transition relative ${
                    activeProfileTab === tab.id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeProfileTab === tab.id && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full transition-all"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Sub content based on tab selection */}

            {/* PERSONAL INFO FORM */}
            {activeProfileTab === 'personal' && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-medium animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mã xác nhân viên</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.studentId || 'STAFF-90211'}
                      className="w-full px-3 py-2 border border-slate-100 rounded-xl bg-slate-50 text-slate-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Số điện thoại liên lạc</label>
                    <input
                      type="tel"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Địa chỉ thường trú</label>
                    <input
                      type="text"
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tiểu sử ngắn / Bio</label>
                  <textarea
                    rows={3}
                    value={profBio}
                    onChange={(e) => setProfBio(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow shadow-indigo-100 cursor-pointer"
                >
                  Ghi nhận Hồ Sơ Cá Nhân
                </button>
              </form>
            )}

            {/* SECURITY PASSWORD CHANGE FORM */}
            {activeProfileTab === 'security' && (
              <form onSubmit={handleSavePassword} className="space-y-4 text-xs font-medium animate-fadeIn max-w-sm">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Mật khẩu bảo mật hiện tại</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cài đặt mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Xác thực mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
                >
                  Xác thực Đổi Mật Khẩu
                </button>
              </form>
            )}

            {/* NOTIFICATION PREFERENCES */}
            {activeProfileTab === 'notifications' && (
              <div className="space-y-4 text-xs font-semibold text-slate-600 animate-fadeIn font-sans">
                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition">
                  <div>
                    <h4 className="text-slate-800">Cổng thông báo đào tạo Email</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tự động đồng bộ các bản chấm điểm học lý thuyết và hạn bài nộp.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifEmailActive}
                    onChange={(e) => setNotifEmailActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-5 h-5 cursor-pointer"
                  />
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition">
                  <div>
                    <h4 className="text-slate-800">Thông báo tin nhắn SMS qua điện thoại</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nhận mã OTP bảo mật giao dịch đóng học phí sinh sinh viên.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSmsActive}
                    onChange={(e) => setNotifSmsActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-5 h-5 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => toast('Cấu hình kênh truyền nhận dữ liệu thông báo đã hoạt động!', 'success')}
                  className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                >
                  Lưu ưu tiên Kênh Nhận
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* STUDENT UPLOAD SUBMISSION FORM OVERLAY MODAL */}
      {submittingAsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Nộp bài tập trực tuyến</h3>
            <form onSubmit={handleSubmissionSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Tài liệu ZIP nguồn (Archive File)</label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex items-center gap-2.5">
                  <FileCode className="w-8 h-8 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <input
                      type="text"
                      value={subFileName}
                      onChange={(e) => setSubFileName(e.target.value)}
                      className="text-xs font-mono font-bold text-slate-800 border-none p-0 bg-transparent focus:ring-0 focus:outline-none w-full"
                    />
                    <p className="text-[9px] text-slate-400 mt-0.5">Click để đặt lại thương hiệu tập tin.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Ghi chú lời giải / Gửi Giáo Viên</label>
                <textarea
                  rows={3}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="Thưa thầy, em nộp bài tập Homework 1 đã đính kèm PR git flow..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setSubmittingAsgId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:opacity-90 text-white font-bold rounded-xl cursor-pointer shadow shadow-indigo-100"
                >
                  Xác Thực Nộp Bài
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
