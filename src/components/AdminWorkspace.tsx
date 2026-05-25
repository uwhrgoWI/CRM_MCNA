/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, BookOpen, DollarSign, Cpu, Clock, UserPlus, FileSpreadsheet, Settings, ShieldCheck, Shield, AlertTriangle, ToggleLeft, ToggleRight, Download, Search, Check, Trash2, Edit3, RotateCcw, Plus, Save, Sparkles, Landmark } from 'lucide-react';
import { User, AuditLog, Course, Transaction } from '../types';
import { SVGBarChart, SVGLineChart, SVGDonutChart } from './Charts';

interface AdminWorkspaceProps {
  users: User[];
  courses: Course[];
  auditLogs: AuditLog[];
  transactions: Transaction[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
  activeSubPage: string;
}

export function AdminWorkspace({
  users,
  courses,
  auditLogs,
  transactions = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  toast,
  activeSubPage,
}: AdminWorkspaceProps) {
  
  // USER MANAGEMENT STATES
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'manager' | 'teacher' | 'student'>('student');
  const [newPhone, setNewPhone] = useState('');
  const [newMajor, setNewMajor] = useState('Software Engineering');
  const [newPassword, setNewPassword] = useState('Student@123');

  // Edit User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');

  // SYSTEM SETTINGS STATES
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'academic' | 'security' | 'flags'>('general');
  const [schoolName, setSchoolName] = useState('Trường Đại học Bách Khoa LMS');
  const [schoolEmail, setSchoolEmail] = useState('admissions@lms.vn');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semesterDates, setSemesterDates] = useState('05/05/2026 - 31/08/2026');
  
  // Feature Flags State
  const [featureFlags, setFeatureFlags] = useState([
    { id: 'flag-reg', name: 'Đăng ký tự học viên (Self-Registration)', description: 'Cho phép sinh viên tự đăng ký thông tin cá nhân ngoài trang login.', enabled: true },
    { id: 'flag-pay', name: 'Cổng thanh toán trực tuyến', description: 'Tích hợp thanh toán học phí qua ví điện tử VNPAY, VNQR.', enabled: true },
    { id: 'flag-gpa', name: 'Giả lập GPA tuyển sinh', description: 'Hỗ trợ sinh viên giả lập điểm để tính toán hướng học tập.', enabled: true },
    { id: 'flag-sms', name: 'Thông báo SMS vắng học', description: 'Tự động gửi tin nhắn điện thoại cho phụ huynh khi sinh viên vắng học.', enabled: false },
    { id: 'flag-mfa', name: 'Yêu cầu 2FA khắt khe', description: 'Bắt buộc giáo viên/quản lý phải xác thực OTP qua email khi đăng nhập.', enabled: false },
    { id: 'flag-logs', name: 'Định vị IP nhật ký chi tiết', description: 'Ghi nhận kinh độ/vĩ độ của IP thực hiện thao tác quản trị.', enabled: true },
    { id: 'flag-backup', name: 'Sao lưu tự động hàng ngày', description: 'Hệ thống tự động đồng bộ dữ liệu lúc 02:00 sáng hàng ngày lên cloud.', enabled: true }
  ]);

  // RBAC permissions matrix state
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, string>>>({
    'Quản lý Người dùng': { admin: 'Full', manager: 'Read-only', teacher: 'None', student: 'None' },
    'Quản lý Khóa học': { admin: 'Full', manager: 'Full', teacher: 'Scoped', student: 'Read-only' },
    'Nhập Điểm học thuật': { admin: 'Full', manager: 'Read-only', teacher: 'Full', student: 'None' },
    'Lập Lịch thi khảo thí': { admin: 'Full', manager: 'Full', teacher: 'Read-only', student: 'Read-only' },
    'Cấu hình Tài chính': { admin: 'Full', manager: 'Full', teacher: 'None', student: 'Read-only' },
    'Cài đặt Hệ thống': { admin: 'Full', manager: 'None', teacher: 'None', student: 'None' },
  });

  // AUDIT LOGS SEARCH STATE
  const [logSearch, setLogSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('all');

  // FINANCIAL EXPENSES, MARKETING LOGS AND LIABILITIES STATES
  const [systemExpenses, setSystemExpenses] = useState([
    { id: 'exp-1', name: 'Chi phí AdWords tuyển sinh kỳ đại học mới', type: 'marketing', amount: 320000000, term: 'Kỳ Spring 2026', status: 'paid', description: 'Chi phí quảng cáo Google & Facebook thu hút sinh viên đăng ký nhập học.' },
    { id: 'exp-2', name: 'Truyền thông sự kiện Campus Open Day', type: 'marketing', amount: 140000000, term: 'Tháng 05/2026', status: 'pending', description: 'Chi phí in ấn, KOLs và tổ chức ngày hội tư vấn tuyển sinh tại cơ sở.' },
    { id: 'exp-3', name: 'Thuê bao máy chủ GCP & Cloudflare CDN', type: 'operation', amount: 85000000, term: 'Tháng 05/2026', status: 'paid', description: 'Hạ tầng hệ thống máy chủ chính phục vụ tải 500+ users đồng thời.' },
    { id: 'exp-4', name: 'Giấy phép API tích hợp Zoom & Teams', type: 'operation', amount: 45000000, term: 'Hàng năm', status: 'paid', description: 'Cập quyền tài khoản lớp học ảo Zoom Pro cho 30 giảng viên chính quy.' },
    { id: 'exp-5', name: 'Thanh toán nợ hạ tầng AI Cloud Gemini Enterprise', type: 'operation', amount: 160000000, term: 'Tháng 05/2026', status: 'unpaid', description: 'Công cụ tích hợp API thông minh phân tích và tự sinh nội dung khóa học.' },
    { id: 'exp-6', name: 'Phê duyệt bảo mật & Đánh giá an toàn thông tin', type: 'operation', amount: 95000000, term: 'Kỳ Summer 2026', status: 'unpaid', description: 'Kiểm toán an ninh mạng thuê ngoài từ đối tác CyStack.' }
  ]);

  const [expTypeFilter, setExpTypeFilter] = useState('all');
  const [expStatusFilter, setExpStatusFilter] = useState('all');

  // New Expense form state
  const [isNewExpOpen, setIsNewExpOpen] = useState(false);
  const [newExpName, setNewExpName] = useState('');
  const [newExpType, setNewExpType] = useState('marketing');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpTerm, setNewExpTerm] = useState('Kỳ Summer 2026');
  const [newExpStatus, setNewExpStatus] = useState('unpaid');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Handle Feature Flag Toggle
  const handleToggleFlag = (id: string) => {
    setFeatureFlags(prev => prev.map(flag => {
      if (flag.id === id) {
        const nextState = !flag.enabled;
        toast(`Đã cập nhật tính năng "${flag.name}" sang ${nextState ? 'BẬT' : 'TẮT'}`, 'info');
        return { ...flag, enabled: nextState };
      }
      return flag;
    }));
  };

