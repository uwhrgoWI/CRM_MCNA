/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, FolderUp, Edit3, ClipboardList, CheckCircle2, Award, Calendar, Search, Plus, Save, Download, FileText, ChevronRight, User } from 'lucide-react';
import { Course, User as UserType, Assignment, GradeRecord, Submission } from '../types';

interface TeacherWorkspaceProps {
  courses: Course[];
  users: UserType[];
  assignments: Assignment[];
  gradeRecords: GradeRecord[];
  onAddAssignment: (a: Assignment) => void;
  onUpdateAssignment: (a: Assignment) => void;
  onUpdateGrade: (g: GradeRecord) => void;
  onAddGrade: (g: GradeRecord) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  activeSubPage: string;
  onPageChange: (p: string) => void;
}

export function TeacherWorkspace({
  courses,
  users,
  assignments,
  gradeRecords,
  onAddAssignment,
  onUpdateAssignment,
  onUpdateGrade,
  onAddGrade,
  toast,
  activeSubPage,
  onPageChange,
}: TeacherWorkspaceProps) {

  // CORE TEACHER STATES
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [activeCourseTab, setActiveCourseTab] = useState<'overview' | 'students' | 'materials' | 'assignments' | 'grades' | 'attendance'>('overview');

  // Materials list mock state
  const [materials, setMaterials] = useState<Record<string, { id: string; name: string; size: string; date: string }[]>>({
    'crs-swe301': [
      { id: 'mat-1', name: 'Slide_01_Introduction_to_SWE.pdf', size: '2.4 MB', date: '2026-05-10' },
      { id: 'mat-2', name: 'Agile_Scrum_Guidebook_V3.pdf', size: '4.8 MB', date: '2026-05-15' },
      { id: 'mat-3', name: 'Syllabus_SWE301_Summer2026.pdf', size: '1.2 MB', date: '2026-05-05' },
    ],
    'crs-pro102': [
      { id: 'mat-4', name: 'PRN211_C_Sharp_Core_Cheatsheet.pdf', size: '3.1 MB', date: '2026-05-11' },
      { id: 'mat-5', name: 'WPF_Data_Binding_LabExercise.pdf', size: '1.5 MB', date: '2026-05-20' },
    ]
  });

  const [newMaterialName, setNewMaterialName] = useState('');

  // Course creating states
  const [isAsgModalOpen, setIsAsgModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgType, setAsgType] = useState<'homework' | 'project' | 'midterm' | 'quiz'>('homework');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMax, setAsgMax] = useState(10);
  const [asgDesc, setAsgDesc] = useState('');

  // Submission details pane state
  const [gradingAsgId, setGradingAsgId] = useState<string | null>(null);
  const [gradingSubStdId, setGradingSubStdId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Attendance mock registry
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRegistry, setAttendanceRegistry] = useState<Record<string, Record<string, 'present' | 'absent' | 'late'>>>({
    'crs-swe301': {
      'usr-student': 'present',
      'usr-std-hung': 'present',
      'usr-std-linh': 'late',
      'usr-std-dieu': 'absent',
      'usr-std-nam': 'present',
    }
  });

  // Inline Cell Editing Grade States
  const [editingGradeCell, setEditingGradeCell] = useState<{ recId: string; field: 'midterm' | 'final' | 'attendance' | 'assignments_avg' } | null>(null);
  const [cellEditVal, setCellEditVal] = useState<string>('');

  // Teachers courses
  const myCourses = courses.filter(c => c.teacherId === 'usr-teacher');
  const activeCourse = courses.find(c => c.id === selectedCourseId) || myCourses[0] || courses[0];

  // Assigned student list (Students filter using matching major or sample roster)
  const studentsEnrolled = users.filter(u => u.role === 'student');

  // Handle Attendance triple status click toggle
  const toggleAttendanceStatus = (stdId: string) => {
    const courseId = selectedCourseId;
    const currentStatus = attendanceRegistry[courseId]?.[stdId] || 'present';
    const states: ('present' | 'absent' | 'late')[] = ['present', 'absent', 'late'];
    const nextIdx = (states.indexOf(currentStatus) + 1) % states.length;
    const nextStatus = states[nextIdx];

    setAttendanceRegistry(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        [stdId]: nextStatus
      }
    }));
  };

  const markAllAttendance = (status: 'present' | 'absent') => {
    const courseId = selectedCourseId;
    const update: Record<string, 'present' | 'absent'> = {};
    studentsEnrolled.forEach(st => {
      update[st.id] = status;
    });
    setAttendanceRegistry(prev => ({
      ...prev,
      [courseId]: {
        ...(prev[courseId] || {}),
        ...update
      }
    }));
    toast(`Đã điểm danh hàng loạt: TOÀN BỘ [${status === 'present' ? 'Có mặt' : 'Vắng mặt'}]`, 'success');
  };

  const saveAttendanceRegistry = () => {
    toast(`Đã ghi nhận dữ liệu điểm danh môn ${activeCourse.code} ngày ${attendanceDate} thành công!`, 'success');
  };

  // Add material action handler
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;

    const newMat = {
      id: `mat-added-${Date.now()}`,
      name: newMaterialName.endsWith('.pdf') ? newMaterialName : `${newMaterialName}.pdf`,
      size: `${(Math.random() * 4 + 1).toFixed(1)} MB`,
      date: new Date().toISOString().split('T')[0]
    };

    setMaterials(prev => ({
      ...prev,
      [selectedCourseId]: [...(prev[selectedCourseId] || []), newMat]
    }));
    setNewMaterialName('');
    toast('Đã tải tài liệu chương trình giảng dạy lên thành công!', 'success');
  };

  // Create Assignment
  const handleCreateAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle) return;

    const newAsg: Assignment = {
      id: `asg-created-${Date.now()}`,
      courseId: selectedCourseId,
      title: asgTitle,
      type: asgType,
      dueDate: asgDueDate ? new Date(asgDueDate).toISOString() : new Date(Date.now() + 7*24*60*60*1000).toISOString(),
      maxScore: asgMax,
      status: 'open',
      description: asgDesc || 'Chưa cung cập đề bài.',
      submissions: []
    };

    onAddAssignment(newAsg);
    setIsAsgModalOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    toast(`Tạo bài tập mới: [${newAsg.title}] thành công!`, 'success');
  };

  // Action: Grade assignment submission
  const handleGradeSubmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAsgId || !gradingSubStdId) return;

    const targetAsg = assignments.find(a => a.id === gradingAsgId);
    if (!targetAsg) return;

    const updatedSubmissions = targetAsg.submissions.map(sub => {
      if (sub.studentId === gradingSubStdId) {
        return {
          ...sub,
          score: gradeValue,
          feedback: gradeFeedback,
          status: 'graded' as const
        };
      }
      return sub;
    });

    const updatedAssignment = {
      ...targetAsg,
      submissions: updatedSubmissions
    };

    onUpdateAssignment(updatedAssignment);
    setGradingAsgId(null);
    setGradingSubStdId(null);
    setGradeFeedback('');
    toast('Đã hoàn tất phê duyệt điểm số và gửi nhận xét cho sinh viên!', 'success');
  };

  // Cell Editing double click handlers
  const startEditingCell = (recId: string, field: 'midterm' | 'final' | 'attendance' | 'assignments_avg', currentVal: number) => {
    setEditingGradeCell({ recId, field });
    setCellEditVal(currentVal.toString());
  };

  const handleCellBlur = (record: GradeRecord) => {
    if (!editingGradeCell) return;
    const num = parseFloat(cellEditVal);
    if (isNaN(num) || num < 0 || num > 10) {
      toast('Điểm số phải nằm trong khoảng từ 0 đến 10.', 'error');
      setEditingGradeCell(null);
      return;
    }

    const { field } = editingGradeCell;
    const updatedRecord = {
      ...record,
      [field]: num
    };

    onUpdateGrade(updatedRecord);
    setEditingGradeCell(null);
    toast(`Tự động lưu điểm môn học học viên: ${num}/10`, 'success');
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, record: GradeRecord) => {
    if (e.key === 'Enter') {
      handleCellBlur(record);
    } else if (e.key === 'Escape') {
      setEditingGradeCell(null);
    }
  };

  const calculateProjectedGPA = (rec: GradeRecord) => {
    // 10% Attendance, 10% Assignments, 30% Midterm, 50% Final
    const avg = (rec.attendance * 0.1) + (rec.assignments_avg * 0.1) + (rec.midterm * 0.3) + (rec.final * 0.5);
    
    // Scale 10 to GPA 4.0 representation
    let gpaScale = (avg / 10) * 4.0;
    let letter = 'F';
    let gpaColor = 'text-rose-500';

    if (avg >= 8.5) { letter = 'A'; gpaColor = 'text-emerald-500'; }
    else if (avg >= 7.0) { letter = 'B'; gpaColor = 'text-blue-500'; }
    else if (avg >= 5.5) { letter = 'C'; gpaColor = 'text-indigo-500'; }
    else if (avg >= 4.0) { letter = 'D'; gpaColor = 'text-orange-500'; }

    return { avg: avg.toFixed(2), letter, gpaScale: gpaScale.toFixed(2), gpaColor };
  };

  // Counts
  const courseAssignments = assignments.filter(a => a.courseId === activeCourse.id);
  const pendingSubmissionsCount = courseAssignments.reduce((acc, a) => acc + a.submissions.filter(s => s.status === 'pending').length, 0);

  return (
    <div className="space-y-6">

      {/* 1. MY DASHBOARD PORTLET */}
      {activeSubPage === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Welcome teacher banner */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Chào thầy, Lê Hoàng Minh!</h2>
              <p className="text-blue-100 text-xs md:text-sm mt-1">Hôm nay thầy có 2 ca dạy ở các học phần SWE301 và PRN211. Phát hiện {pendingSubmissionsCount} bài nộp bài tập mới cần chấm điểm.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedCourseId('crs-swe301');
                  onPageChange('courses');
                  setActiveCourseTab('assignments');
                }}
                className="px-4 py-2 bg-indigo-600 border border-indigo-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer"
              >
                Chấm Bài Tập ({pendingSubmissionsCount})
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 font-bold" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Học Phần Phân Công</p>
                <h3 className="text-base font-bold text-slate-800">{myCourses.length} Lớp học</h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hạn chấm bài</p>
                <h3 className="text-base font-bold text-slate-800 font-mono">{pendingSubmissionsCount} Bài chưa chấm</h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phòng Lab Ca 3</p>
                <h3 className="text-base font-bold text-slate-800">Lab 201 (PRN211)</h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đánh giá chung kỳ</p>
                <h3 className="text-base font-bold text-slate-800">Xuất Sắc (9.2/10)</h3>
              </div>
            </div>
          </div>

          {/* Assigned course cards lists */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Hồ sơ danh sách lớp giảng dạy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCourses.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between p-5 space-y-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] tracking-wider uppercase">{c.code}</span>
                      <h4 className="font-bold text-slate-800 tracking-tight font-sans text-sm mt-1">{c.name}</h4>
                      <p className="text-xs text-slate-400 font-medium font-sans leading-relaxed line-clamp-2">{c.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-xl shadow-xs">
                      {c.thumbnail_emoji}
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-3">
                    <span className="font-bold text-slate-500 font-sans">Sỹ số: {c.enrolled} / {c.maxEnroll} SV</span>
                    <button
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        onPageChange('courses');
                        setActiveCourseTab('overview');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-50 transition cursor-pointer text-[11px] flex items-center gap-1"
                    >
                      <span>Vào Quản Trị Lớp</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. COURSE DETAIL VIEWER PORTLET */}
      {activeSubPage === 'courses' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeCourse.thumbnail_emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-sky-50 px-2 py-0.5 rounded">{activeCourse.code}</span>
                  <span className="text-xs font-semibold text-slate-400">Tín chỉ: {activeCourse.credits} HD</span>
                </div>
                <h1 className="text-base font-bold text-slate-800 font-sans tracking-tight mt-1">{activeCourse.name}</h1>
              </div>
            </div>

            {/* Course Selector Dropdown in header */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đổi học phần:</span>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setActiveCourseTab('overview');
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-white text-slate-700"
              >
                {myCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-tabs horizontal bar */}
          <div className="flex gap-2 border-b border-slate-100 pb-px">
            {([
              { id: 'overview', label: 'Tổng quan' },
              { id: 'students', label: 'Sinh viên' },
              { id: 'materials', label: 'Tài liệu Slide' },
              { id: 'assignments', label: 'Bài tập / Chấm điểm' },
              { id: 'grades', label: 'Bảng điểm tổng' },
              { id: 'attendance', label: 'Điểm danh lớp' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCourseTab(tab.id)}
                className={`pb-2 px-3.5 text-xs font-bold transition relative ${
                  activeCourseTab === tab.id ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                {activeCourseTab === tab.id && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full transition-all"></span>
                )}
              </button>
            ))}
          </div>

          {/* Subpage panel switch components */}

          {/* OVERVIEW COMPONENT */}
          {activeCourseTab === 'overview' && (
            <div className="space-y-4 text-xs animate-fadeIn text-slate-600 leading-relaxed max-w-2xl">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1.5">Tóm tắt Đề cương môn học</h3>
                <p>{activeCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <h4 className="font-bold text-slate-800 mb-1.5">Lịch học cố định hàng tuần</h4>
                  {activeCourse.schedule.map((sch, i) => (
                    <p key={i} className="font-medium font-mono text-[11px] mt-1 text-indigo-700">
                      • Thứ {sch.day}: Ca {sch.slot} (Phòng {sch.room})
                    </p>
                  ))}
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Mức tải học liệu</h4>
                    <p className="text-[10px] text-slate-400">Cam đoan hỗ trợ kiểm học qua slide lý thuyết.</p>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold rounded-xl">{activeCourse.credits * 15} giờ học</span>
                </div>
              </div>
            </div>
          )}

          {/* STUDENTS COMPONENT */}
          {activeCourseTab === 'students' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Danh sách sinh viên trong lớp học phần ({activeCourse.enrolled} SV)</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                      <th className="py-2 px-4 w-12 text-center">Nº</th>
                      <th className="py-2 px-4">MSSV</th>
                      <th className="py-2 px-4">Họ và tên</th>
                      <th className="py-2 px-4">Email</th>
                      <th className="py-2 px-4 font-mono">Chuyên ngành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentsEnrolled.map((st, i) => (
                      <tr key={st.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-400">{i + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-700">{st.studentId}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                          <span>{st.name}</span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 font-mono">{st.email}</td>
                        <td className="py-2.5 px-4 text-slate-500">{st.major}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MATERIALS COMPONENT */}
          {activeCourseTab === 'materials' && (
            <div className="space-y-4 animate-fadeIn max-w-xl">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đăng tải tài slide học lý thuyết</h3>
              <form onSubmit={handleAddMaterial} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newMaterialName}
                  onChange={(e) => setNewMaterialName(e.target.value)}
                  placeholder="Ví dụ: Slide_03_Architecture_Overview..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>Tải lên</span>
                </button>
              </form>

              <div className="space-y-2.5 pt-2">
                {(materials[activeCourse.id] || []).map((mat) => (
                  <div key={mat.id} className="p-3.5 border border-slate-100/80 rounded-2xl bg-slate-50/50 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{mat.name}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 font-mono text-slate-400 text-[10px]">
                      <span>{mat.size}</span>
                      <span>{mat.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS COMPONENT PORTLET */}
          {activeCourseTab === 'assignments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Thành thư viện bài tập ({courseAssignments.length} bài)</h3>
                  <button
                    onClick={() => setIsAsgModalOpen(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Giao bài tập</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {courseAssignments.length === 0 ? (
                    <p className="text-xs text-slate-400 font-medium text-center py-6">📭 Chưa giao bài tập nào cho học sinh lớp này.</p>
                  ) : (
                    courseAssignments.map((asg) => {
                      const subs = asg.submissions || [];
                      const pendingCount = subs.filter(s => s.status === 'pending').length;

                      return (
                        <div key={asg.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col justify-between space-y-3.5 hover:bg-slate-50/50 transition">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold font-mono text-[9px] uppercase">{asg.type}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">Hạn nộp: {new Date(asg.dueDate).toLocaleString('vi-VN')}</span>
                              </div>
                              <h4 className="font-bold text-slate-800 text-xs mt-1.5">{asg.title}</h4>
                              <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-md line-clamp-2">{asg.description}</p>
                            </div>
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 font-bold font-mono rounded text-[10px] whitespace-nowrap">Đại số cao nhất: {asg.maxScore} đ</span>
                          </div>

                          <div className="flex justify-between items-center text-[11px] pt-2 border-t border-slate-100 font-semibold">
                            <span className="text-slate-500 font-sans">Đã nộp: {subs.length} SV</span>
                            {pendingCount > 0 ? (
                              <button
                                onClick={() => {
                                  // Pick first pending submission to grade
                                  const pending = subs.find(s => s.status === 'pending');
                                  if (pending) {
                                    setGradingAsgId(asg.id);
                                    setGradingSubStdId(pending.studentId);
                                    setGradeValue(asg.maxScore);
                                  }
                                }}
                                className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold hover:bg-amber-600 transition cursor-pointer flex items-center gap-1 animate-pulse"
                              >
                                <span>Chấm Điểm ({pendingCount})</span>
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold">✓ Hoàn tất chấm điểm</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Grading Console if active */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Khung chấm bài học viên</h3>
                {gradingAsgId && gradingSubStdId ? (
                  (() => {
                    const asg = assignments.find(a => a.id === gradingAsgId);
                    const sub = asg?.submissions.find(s => s.studentId === gradingSubStdId);
                    return (
                      <form onSubmit={handleGradeSubmissionSubmit} className="space-y-4 text-xs font-medium">
                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-xs space-y-1">
                          <p className="text-[10px] font-bold text-indigo-600">SINH VIÊN NỘP BÀI:</p>
                          <p className="font-bold text-slate-800 text-sm">{sub?.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold block">Tài liệu nộp: [{sub?.fileUrl}]</p>
                          <div className="p-2 bg-slate-50 rounded mt-2 text-[10px] italic text-slate-500 leading-normal border border-slate-100">
                            &quot;{sub?.notes}&quot;
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thiết lập điểm số (Max: {asg?.maxScore})</label>
                          <input
                            type="number"
                            required
                            step="0.5"
                            min="0"
                            max={asg?.maxScore}
                            value={gradeValue}
                            onChange={(e) => setGradeValue(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Lời phê / Phản hồi giáo vụ</label>
                          <textarea
                            rows={3}
                            value={gradeFeedback}
                            onChange={(e) => setGradeFeedback(e.target.value)}
                            placeholder="Mô tả lỗi hoặc đánh giá thiết kế..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                          ></textarea>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setGradingAsgId(null);
                              setGradingSubStdId(null);
                            }}
                            className="w-1/3 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="w-2/3 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Lưu Điểm Chấm
                          </button>
                        </div>
                      </form>
                    );
                  })()
                ) : (
                  <div className="text-center py-10 text-slate-400 font-medium leading-relaxed font-sans">
                    🗃️ Nhấp vào nút &apos;Chấm Điểm&apos; của từng bài tập để mở giao diện quản trị phản hồi trực quan.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GRADE BOOK COMPONENT */}
          {activeCourseTab === 'grades' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Sổ Điểm Điện Tử Lớp Học phần</h3>
                  <p className="text-xs text-slate-400 mt-1">Đúp chuột (Double click) vào bất kỳ ô điểm nào để trực tiếp thay thế nhanh và tự động tính điểm trung bình môn.</p>
                </div>
                <button
                  onClick={() => toast('Sổ điểm môn học phần đã xuất CSV thành công!', 'success')}
                  className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-bold bg-white text-slate-500 text-xs hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Xuất tập tin Excel</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      <th className="py-2.5 px-4 text-left w-48">Sinh viên</th>
                      <th className="py-2.5 px-3">Điểm danh (10%)</th>
                      <th className="py-2.5 px-3">Bài tập (10%)</th>
                      <th className="py-2.5 px-3">Học giữa kỳ (30%)</th>
                      <th className="py-2.5 px-3">Thi cuối kỳ (50%)</th>
                      <th className="py-2.5 px-3 bg-indigo-50/30">Điểm tổng hệ 10</th>
                      <th className="py-2.5 px-3 bg-indigo-50">Dự phóng GPA 4.0</th>
                      <th className="py-2.5 px-3">Điểm chữ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {studentsEnrolled.map((st) => {
                      const record = gradeRecords.find(g => g.studentId === st.id && g.courseId === activeCourse.id) || {
                        id: `grd-gen-${st.id}-${activeCourse.id}`,
                        studentId: st.id,
                        courseId: activeCourse.id,
                        attendance: 10,
                        assignments_avg: 9,
                        midterm: 8,
                        final: 8
                      };

                      const proj = calculateProjectedGPA(record);

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/30 transition text-center font-mono">
                          <td className="py-3 px-4 font-sans font-semibold text-slate-800 text-left">
                            {st.name}
                          </td>

                          {/* Inline editable Cells mapped row */}
                          {([
                            { field: 'attendance', label: 'Chuyên cần' },
                            { field: 'assignments_avg', label: 'Bài tập' },
                            { field: 'midterm', label: 'Giữa kỳ' },
                            { field: 'final', label: 'Cuối kỳ' }
                          ] as const).map(({ field }) => {
                            const isEditing = editingGradeCell?.recId === record.id && editingGradeCell?.field === field;
                            const cellValue = record[field as keyof GradeRecord] as number;

                            return (
                              <td
                                key={field}
                                onDoubleClick={() => startEditingCell(record.id, field, cellValue)}
                                className="py-3 px-2 font-bold text-slate-700 cursor-pointer hover:bg-indigo-50/50 transition select-none text-xs"
                              >
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={cellEditVal}
                                    onChange={(e) => setCellEditVal(e.target.value)}
                                    onBlur={() => handleCellBlur(record)}
                                    onKeyDown={(e) => handleCellKeyDown(e, record)}
                                    autoFocus
                                    className="w-12 px-1 text-center font-bold text-slate-800 border-2 border-indigo-500 rounded bg-white text-xs outline-none"
                                  />
                                ) : (
                                  <span>{cellValue}</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="py-3 px-2 font-bold text-slate-800 bg-sky-50/30">{proj.avg}</td>
                          <td className="py-3 px-2 font-bold text-indigo-700 bg-indigo-50">{proj.gpaScale}</td>
                          <td className={`py-3 px-2 font-extrabold text-sm ${proj.gpaColor}`}>{proj.letter}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ATTENDANCE COMPONENT */}
          {activeCourseTab === 'attendance' && (
            <div className="space-y-4 animate-fadeIn max-w-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">Ngày ghi danh:</span>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-mono font-bold"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => markAllAttendance('present')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[10px] font-bold cursor-pointer"
                  >
                    Điểm Danh Có Mặt Hết
                  </button>
                  <button
                    onClick={() => markAllAttendance('absent')}
                    className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[10px] font-bold cursor-pointer animate-pulse"
                  >
                    Vắng Hết
                  </button>
                </div>
              </div>

              {/* Student list double click triple toggler */}
              <div className="space-y-3">
                {studentsEnrolled.map((st) => {
                  const status = attendanceRegistry[selectedCourseId]?.[st.id] || 'present';
                  return (
                    <div
                      key={st.id}
                      onClick={() => toggleAttendanceStatus(st.id)}
                      className="p-3 border border-slate-100/70 rounded-2xl bg-white hover:bg-slate-50 transition flex justify-between items-center text-xs cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center">
                          {st.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{st.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{st.studentId}</p>
                        </div>
                      </div>

                      {/* Triple State Badge Chips */}
                      <span className={`inline-block px-3 py-1 rounded-xl text-[10px] font-extrabold uppercase font-mono tracking-wide ${
                        status === 'present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        status === 'absent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {status === 'present' ? 'Có mặt' : status === 'absent' ? 'Vắng mặt 🟥' : 'Đi trễ 🟨'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={saveAttendanceRegistry}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow shadow-indigo-100"
                >
                  <Save className="w-4 h-4" />
                  <span>Xác Nhận Đúp điểm danh</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL MOCK */}
      {isAsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Giao bài tập lý thuyết/thực hành</h3>
            <form onSubmit={handleCreateAssignmentSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên tiêu đề bài tập</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="Ví dụ: Thiết kế Database sơ bộ..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phân loại</label>
                  <select
                    value={asgType}
                    onChange={(e) => setAsgType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="homework">Bài tập về nhà (HW)</option>
                    <option value="project">Đề án lớn (Project)</option>
                    <option value="quiz">Trắc nghiệm nhanh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Thang điểm chấm</label>
                  <input
                    type="number"
                    max={100}
                    min={10}
                    value={asgMax}
                    onChange={(e) => setAsgMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hạn nộp bài tập</label>
                <input
                  type="datetime-local"
                  required
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Yêu cầu & Hướng dẫn đề bài</label>
                <textarea
                  rows={3}
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Viết hướng dẫn nộp bài đính kèm định cấu hình link github..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl whitespace-pre-wrap"
                ></textarea>
              </div>

              {/* Drag drop file component mockup */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Đính kèm tệp đề bài (PDF/ZIP)</label>
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-center text-slate-400 hover:bg-slate-100/50 transition cursor-pointer select-none">
                  📁 Kéo thả tệp hoặc nhấp để tải lên tệp đính kèm
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAsgModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Giao bài ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
