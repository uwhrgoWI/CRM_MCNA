/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Award, Users, CreditCard, DollarSign, Plus, Calendar, AlertTriangle, Check, Search, Download, UserCheck, X, Trash2, Printer } from 'lucide-react';
import { Course, User, Transaction, ScheduleSlot } from '../types';

interface ManagerWorkspaceProps {
  courses: Course[];
  users: User[];
  transactions: Transaction[];
  onAddCourse: (c: Course) => void;
  onUpdateCourse: (c: Course) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onAddTransaction: (t: Transaction) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  activeSubPage: string;
}

export function ManagerWorkspace({
  courses,
  users,
  transactions,
  onAddCourse,
  onUpdateCourse,
  onUpdateTransaction,
  onAddTransaction,
  toast,
  activeSubPage,
}: ManagerWorkspaceProps) {

  // CORE STATE ENGINE
  const [courseSearch, setCourseSearch] = useState('');
  const [managerSearch, setManagerSearch] = useState('');

  // Course Creating State
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [newMax, setNewMax] = useState(40);
  const [newDesc, setNewDesc] = useState('');

  // Scheduling State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schCourseId, setSchCourseId] = useState('');
  const [schDay, setSchDay] = useState(2); // Thứ 2 to 6
  const [schSlot, setSchSlot] = useState(1); // 1 to 4
  const [schRoom, setSchRoom] = useState('R301');

  // Bulk enrollment text list state
  const [bulkMssvList, setBulkMssvList] = useState('');

  // Scholarship add state
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [scholStudentId, setScholStudentId] = useState('');
  const [scholAmount, setScholAmount] = useState(3000000); // Default scholarship 3M

  // Enrollment Status Approvals & Rejections simulation
  const [enrollments, setEnrollments] = useState([
    { id: 'en-r1', studentId: 'usr-student', studentName: 'Phạm Minh Quân', studentCode: 'SV20250001', courseName: 'Fundamentals of Data Science', courseId: 'crs-dsc201', status: 'pending', term: 'Summer 2026' },
    { id: 'en-r2', studentId: 'usr-std-hung', studentName: 'Nguyễn Tiến Hưng', studentCode: 'SV20250002', courseName: 'Cross-Platform Applications with .NET', courseId: 'crs-pro102', status: 'pending', term: 'Summer 2026' },
    { id: 'en-r3', studentId: 'usr-std-linh', studentName: 'Hoàng Phương Linh', studentCode: 'SV20250003', courseName: 'Introduction to Modern Digital Marketing', courseId: 'crs-mkt101', status: 'approved', term: 'Spring 2026' }
  ]);

  // Handle Approve/Reject Enrollment
  const updateEnrollmentStatus = (enId: string, nextStatus: 'approved' | 'rejected') => {
    setEnrollments(prev => prev.map(item => {
      if (item.id === enId) {
        toast(`Đã duyệt yêu cầu của ${item.studentName}: ${nextStatus === 'approved' ? 'Chấp Thuận' : 'Từ Chối'}`, 'success');
        
        // Update courses count if approved
        if (nextStatus === 'approved') {
          const matchCourse = courses.find(c => c.id === item.courseId);
          if (matchCourse) {
            onUpdateCourse({ ...matchCourse, enrolled: Math.min(matchCourse.enrolled + 1, matchCourse.maxEnroll) });
          }
        }
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  // Bulk enroll validator
  const handleBulkEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkMssvList.trim()) {
      toast('Vui lòng điền mã sinh viên phân tách bằng dấu phẩy.', 'warning');
      return;
    }

    const separated = bulkMssvList.split(/[\s,;\n]+/).map(item => item.trim().toUpperCase()).filter(Boolean);
    const validStudents = users.filter(u => u.role === 'student' && u.studentId && separated.includes(u.studentId.toUpperCase()));

    if (validStudents.length === 0) {
      toast('Không tìm thấy sinh viên nào trùng khớp với mã đã điền.', 'error');
      return;
    }

    validStudents.forEach(st => {
      // Mock enrolling in a random course for view
      setEnrollments(prev => [
        ...prev,
        {
          id: `en-new-${Date.now()}-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          studentCode: st.studentId || '',
          courseName: 'Fundamentals of Data Science',
          courseId: 'crs-dsc201',
          status: 'approved',
          term: 'Summer 2026'
        }
      ]);
    });

    toast(`Đã phê duyệt nhập học thành công cho ${validStudents.length} sinh viên!`, 'success');
    setBulkMssvList('');
  };

  // Create course
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) {
      toast('Vui lòng nhập đầy đủ Mã môn và Tên lớp.', 'warning');
      return;
    }

    const newC: Course = {
      id: `crs-new-${Date.now()}`,
      code: newCode.toUpperCase().trim(),
      name: newName,
      credits: newCredits,
      teacherId: newTeacherId || 'usr-teacher',
      status: 'active',
      enrolled: 0,
      maxEnroll: newMax,
      progress: 0,
      thumbnail_color: 'from-purple-500 to-indigo-600',
      thumbnail_emoji: '📚',
      schedule: [],
      description: newDesc || 'Chưa cung cấp mô tả chi tiết môn học.',
    };

    onAddCourse(newC);
    setIsNewCourseModalOpen(false);
    toast(`Đã khởi tạo học phần môn [${newC.code}] ${newC.name} thành công!`, 'success');
  };

  // Add Class Slot Schedule with Overlapping conflict checks!
  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schCourseId) {
      toast('Vui lòng chọn học phần môn học.', 'warning');
      return;
    }

    const targetCourse = courses.find(c => c.id === schCourseId);
    if (!targetCourse) return;

    // Room Conflict Detection! Check if another course is already in the same room at the same day + slot
    const conflict = courses.some(c =>
      c.schedule.some(s => s.day === schDay && s.slot === schSlot && s.room.toLowerCase() === schRoom.toLowerCase().trim())
    );

    if (conflict) {
      toast(`⚠️ PHÒNG XUNG ĐỘT: Phòng ${schRoom} đã có lớp xếp lịch tại Thứ ${schDay}, Ca ${schSlot}!`, 'error');
      return;
    }

    const newSlot: ScheduleSlot = {
      day: schDay,
      slot: schSlot,
      room: schRoom.trim(),
    };

    const updatedCourse = {
      ...targetCourse,
      schedule: [...targetCourse.schedule, newSlot],
    };

    onUpdateCourse(updatedCourse);
    setIsScheduleModalOpen(false);
    toast(`Đã xếp lịch phòng ${schRoom} vào Thứ ${schDay} Ca ${schSlot} cho môn ${targetCourse.code}!`, 'success');
  };

  // Calculate finance numbers
  const teachers = users.filter(u => u.role === 'teacher');
  const activeStudents = users.filter(u => u.role === 'student');

  const totalBilled = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalPaid = transactions.filter(t => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0);
  const totalOutstanding = transactions.filter(t => t.status === 'unpaid').reduce((acc, t) => acc + t.amount, 0);
  const totalScholarshipsAmount = transactions.filter(t => t.scholarshipAmt).reduce((acc, t) => acc + (t.scholarshipAmt || 0), 0);

  const toggleTuitionPaid = (tx: Transaction) => {
    const nextStatus = tx.status === 'paid' ? 'unpaid' : 'paid';
    onUpdateTransaction({
      ...tx,
      status: nextStatus,
      paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
    });
    toast(`Đã đổi trạng thái biên lai giao dịch ${tx.id} thành [${nextStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thu học phí'}]`, 'info');
  };

  // Scholarship modal adding
  const handleScholarshipAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholStudentId) {
      toast('Vui lòng chọn học sinh thụ hưởng.', 'warning');
      return;
    }

    const st = users.find(u => u.id === scholStudentId);
    if (!st) return;

    // Find any tuition transaction to put scholarship
    const stTx = transactions.find(t => t.studentId === st.id && t.type === 'tuition');
    if (stTx) {
      onUpdateTransaction({
        ...stTx,
        scholarshipAmt: scholAmount,
      });
      toast(`Đã cấp học bổng trị giá ${scholAmount.toLocaleString('vi-VN')} VND cho học viên ${st.name}`, 'success');
    } else {
      // Create new
      const newTx: Transaction = {
        id: `tx-sch-${Date.now()}`,
        studentId: st.id,
        studentName: st.name,
        studentCode: st.studentId || 'SV0000',
        amount: 15300000,
        status: 'unpaid',
        dueDate: new Date().toISOString(),
        type: 'tuition',
        scholarshipAmt: scholAmount,
      };
      onAddTransaction(newTx);
      toast(`Khởi tạo biên lai học phí kèm học bổng trị giá ${scholAmount.toLocaleString('vi-VN')} VND cho sinh viên`, 'success');
    }
    setIsScholarshipModalOpen(false);
  };

  return (
    <div className="space-y-6">

      {/* 1. ACADEMIC DASHBOARD */}
      {activeSubPage === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Headline banner */}
          <div className="bg-gradient-to-r from-purple-700 to-pink-800 text-white p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Cổng Quản Trị Đào Tạo chuyên nghiệp (Academic Console)</h2>
              <p className="text-purple-100 text-xs md:text-sm mt-1">Quản lý catalog chương trình giảng dạy, duyệt danh sách tuyển sinh trực tuyến, giám sát phòng học.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsNewCourseModalOpen(true)}
                className="px-4 py-2 bg-white text-purple-700 text-xs font-bold rounded-xl hover:bg-slate-50 shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Khởi Tạo Lớp</span>
              </button>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Xếp Lịch Học</span>
              </button>
            </div>
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Học viên Đăng ký</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{activeStudents.length}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Môn học kích hoạt</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{courses.length}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Đội ngũ Thầy Cô</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{teachers.length}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Học phí đã thu</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{(totalPaid/1000000).toFixed(1)} Tr</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Yêu Cầu Chờ Duyệt</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{enrollments.filter(e => e.status === 'pending').length}</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Courses Overview table in Dashboard */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Học phần kích hoạt đào tạo</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-400">
                      <th className="py-2.5 px-3">Mã lớp</th>
                      <th className="py-2.5 px-3">Tên môn học</th>
                      <th className="py-2.5 px-3 text-center">Sỹ số</th>
                      <th className="py-2.5 px-3">Giảng viên phụ trách</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {courses.slice(0, 5).map((crs) => {
                      const prof = users.find(u => u.id === crs.teacherId);
                      return (
                        <tr key={crs.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{crs.code}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{crs.name}</td>
                          <td className="py-2.5 px-3 text-center font-mono">
                            <span className="font-bold text-slate-700">{crs.enrolled}</span>
                            <span className="text-slate-400">/{crs.maxEnroll}</span>
                          </td>
                          <td className="py-2.5 px-3 truncate" style={{ maxWidth: '140px' }}>
                            <p className="font-semibold text-slate-700">{prof ? prof.name : 'Chưa phân công'}</p>
                            {prof && prof.department && (
                              <p className="text-[10px] text-blue-500 font-sans tracking-tight leading-none mt-0.5">{prof.department}</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alerts Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Cảnh báo quản trị khẩn cấp</span>
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-100 text-xs text-orange-800 space-y-1">
                  <h4 className="font-bold">Học phí trễ hạn từ sinh viên</h4>
                  <p className="text-[11px] leading-relaxed">Trịnh Huyền Diệu (SV20250004) chưa thanh toán học phí Kỳ Spring. Hạn thanh toán đã trễ hơn 40 ngày.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 space-y-1">
                  <h4 className="font-bold">Lớp sắp quá tải tối đa</h4>
                  <p className="text-[11px] leading-relaxed">Môn học SWE301 đạt sỹ số 48/50. Cân nhắc tách cụm học phần hoặc tăng giới hạn tối đa.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ENROLLMENT MANAGEMENT */}
      {activeSubPage === 'enrollment' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Split grid: Left enrollment requested list, Right bulk enroll list uploading */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Duyệt Đăng Ký Học Tập Độc Lập</h3>
                <p className="text-xs text-slate-400 mt-1">Phê duyệt hoặc từ chối đơn đăng ký học tập của sinh viên cho học kỳ mới.</p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wide">
                      <th className="py-2.5 px-4">Sinh viên</th>
                      <th className="py-2.5 px-4">Mã số</th>
                      <th className="py-2.5 px-4">Học phần nguyện vọng</th>
                      <th className="py-2.5 px-4 text-center">Trạng thái</th>
                      <th className="py-2.5 px-4 text-center">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {enrollments.map((en) => (
                      <tr key={en.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-800">{en.studentName}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 font-medium">{en.studentCode}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{en.courseName}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            en.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            en.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {en.status === 'pending' ? 'Hàng Chờ' : en.status === 'approved' ? 'Chấp nhận' : 'Từ chối'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {en.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => updateEnrollmentStatus(en.id, 'approved')}
                                className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition cursor-pointer"
                                title="Đồng ý tuyển sinh"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateEnrollmentStatus(en.id, 'rejected')}
                                className="p-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 transition cursor-pointer"
                                title="Từ chối"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">- Completed -</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bulk Enroll list paste */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Tuyển học viên tập trung (Bulk Enroll)</h3>
                <p className="text-xs text-slate-400 mt-1">Dán một loạt Mã sinh viên (MSSV) cách nhau bằng dấu phẩy để tự động nhập học học phần môn Data Science.</p>
              </div>

              <form onSubmit={handleBulkEnrollSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 font-sans">Danh sách mã SV (MSSV)</label>
                  <textarea
                    rows={4}
                    value={bulkMssvList}
                    onChange={(e) => setBulkMssvList(e.target.value)}
                    placeholder="Ví dụ: SV20250001, SV20250002, SV20250005"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  ></textarea>
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-[11px] text-indigo-700 leading-normal">
                  💡 Nhập chuẩn định dạng MSSV. Hệ thống sẽ tự kiểm tra trạng thái hoạt động của tài khoản trước khi khớp và phê duyệt lớp trực tiếp.
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Xác nhận Nhập Học Hàng Loạt
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE MANAGEMENT */}
      {activeSubPage === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">Kế hoạch Khảo thí & Lịch Học Lớp Học Kỳ Summer 2026</h2>
              <p className="text-xs text-slate-400 mt-1">Xếp phòng và quản lý sỹ số tránh trùng phòng học (Conflict detection logic).</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-100"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Lịch Sắp Xếp</span>
              </button>
            </div>
          </div>

          {/* Academic Schedule Grid */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full min-w-[700px] border-collapse text-left text-xs bg-white">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600 text-center">
                  <th className="py-3 px-4 w-32 border-r border-slate-100">Khung thời gian</th>
                  <th className="py-3 px-2 border-r border-slate-100 w-1/5">Thứ 2 (Mon)</th>
                  <th className="py-3 px-2 border-r border-slate-100 w-1/5">Thứ 3 (Tue)</th>
                  <th className="py-3 px-2 border-r border-slate-100 w-1/5">Thứ 4 (Wed)</th>
                  <th className="py-3 px-2 border-r border-slate-100 w-1/5">Thứ 5 (Thu)</th>
                  <th className="py-3 px-2 w-1/5">Thứ 6 (Fri)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 1, name: 'Ca 1 (07:30 - 09:30)' },
                  { id: 2, name: 'Ca 2 (09:45 - 11:45)' },
                  { id: 3, name: 'Ca 3 (13:00 - 15:00)' },
                  { id: 4, name: 'Ca 4 (15:15 - 17:15)' }
                ].map((slot) => (
                  <tr key={slot.id} className="h-28 hover:bg-slate-50/20">
                    <td className="p-3 border-r border-slate-100 font-bold text-slate-600 bg-slate-50/50 flex flex-col justify-center h-28 text-center">
                      <p>{slot.name}</p>
                    </td>
                    {[2, 3, 4, 5, 6].map((day) => {
                      const matchedClass = courses.filter(c =>
                        c.schedule.some(s => s.day === day && s.slot === slot.id)
                      );

                      return (
                        <td key={day} className="p-2 border-r border-slate-100 align-top relative">
                          <div className="space-y-1">
                            {matchedClass.map((c) => {
                              const s = c.schedule.find(s => s.day === day && s.slot === slot.id);
                              return (
                                <div
                                  key={c.id}
                                  className="p-2 rounded-lg text-[10px] leading-snug border bg-indigo-50/60 border-indigo-100 text-indigo-900 shadow-xs flex flex-col justify-between h-24"
                                >
                                  <div>
                                    <div className="flex justify-between items-start font-bold">
                                      <p className="truncate font-sans">{c.code}: {c.name}</p>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono font-medium mt-1">Phòng: {s?.room}</p>
                                  </div>
                                  <p className="text-[9px] font-bold text-indigo-600 font-sans tracking-wide truncate bg-indigo-100/50 rounded px-1 self-start">
                                    Sỹ số: {c.enrolled}/{c.maxEnroll}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. FINANCE */}
      {activeSubPage === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Tuition manager listing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Quản lý Biên lai & Chế độ Thu Học Phí</h3>
                <p className="text-xs text-slate-400 mt-1">Theo dõi đóng học phí học kỳ, tích hợp click để đổi thủ công trạng thái đã nộp.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100/70">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-wide">
                    <th className="py-2.5 px-4">Tài khoản Sinh viên</th>
                    <th className="py-2.5 px-4">Số tiền (VND)</th>
                    <th className="py-2.5 px-4">Học bổng</th>
                    <th className="py-2.5 px-4">Mục đích</th>
                    <th className="py-2.5 px-4 text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{tx.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.studentCode}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {tx.amount.toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-purple-600 font-semibold font-mono">
                        {tx.scholarshipAmt ? `-${tx.scholarshipAmt.toLocaleString('vi-VN')}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 capitalize">{tx.type}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleTuitionPaid(tx)}
                          className="focus:outline-none"
                        >
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer hover:opacity-80 transition ${
                            tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            tx.status === 'unpaid' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {tx.status === 'paid' ? 'Đã Thanh Toán ✓' : tx.status === 'unpaid' ? 'Chưa nộp' : 'Đang xử lý'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scholarship list */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Xét duyệt Học mẫn sinh viên</h3>
              <button
                onClick={() => setIsScholarshipModalOpen(true)}
                className="p-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-[10px] hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cấp Học Bổng</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {transactions
                .filter(t => t.scholarshipAmt && t.scholarshipAmt > 0)
                .map((sch) => (
                  <div key={sch.id} className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/20 text-xs flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-slate-800">{sch.studentName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{sch.studentCode} • Học bổng Khuyến học</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 font-bold font-mono text-[11px]">
                      {sch.scholarshipAmt?.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* manager create module form modal */}
      {isNewCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Khởi tạo kế hoạch môn học</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mã môn học</label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="MKT101, SWE301..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 mb-1">Số tín chỉ</label>
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    max={4}
                    min={1}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tên môn học / Học phần</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Thiết kế đồ họa UI/UX..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Giảng viên phân công</label>
                <select
                  value={newTeacherId}
                  onChange={(e) => setNewTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Chọn giảng viên đứng lớp --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.department || 'Bộ môn CNTT'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sỹ số lớp tối đa</label>
                  <input
                    type="number"
                    value={newMax}
                    onChange={(e) => setNewMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mô tả học thuật</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Viết tóm tắt đề cương môn học..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewCourseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 cursor-pointer hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Khởi Tạo Lớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* manager assignment slot scheduling modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Xếp phòng và ca học học phần</h3>
            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Chọn lớp học cần xếp</label>
                <select
                  required
                  value={schCourseId}
                  onChange={(e) => setSchCourseId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Danh sách môn hoạt động --</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Chọn ngày học</label>
                  <select
                    value={schDay}
                    onChange={(e) => setSchDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={2}>Thứ 2 (Thứ Hai)</option>
                    <option value={3}>Thứ 3 (Thứ Ba)</option>
                    <option value={4}>Thứ 4 (Thứ Tư)</option>
                    <option value={5}>Thứ 5 (Thứ Năm)</option>
                    <option value={6}>Thứ 6 (Thứ Sáu)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Chọn ca học</label>
                  <select
                    value={schSlot}
                    onChange={(e) => setSchSlot(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={1}>Ca 1 (07:30 - 09:30)</option>
                    <option value={2}>Ca 2 (09:45 - 11:45)</option>
                    <option value={3}>Ca 3 (13:00 - 15:00)</option>
                    <option value={4}>Ca 4 (15:15 - 17:15)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Phòng học (Room Number)</label>
                <input
                  type="text"
                  required
                  value={schRoom}
                  onChange={(e) => setSchRoom(e.target.value)}
                  placeholder="Ví dụ: R301, Lab201"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Xác nhận xếp lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* manager scholarship add modal */}
      {isScholarshipModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative shadow-2xl">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Cấp phát chế độ khuyến học</h3>
            <form onSubmit={handleScholarshipAdd} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Chọn sinh viên thụ hưởng</label>
                <select
                  required
                  value={scholStudentId}
                  onChange={(e) => setScholStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Học viên đang hoạt động --</option>
                  {activeStudents.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.studentId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Số tiền hỗ trợ học bổng (VND)</label>
                <select
                  value={scholAmount}
                  onChange={(e) => setScholAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value={3000000}>Học bổng loại Khá : 3.000.000 đ</option>
                  <option value={7650000}>Học bổng loại Giỏi (50%): 7.650.000 đ</option>
                  <option value={15300000}>Học bổng xuất sắc (100%): 15.300.000 đ</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsScholarshipModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  Phê Duyệt Khuyến Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