  // Cycle permissions state: Full -> Scoped -> Read-only -> None -> Full
  const cyclePermission = (moduleName: string, roleKey: string) => {
    const levels = ['Full', 'Scoped', 'Read-only', 'None'];
    const current = permissionsMatrix[moduleName][roleKey];
    const nextIdx = (levels.indexOf(current) + 1) % levels.length;
    const nextVal = levels[nextIdx];

    setPermissionsMatrix(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [roleKey]: nextVal
      }
    }));
    toast(`Cập nhật quyền ${moduleName} cho ${roleKey} thành [${nextVal}]`, 'success');
  };

  // Save permission changes
  const savePermissions = () => {
    toast('Đã lưu dữ liệu Phân quyền RBAC thành công vào cơ sở dữ liệu!', 'success');
  };

  // EXPENSE CONTROLLER HANDLERS
  const handleAddNewExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpName.trim() || !newExpAmount.trim()) {
      toast('Vui lòng điền đủ tên khoản chi và số tiền!', 'warning');
      return;
    }
    const amt = parseInt(newExpAmount.toString().replace(/[^0-9]/g, ''));
    if (isNaN(amt) || amt <= 0) {
      toast('Số tiền phải là số nguyên dương hợp lệ!', 'error');
      return;
    }
    const newExp = {
      id: `exp-${Date.now()}`,
      name: newExpName,
      type: newExpType,
      amount: amt,
      term: newExpTerm,
      status: newExpStatus,
      description: newExpDesc || 'Không có mô tả bổ sung.'
    };
    setSystemExpenses(prev => [newExp, ...prev]);
    toast(`Đã khởi tạo thành công khoản chi "${newExpName}"!`, 'success');
    
    // reset form
    setNewExpName('');
    setNewExpAmount('');
    setNewExpDesc('');
    setIsNewExpOpen(false);
  };

  const handleDeleteExpense = (id: string, name: string) => {
    setSystemExpenses(prev => prev.filter(e => e.id !== id));
    toast(`Đã hủy bỏ khoản chi: ${name}`, 'info');
  };

  const handleUpdateExpenseStatus = (id: string, newStatus: string) => {
    setSystemExpenses(prev => prev.map(e => {
      if (e.id === id) {
        return { ...e, status: newStatus };
      }
      return e;
    }));
    toast(`Đã cập nhật trạng thái khoản chi tuyển sinh/vận hành thành [${newStatus === 'paid' ? 'Đã Thanh Toán' : newStatus === 'pending' ? 'Chờ Duyệt Chi' : 'Chưa Thanh Toán'}]`, 'success');
  };

  // Save general settings
  const saveGeneralSettings = () => {
    toast('Đã cập nhật cấu hình hệ thống cài đặt!', 'success');
  };

  // User Management filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone.includes(userSearch);
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ? true : u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // User pagination
  const totalEntries = filteredUsers.length;
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(totalEntries / usersPerPage) || 1;

  const handlePageChange = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  // Bulk operation actions
  const toggleSelectAllUsers = () => {
    if (selectedUserIds.length === currentUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(currentUsers.map(u => u.id));
    }
  };

  const handleSelectUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedUserIds(prev => [...prev, id]);
    }
  };

  const handleBulkDeactivate = () => {
    if (selectedUserIds.length === 0) {
      toast('Vui lòng chọn ít nhất một người dùng.', 'warning');
      return;
    }
    selectedUserIds.forEach(id => {
      const user = users.find(u => u.id === id);
      if (user) {
        onUpdateUser({ ...user, status: 'inactive' });
      }
    });
    setSelectedUserIds([]);
    toast(`Đã khoá hoạt động cho ${selectedUserIds.length} tài khoản thành công`, 'success');
  };

  // Inline single status toggle
  const toggleUserStatus = (u: User) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    onUpdateUser({ ...u, status: newStatus });
    toast(`Đã cập nhật trạng thái tài khoản ${u.name} thành ${newStatus === 'active' ? 'Đang hoạt động' : 'Bị Khóa'}`, 'info');
  };

  // Add User handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      toast('Vui lòng điền thông tin email và tên.', 'warning');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === newEmail.toLowerCase().trim())) {
      toast('Địa chỉ email này đã tồn tại trong hệ thống.', 'error');
      return;
    }

    const createdUser: User = {
      id: `usr-created-${Date.now()}`,
      email: newEmail.toLowerCase().trim(),
      password: newPassword,
      name: newName,
      role: newRole,
      avatar_initials: newName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() || 'US',
      avatar_color: getRoleColor(newRole),
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastLogin: '-',
      phone: newPhone || '0901234567',
      major: newRole === 'student' ? newMajor : undefined,
      department: (newRole === 'teacher' || newRole === 'manager') ? newMajor : undefined,
      studentId: newRole === 'student' ? `SV${new Date().getFullYear()}${(users.filter(u => u.role === 'student').length + 1).toString().padStart(4, '0')}` : undefined,
      gpa: newRole === 'student' ? 4.0 : undefined
    };

    onAddUser(createdUser);
    setIsAddModalOpen(false);
    
    // Clear states
    setNewEmail('');
    setNewName('');
    setNewPhone('');
    toast(`Đã khởi tạo tài khoản mới cho [${createdUser.name}] thành công!`, 'success');
  };

  const getRoleColor = (role: string) => {
    if (role === 'admin') return 'bg-red-500';
    if (role === 'manager') return 'bg-purple-500';
    if (role === 'teacher') return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  // Handle edit setup
  const startEditUser = (u: User) => {
    setEditingUserId(u.id);
    setEditName(u.name);
    setEditPhone(u.phone);
    setEditMajor(u.major || u.department || 'Software Engineering');
    setEditStatus(u.status);
  };

  const handleEditSave = (u: User) => {
    const updated = {
      ...u,
      name: editName,
      phone: editPhone,
      major: u.role === 'student' ? editMajor : undefined,
      department: (u.role === 'teacher' || u.role === 'manager') ? editMajor : undefined,
      status: editStatus,
    };
    onUpdateUser(updated);
    setEditingUserId(null);
    toast(`Đã cập nhật thông tin thành công cho ${u.name}`, 'success');
  };

  // Seed user counts
  const totalUsersCount = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const managerCount = users.filter(u => u.role === 'manager').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;
  const studentCount = users.filter(u => u.role === 'student').length;

  const mockUserGrowth = [
    { label: 'Tháng 12', value: 85 },
    { label: 'Tháng 1', value: 110 },
    { label: 'Tháng 2', value: 138 },
    { label: 'Tháng 3', value: 162 },
    { label: 'Tháng 4', value: 195 },
    { label: 'Tháng 5', value: totalUsersCount },
  ];

  const mockRevenueTrend = [
    { label: 'Tháng 12', value: 3450 },
    { label: 'Tháng 1', value: 5200 },
    { label: 'Tháng 2', value: 4100 },
    { label: 'Tháng 3', value: 7800 },
    { label: 'Tháng 4', value: 8900 },
    { label: 'Tháng 5', value: 9245 },
  ];

  const mockRoleDonut = [
    { label: 'admin', value: adminCount, color: '#ef4444' },
    { label: 'manager', value: managerCount, color: '#a855f7' },
    { label: 'teacher', value: teacherCount, color: '#3b82f6' },
    { label: 'student', value: studentCount, color: '#10b981' },
  ];

  // Audit Logs Filter details
  const filteredAudit = auditLogs.filter(log => {
    const matchesSearch = log.userEmail.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.resource.toLowerCase().includes(logSearch.toLowerCase());
    const matchesStatus = logStatusFilter === 'all' ? true : log.status === logStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. OVERVIEW DASHBOARD SUBPAGE */}
      {activeSubPage === 'dashboard' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Welcome Info */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Hệ Thống Trung Tâm Kiểm Soát (Admin Cloud)</h2>
              <p className="text-blue-100 text-xs md:text-sm mt-1">Quản lý tài nguyên, định cấu hình danh mục phân quyền và theo dõi luồng máy chủ thực tế.</p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-md shadow-indigo-900/10 cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản</span>
              </button>
              <button
                onClick={() => toast('Báo cáo thống kê quản trị viên đã xuất thành công ra định dạng CSV!', 'success')}
                className="px-4 py-2 bg-indigo-600 border border-indigo-500 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Xuất PDF</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Tổng Người Dùng</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{totalUsersCount}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Số Khóa Học</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">{courses.length}</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Thu Học Phí (Tháng)</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">92.4M</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Thời Gian Hoạt Động</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">99.98%</h3>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phiên Active Live</p>
                <h3 className="text-lg font-bold text-slate-800 font-mono">14</h3>
              </div>
            </div>
          </div>

          {/* Core Hand-Crafted SVG Charts without libraries! Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-[360px]">
              <SVGBarChart data={mockUserGrowth} />
            </div>
            <div className="h-[360px]">
              <SVGLineChart data={mockRevenueTrend} />
            </div>
            <div className="h-[360px]">
              <SVGDonutChart data={mockRoleDonut} />
            </div>
          </div>

          {/* Activity Logs inside Dashboard Preview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Hoạt Động Hệ Thống Gần Đây</h3>
              <span className="text-xs text-indigo-600 font-bold">Chỉ số mạng: An toàn</span>
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2.5">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    <div>
                      <span className="font-mono text-slate-600 font-semibold">{log.userEmail}</span>
                      <span className="ml-1.5 text-slate-400 font-sans">{log.action}</span>
                      <span className="ml-1.5 text-indigo-500 font-mono bg-sky-50 px-1.5 py-0.5 rounded text-[10px]">{log.resource}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. USER MANAGEMENT */}
      {activeSubPage === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Danh sách người dùng hệ thống (RBAC Node)</h2>
              <p className="text-xs text-slate-400">Xem và phân vùng hồ sơ quyền truy cập của sinh viên, giáo viên, quản lý đào tạo.</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleBulkDeactivate}
                disabled={selectedUserIds.length === 0}
                className="px-3 py-1.5 rounded-xl border border-rose-100 bg-rose-50/20 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <span>Khoá Hàng Loạt ({selectedUserIds.length})</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Thành Viên</span>
              </button>
            </div>
          </div>

          {/* Search filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Mọi vai trò (Roles)</option>
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="manager">Quản lý đào tạo (Manager)</option>
                <option value="teacher">Giảng viên (Teacher)</option>
                <option value="student">Sinh viên (Student)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Trạng thái tài khoản</option>
                <option value="active">Đang kích hoạt (Active)</option>
                <option value="inactive">Đang bị khoá (Inactive)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest shrink-0">Hiển thị</span>
              <select
                value={usersPerPage}
                onChange={(e) => {
                  setUsersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* User database table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.length > 0 && selectedUserIds.length === currentUsers.length}
                      onChange={toggleSelectAllUsers}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Hồ sơ / Email</th>
                  <th className="py-3 px-4">Số điện thoại</th>
                  <th className="py-3 px-4">Vai trò (Role)</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4">Đăng nhập gần nhất</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400 font-medium">
                      📭 Hòm thư rỗng - Không tìm thấy người dùng nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((u) => {
                    const isSelfAdmin = u.id === 'usr-admin';
                    const isEditing = editingUserId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={() => handleSelectUser(u.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8.5 h-8.5 rounded-full ${u.avatar_color} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                              {u.avatar_initials}
                            </div>
                            <div className="min-w-0">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="px-2 py-0.5 rounded border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold w-40"
                                />
                              ) : (
                                <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                              )}
                              <p className="text-[10px] text-slate-400 font-mono truncate">{u.email}</p>
                              {u.studentId && (
                                <span className="inline-block text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-100 rounded-md px-1.5 py-0.2 mt-0.5">
                                  {u.studentId} • {isEditing ? (
                                    <select
                                      value={editMajor}
                                      onChange={(e) => setEditMajor(e.target.value)}
                                      className="text-[9px] border-none p-0 bg-transparent font-sans text-amber-700 font-bold focus:outline-none"
                                    >
                                      <option value="Software Engineering">Kỹ thuật phần mềm</option>
                                      <option value="Information Technology">CNTT</option>
                                      <option value="Data Science">Data Science</option>
                                      <option value="Digital Marketing">Marketing</option>
                                    </select>
                                  ) : u.major}
                                </span>
                              )}
                              {u.department && (
                                <span className="inline-block text-[9px] font-sans font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-md px-1.5 py-0.5 mt-1">
                                  💼 {isEditing ? (
                                    <select
                                      value={editMajor}
                                      onChange={(e) => setEditMajor(e.target.value)}
                                      className="text-[9px] border-none p-0 bg-transparent font-sans text-blue-700 font-bold focus:outline-none"
                                    >
                                      <option value="Bộ môn Công nghệ phần mềm">Bộ môn Công nghệ phần mềm</option>
                                      <option value="Bộ môn Khoa học Máy tính & AI">Bộ môn Khoa học Máy tính & AI</option>
                                      <option value="Bộ môn An toàn Thông tin & Mạng">Bộ môn An toàn Thông tin & Mạng</option>
                                      <option value="Bộ môn Khoa học Dữ liệu & HTTT">Bộ môn Khoa học Dữ liệu & HTTT</option>
                                      <option value="Bộ môn Thiết kế Đồ họa & Game">Bộ môn Thiết kế Đồ họa & Game</option>
                                      <option value="Bộ môn Quản trị Kinh doanh">Bộ môn Quản trị Kinh doanh</option>
                                      <option value="Bộ môn Tiếp thị Số">Bộ môn Tiếp thị Số</option>
                                    </select>
                                  ) : u.department}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="px-2 py-0.5 rounded border border-indigo-300 focus:outline-none w-28 text-xs font-mono"
                            />
                          ) : (
                            u.phone
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            u.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                            u.role === 'manager' ? 'bg-purple-50 text-purple-600 border border-purple-100' :
                            u.role === 'teacher' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isEditing ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value as 'active' | 'inactive')}
                              className="px-2 py-0.5 rounded border border-indigo-300 focus:ring-1 bg-white"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Locked</option>
                            </select>
                          ) : (
                            <button
                              disabled={isSelfAdmin}
                              onClick={() => toggleUserStatus(u)}
                              className="focus:outline-none"
                            >
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 cursor-pointer' : 'bg-slate-200 text-slate-600 cursor-pointer'
                              }`}>
                                {u.status === 'active' ? '● Live' : '○ Bị Khóa'}
                              </span>
                            </button>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {u.lastLogin !== '-' ? new Date(u.lastLogin).toLocaleString('vi-VN') : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(u)}
                                  className="p-1 rounded-md hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                                  title="Lưu thay đổi"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingUserId(null)}
                                  className="p-1 rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer"
                                  title="Hủy"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditUser(u)}
                                  className="p-1 rounded-md hover:bg-indigo-50 text-indigo-500 cursor-pointer"
                                  title="Chỉnh sửa hồ sơ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  disabled={isSelfAdmin}
                                  onClick={() => {
                                    if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản ${u.name}?`)) {
                                      onDeleteUser(u.id);
                                      toast(`Đã xóa vĩnh viễn tài khoản của ${u.name}`, 'info');
                                    }
                                  }}
                                  className="p-1 rounded-md hover:bg-rose-50 text-rose-500 disabled:opacity-40 cursor-pointer"
                                  title="Xóa tài khoản"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Paginated navigation */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs font-medium pt-3 text-slate-500">
              <span>Đang hiển thị {indexOfFirstUser + 1} – {Math.min(indexOfLastUser, totalEntries)} tương ứng {totalEntries} dòng thông tin.</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-40"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1.5 rounded-lg font-mono font-bold transition ${
                      currentPage === p ? 'bg-indigo-600 text-white shadow' : 'border border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition disabled:opacity-40"
                >
                  Tiếp
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. RBAC PERMISSIONS MATRIX */}
      {activeSubPage === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="w-5.5 h-5.5 text-indigo-600" />
              <span>Ma Trận Phân Quyền Vai Trò (RBAC Ruleset Matrix)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Định cấu hình các lớp phân quyền. Nhấp trực tiếp vào chip để đổi mức truy cập hệ thống bảo mật trực quan.</p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 px-5">Module / File Path Path ID</th>
                  <th className="py-3 px-4 text-center">Quản Trị Viên (Admin)</th>
                  <th className="py-3 px-4 text-center">Đào Tạo (Manager)</th>
                  <th className="py-3 px-4 text-center">Giảng Viên (Teacher)</th>
                  <th className="py-3 px-4 text-center">Sinh Viên (Student)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {Object.keys(permissionsMatrix).map((moduleName) => (
                  <tr key={moduleName} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-700">{moduleName}</td>
                    {['admin', 'manager', 'teacher', 'student'].map((r) => {
                      const level = permissionsMatrix[moduleName][r];
                      return (
                        <td key={r} className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => cyclePermission(moduleName, r)}
                            className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-[11px] font-bold font-mono transition shadow-sm active:scale-95 cursor-pointer uppercase border"
                            style={{
                              backgroundColor: level === 'Full' ? '#ecfdf5' : level === 'Scoped' ? '#eff6ff' : level === 'Read-only' ? '#fffbeb' : '#fef2f2',
                              color: level === 'Full' ? '#059669' : level === 'Scoped' ? '#2563eb' : level === 'Read-only' ? '#d97706' : '#dc2626',
                              borderColor: level === 'Full' ? '#a7f3d0' : level === 'Scoped' ? '#bfdbfe' : level === 'Read-only' ? '#fde68a' : '#fca5a5'
                            }}
                          >
                            <span>{level}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 text-xs text-slate-500 font-medium">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-bold text-slate-700 uppercase tracking-widest text-[10px]">Chú giải:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> <strong>Full</strong>: Toàn quyền Tạo, Chỉnh sửa, và Xóa tài nguyên.
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> <strong>Scoped</strong>: Chỉnh sửa tài nguyên tự sở hữu hoặc tự tải lên.
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> <strong>Read-only</strong>: Chỉ xem thông tin danh sách.
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> <strong>None</strong>: Khóa hoàn toàn, cấm truy cập.
              </span>
            </div>

            <button
              onClick={savePermissions}
              className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow shadow-indigo-100 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Cập Nhật Ma Trận</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. SYSTEM SETTINGS */}
      {activeSubPage === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Settings className="w-5.5 h-5.5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Cấu Hình Hoạt Động & Hệ Thống Core</h2>
          </div>

          {/* Settings Tabs selection */}
          <div className="flex gap-2.5 border-b border-slate-100 pb-px">
            {(['general', 'academic', 'security', 'flags'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSettingsTab(tab)}
                className={`pb-2 px-4 text-xs font-bold transition capitalize relative ${
                  activeSettingsTab === tab ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>
                  {tab === 'general' ? 'Cơ bản (General)' :
                   tab === 'academic' ? 'Học kỳ đào tạo' :
                   tab === 'security' ? 'Bảo Mật Core' : 'Chức năng (Flags)'}
                </span>
                {activeSettingsTab === tab && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 transition-all rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Form panels based on tabs */}
          {activeSettingsTab === 'general' && (
            <div className="space-y-4 animate-fadeIn max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tên tổ chức / Đại Giáo Dục</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email liên hệ / Tuyển sinh</label>
                  <input
                    type="email"
                    value={schoolEmail}
                    onChange={(e) => setSchoolEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hệ thống múi giờ</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho Chi Minh (GMT+7)</option>
                    <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 font-sans">Ngôn ngữ mặc định</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                    <option>Tiếng Việt (Vietnamese)</option>
                    <option>English (Mỹ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hạn chế kích thước tải lên</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white">
                    <option>10 MB (Khuyên dùng)</option>
                    <option>50 MB</option>
                    <option>100 MB</option>
                  </select>
                </div>
              </div>

              <button
                onClick={saveGeneralSettings}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow shadow-indigo-100 cursor-pointer"
              >
                Lưu Thay Đổi
              </button>
            </div>
          )}

          {activeSettingsTab === 'academic' && (
            <div className="space-y-4 animate-fadeIn max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Năm học quản trị hiện động</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-11">Ngày bắt đầu - kết thúc kỳ học</label>
                  <input
                    type="text"
                    value={semesterDates}
                    onChange={(e) => setSemesterDates(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Quy chế hệ số điểm mặc định</label>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded bg-white shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px]">ĐIỂM DANH</p>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-1">10%</p>
                  </div>
                  <div className="p-2.5 rounded bg-white shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px]">BÀI TẬP</p>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-1">10%</p>
                  </div>
                  <div className="p-2.5 rounded bg-white shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px]">GIỮA KỲ</p>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-1">30%</p>
                  </div>
                  <div className="p-2.5 rounded bg-white shadow-sm border border-slate-100">
                    <p className="font-bold text-slate-400 text-[10px]">CUỐI KỲ</p>
                    <p className="font-mono font-bold text-slate-800 text-sm mt-1">50%</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast('Cơ chế hệ số tính điểm học thuật đã cập nhật thành công!', 'success')}
                className="py-2 px-5 bg-indigo-600 text-white rounded-xl text-xs font-bold transition hover:bg-indigo-700 cursor-pointer"
              >
                Cập nhật Quy chế điểm
              </button>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div className="space-y-4 animate-fadeIn max-w-xl text-xs text-slate-600">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition">
                  <div>
                    <h5 className="font-semibold text-slate-800">Khóa tài khoản sau 5 lần nhập sai</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Tự động chặn đăng nhập từ IP trong 30 phút nếu vượt quá giới hạn.</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-indigo-600 flex items-center p-0.5 cursor-pointer justify-end">
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm"></span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition">
                  <div>
                    <h5 className="font-semibold text-slate-800">Yêu cầu chữ số & ký tự đặc biệt trong mật khẩu</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Thời hạn hiệu lực tối đa của mật khẩu mới khởi tạo.</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-indigo-600 flex items-center p-0.5 cursor-pointer justify-end">
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm"></span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-50/80 transition">
                  <div>
                    <h5 className="font-semibold text-slate-800">Tự động giải phóng phiên (Session Timeout)</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Đăng xuất người dùng tự động sau 60 phút nhàn rỗi.</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-slate-200 flex items-center p-0.5 cursor-pointer justify-start">
                    <span className="w-5 h-5 bg-white rounded-full shadow-sm"></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => toast('Chính sách bảo mật hệ thống được thiết lập!', 'success')}
                className="py-2 px-5 bg-indigo-600 text-white rounded-xl text-xs font-bold transition hover:bg-indigo-700 cursor-pointer"
              >
                Xác Nhận Thiết Lập Bảo Mật
              </button>
            </div>
          )}

          {activeSettingsTab === 'flags' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {featureFlags.map((flag) => (
                <div key={flag.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">{flag.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{flag.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleFlag(flag.id)}
                    className="focus:outline-none focus:ring-0 cursor-pointer shrink-0"
                  >
                    {flag.enabled ? (
                      <ToggleRight className="w-10 h-10 text-indigo-600" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-300" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. AUDIT LOG SUBPAGE */}
      {activeSubPage === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-fadeIn space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Shield className="w-5.5 h-5.5 text-indigo-600" />
                <span>Nhật Ký Hành Vi & Nhật Ký Truy Cập An Ninh Hệ Thống (Audit Trail)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Lưu trữ 20 bản ghi truy hồi về hành vi quản trị viên, giao dịch học phí, thay đổi bảng điểm quan trọng.</p>
            </div>
            <button
              onClick={() => toast('Xuất xuất nhật ký an ninh hệ thống ra file JSON thành công!', 'success')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-slate-600"
            >
              <Download className="w-4 h-4" />
              <span>Xuất tập tin</span>
            </button>
          </div>

          {/* Search audit logs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="relative col-span-2">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm hành động, IP đăng nhập, tài nguyên chịu tác động..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={logStatusFilter}
                onChange={(e) => setLogStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
              >
                <option value="all">Mọi trạng thái (Status)</option>
                <option value="success">Thành công (Success)</option>
                <option value="failed">Thất bại (Failed)</option>
                <option value="warning">Cảnh báo (Warning)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wide">
                  <th className="py-3 px-4">Thời gian xảy ra</th>
                  <th className="py-3 px-4">Người dùng tác động</th>
                  <th className="py-3 px-4">Hành vi (Action)</th>
                  <th className="py-3 px-4">Đối tượng chịu ảnh hưởng</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                {filteredAudit.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400 font-sans text-xs">
                      📭 Không tìm thấy kết quả phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredAudit.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-2.5 px-4 text-slate-500">{new Date(log.timestamp).toLocaleString('vi-VN')}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700">
                        <div className="flex flex-col">
                          <span>{log.userEmail}</span>
                          <span className="text-[9px] text-slate-400 capitalize font-sans font-medium">({log.role})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-indigo-700">{log.action}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50/50">{log.resource}</td>
                      <td className="py-2.5 px-4 text-slate-500">{log.ip}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.status === 'success' ? 'bg-emerald-50 text-emerald-600' :
                          log.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ADVANCED FINANCIAL EXPENSES & DEBT WORKSPACE */}
      {activeSubPage === 'finance' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                <Landmark className="w-6 h-6 shrink-0 text-emerald-300" />
                <span>Giám Sát Doanh Thu & Hệ Thống Chi Phí (Finance Controls)</span>
              </h2>
              <p className="text-emerald-100 text-xs md:text-sm mt-1">Giám sát dòng tiền, chi phí marketing tuyển sinh, chi phí vận hành máy chủ và tổng dư nợ nhà cung cấp.</p>
            </div>
            <button
              onClick={() => setIsNewExpOpen(true)}
              className="px-4 py-2 bg-white text-emerald-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khoản Chi Mới</span>
            </button>
          </div>

          {/* KPI metrics - Revenue, marketing expense, operating expense, student debt, and vendor liabilities */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Doanh Thu Thu Được</p>
                <h3 className="text-base font-bold text-emerald-600 font-mono">
                  {(transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0) / 1000000).toFixed(1)} Tr
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chi Phí Marketing</p>
                <h3 className="text-base font-bold text-orange-500 font-mono">
                  {(systemExpenses.filter(e => e.type === 'marketing').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} Tr
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chi Phí Vận Hành</p>
                <h3 className="text-base font-bold text-blue-600 font-mono">
                  {(systemExpenses.filter(e => e.type === 'operation').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} Tr
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Công Nợ Phải Thu (SV)</p>
                <h3 className="text-base font-bold text-rose-500 font-mono">
                  {(transactions.filter(t => t.status !== 'paid').reduce((sum, t) => sum + t.amount, 0) / 1000000).toFixed(1)} Tr
                </h3>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Dư Nợ Nhà Cung Cấp</p>
                <h3 className="text-base font-bold text-purple-700 font-mono">
                  {(systemExpenses.filter(e => e.status !== 'paid').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} Tr
                </h3>
              </div>
            </div>
          </div>

          {/* Content Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Danh mục khoản phân bổ chi tiêu</h3>
                <div className="flex gap-2">
                  <select
                    value={expTypeFilter}
                    onChange={(e) => setExpTypeFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] bg-white font-medium focus:outline-none"
                  >
                    <option value="all">Phân loại chi</option>
                    <option value="marketing">Tiếp thị & Open Campus</option>
                    <option value="operation">Hạ tầng & Vận hành</option>
                  </select>
                  <select
                    value={expStatusFilter}
                    onChange={(e) => setExpStatusFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] bg-white font-medium focus:outline-none"
                  >
                    <option value="all">Trạng thái chi</option>
                    <option value="paid">Đã thanh toán (Paid)</option>
                    <option value="unpaid">Còn nợ / Owed</option>
                    <option value="pending">Chờ phê duyệt</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-400">
                      <th className="py-2.5 px-3">Khoản chi tiêu</th>
                      <th className="py-2.5 px-3">Phân loại</th>
                      <th className="py-2.5 px-3 text-right">Số tiền (VNĐ)</th>
                      <th className="py-2.5 px-3">Hạn kỳ</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                      <th className="py-2.5 px-3 text-center">Xử lý</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium">
                    {systemExpenses
                      .filter(e => expTypeFilter === 'all' || e.type === expTypeFilter)
                      .filter(e => expStatusFilter === 'all' || e.status === expStatusFilter)
                      .map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50/40">
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-slate-700">{exp.name}</p>
                            <p className="text-[10px] text-slate-400 font-normal leading-relaxed">{exp.description}</p>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              exp.type === 'marketing' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {exp.type === 'marketing' ? 'Marketing' : 'Hạ tầng'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                            {exp.amount.toLocaleString('vi-VN')}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                            {exp.term}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              exp.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              exp.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                              'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}>
                              {exp.status === 'paid' ? 'Đã chi' : exp.status === 'pending' ? 'Chờ duyệt' : 'Còn nợ'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex gap-1.5 justify-center">
                              {exp.status !== 'paid' && (
                                <button
                                  onClick={() => handleUpdateExpenseStatus(exp.id, 'paid')}
                                  title="Đánh dấu đã chi"
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteExpense(exp.id, exp.name)}
                                title="Xóa bỏ"
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              {/* Graphical budget structure */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide text-indigo-700">Cơ cấu ngân sách chi tiêu</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-600">
                      <span>Tiếp thị tuyển sinh (Marketing)</span>
                      <span className="font-mono">
                        {(systemExpenses.filter(e => e.type === 'marketing').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} Tr (
                        {Math.round(systemExpenses.filter(e => e.type === 'marketing').reduce((sum, e) => sum + e.amount, 0) / (systemExpenses.reduce((sum, e) => sum + e.amount, 0) || 1) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${systemExpenses.filter(e => e.type === 'marketing').reduce((sum, e) => sum + e.amount, 0) / (systemExpenses.reduce((sum, e) => sum + e.amount, 0) || 1) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-bold text-slate-600">
                      <span>Vận hành & Máy chủ (Operating)</span>
                      <span className="font-mono">
                        {(systemExpenses.filter(e => e.type === 'operation').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} Tr (
                        {Math.round(systemExpenses.filter(e => e.type === 'operation').reduce((sum, e) => sum + e.amount, 0) / (systemExpenses.reduce((sum, e) => sum + e.amount, 0) || 1) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${systemExpenses.filter(e => e.type === 'operation').reduce((sum, e) => sum + e.amount, 0) / (systemExpenses.reduce((sum, e) => sum + e.amount, 0) || 1) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-medium leading-relaxed text-slate-400 border-t border-slate-50 pt-3">
                  ⚠️ Tổng ngân sách đã phân bổ: <strong className="font-mono text-slate-600">{(systemExpenses.reduce((sum,e) => sum + e.amount, 0) / 1000000).toFixed(1)} triệu VNĐ</strong>.
                  Số dư nợ cần thanh toán nhà cung cấp trong tháng: <strong className="font-mono text-purple-700">{(systemExpenses.filter(e => e.status !== 'paid').reduce((sum, e) => sum + e.amount, 0) / 1000000).toFixed(1)} triệu VNĐ</strong>.
                </div>
              </div>

              {/* Dynamic GPT Financial Advisor Assistant widget */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Trợ Lý Phân Tích Tài Chính AI</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Báo cáo cân bằng tối ưu tài chính LMS Pro</p>
                    </div>
                  </div>

                  <div className="text-xs space-y-3 leading-relaxed font-normal text-slate-300">
                    <p>
                      <strong>📊 Đánh giá Cơ cấu:</strong> Chi phí Vận hành hệ thống (<strong>{Math.round(systemExpenses.filter(e => e.type === 'operation').reduce((sum, e) => sum + e.amount, 0) / (systemExpenses.reduce((sum, e) => sum + e.amount, 0) || 1) * 100)}%</strong>) đang ở ngưỡng hợp lý. Điểm sáng là năng lực điện toán tối hóa của AI Gemini Cloud giúp nâng cao hiệu suất viết giáo án của giáo viên.
                    </p>
                    <p>
                      <strong>🔍 Rủi ro Công nợ:</strong> Công nợ thu học phí từ học viên đang đạt <span className="text-rose-400 font-bold">{(transactions.filter(t => t.status !== 'paid').reduce((sum, t) => sum + t.amount, 0) / 1000000).toFixed(1)} triệu VNĐ</span>. Nhà trường cần kích hoạt <strong>Flag Cổng thanh toán trực tuyến</strong> và gửi cảnh báo SMS thông minh để hỗ trợ các em hoàn tất học học phí nhanh chóng trước hạn thi học thuật.
                    </p>
                  </div>

                  <button
                    onClick={() => toast('AI đã gửi phân tích toàn diện về ngân sách của trường tới Email chính của bạn!', 'info')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    <span>Xuất báo cáo khuyến nghị AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EXPENSE MODAL */}
      {isNewExpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-1.5 border-b border-slate-50 pb-2">
              <Plus className="w-5 h-5 text-emerald-500" />
              <span>Khởi tạo khoản chi tiêu hệ thống mới</span>
            </h3>
            
            <form onSubmit={handleAddNewExpense} className="space-y-4 font-semibold text-xs text-slate-600">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Tên khoản chi tiêu</label>
                <input
                  type="text"
                  required
                  value={newExpName}
                  onChange={(e) => setNewExpName(e.target.value)}
                  placeholder="Ví dụ: Tài trợ chi phí quảng cáo Google AdWords"
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Phân loại chi tiêu</label>
                  <select
                    value={newExpType}
                    onChange={(e) => setNewExpType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="marketing">Tiếp thị & Open Campus</option>
                    <option value="operation">Hạ tầng & Vận hành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Số tiền chi (VNĐ)</label>
                  <input
                    type="text"
                    required
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(e.target.value)}
                    placeholder="Ví dụ: 12000000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Kỳ thanh toán</label>
                  <input
                    type="text"
                    value={newExpTerm}
                    onChange={(e) => setNewExpTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Trạng thái phê duyệt</label>
                  <select
                    value={newExpStatus}
                    onChange={(e) => setNewExpStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="unpaid">Chưa chi / Còn nợ (Owed)</option>
                    <option value="pending">Chờ ban giám hiệu duyệt (Pending)</option>
                    <option value="paid">Đã thanh toán thành công (Paid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mô tả chi tiết</label>
                <textarea
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  placeholder="Kiến nghị chi tiết và nguồn chứng từ hóa đơn đỏ..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsNewExpOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow shadow-emerald-100 cursor-pointer"
                >
                  Ghi Nhận Khoản Chi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CREATE USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-100 shadow-2xl p-6 relative">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Khởi tạo thành viên mới</h3>
            
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">Họ và tên người dùng</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Đặng Việt Triều"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">Địa chỉ Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="username@lms.vn"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0911..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-sans">Mật khẩu ban đầu</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Vai trò hệ thống (Role Badge)</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="student">Học sinh / Sinh viên (Student)</option>
                  <option value="teacher">Giảng viên / Thầy cô (Teacher)</option>
                  <option value="manager">Quản lý đào tạo (Manager)</option>
                  <option value="admin">Quản trị viên tối cao (Admin)</option>
                </select>
              </div>

              {newRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chuyên ngành đào tạo</label>
                  <select
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Software Engineering">Kỹ thuật phần mềm</option>
                    <option value="Information Technology">Công nghệ thông tin</option>
                    <option value="Data Science">Khoa học dữ liệu</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>
              )}

              {(newRole === 'teacher' || newRole === 'manager') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bộ môn giảng dạy / Phòng ban</label>
                  <select
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Bộ môn Công nghệ phần mềm">Bộ môn Công nghệ phần mềm</option>
                    <option value="Bộ môn Khoa học Máy tính & AI">Bộ môn Khoa học Máy tính & AI</option>
                    <option value="Bộ môn An toàn Thông tin & Mạng">Bộ môn An toàn Thông tin & Mạng</option>
                    <option value="Bộ môn Khoa học Dữ liệu & HTTT">Bộ môn Khoa học Dữ liệu & HTTT</option>
                    <option value="Bộ môn Thiết kế Đồ họa & Game">Bộ môn Thiết kế Đồ họa & Game</option>
                    <option value="Bộ môn Quản trị Kinh doanh">Bộ môn Quản trị Kinh doanh</option>
                    <option value="Bộ môn Tiếp thị Số">Bộ môn Tiếp thị Số</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow shadow-indigo-100 cursor-pointer"
                >
                  Khởi Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
