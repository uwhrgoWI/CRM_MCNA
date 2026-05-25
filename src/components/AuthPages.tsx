/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, Phone, User, GraduationCap, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthPagesProps {
  onLoginSuccess: (email: string, role: string, name: string) => void;
  users: UserType[];
  onAddUser: (user: UserType) => void;
}

export function AuthPages({ onLoginSuccess, users, onAddUser }: AuthPagesProps) {
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Focus effect for demo fill animation
  const [fieldHighlight, setFieldHighlight] = useState(false);

  // Register Form States (Multi-step)
  const [regStep, setRegStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState('nam');
  
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const [regMajor, setRegMajor] = useState('Software Engineering');
  const [regGradYear, setRegGradYear] = useState('2029');
  const [regReferral, setRegReferral] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Handle Quick Select pre-fills
  const handleQuickSelect = (email: string, pw: string) => {
    setLoginEmail(email);
    setLoginPassword(pw);
    setLoginError('');
    setFieldHighlight(true);
    setTimeout(() => setFieldHighlight(false), 800);
  };

  // Password rules checker
  const [strengthInfo, setStrengthInfo] = useState({
    score: 0,
    label: 'Rất yếu',
    color: 'bg-red-500',
    hasMinLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    isNotCommon: true,
  });

  const commonPasswords = [
    '12345678', '123456789', 'password', '12345678a', 'admin123', 'admin@123', 'student123', 'student@123'
  ];

  useEffect(() => {
    const p = regPassword;
    const hasMinLength = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p);
    const isNotCommon = !commonPasswords.includes(p.toLowerCase());

    let score = 0;
    if (hasMinLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (p.length > 0 && isNotCommon === false) {
      score = Math.max(1, score - 1);
    }

    let label = 'Quá yếu';
    let color = 'bg-red-500';

    if (p.length === 0) {
      label = 'Chưa nhập';
      color = 'bg-slate-200';
    } else if (score === 1) {
      label = 'Yêu';
      color = 'bg-rose-500';
    } else if (score === 2) {
      label = 'Trung bình';
      color = 'bg-amber-500';
    } else if (score === 3) {
      label = 'Mạnh';
      color = 'bg-emerald-500';
    } else if (score >= 4) {
      label = 'Rất mạnh';
      color = 'bg-purple-600';
    }

    setStrengthInfo({
      score,
      label,
      color,
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isNotCommon,
    });
  }, [regPassword]);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsLoggingIn(true);

    setTimeout(() => {
      const match = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase().trim() && u.password === loginPassword);
      
      if (match) {
        if (match.status === 'inactive') {
          setLoginError('Tài khoản này hiện đang bị khoá. Vui lòng liên hệ quản trị viên.');
          setIsLoggingIn(false);
          return;
        }
        setIsLoggingIn(false);
        onLoginSuccess(match.email, match.role, match.name);
      } else {
        setLoginError('Tài khoản hoặc mật khẩu không chính xác.');
        setIsLoggingIn(false);
      }
    }, 850);
  };

  // Inline email validation (uniqueness helper)
  const isEmailUnique = regEmail ? !users.some(u => u.email.toLowerCase() === regEmail.toLowerCase().trim()) : true;

  // Handle register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (regPassword !== regConfirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!isEmailUnique) {
      setRegisterError('Email này đã được sử dụng.');
      return;
    }

    if (strengthInfo.score < 3) {
      setRegisterError('Mật khẩu chưa đủ mạnh. Cần thêm độ bảo mật.');
      return;
    }

    if (!regTerms) {
      setRegisterError('Bạn phải chấp nhận các điều khoản và chính sách học thuật.');
      return;
    }

    const newStudentId = `SV${new Date().getFullYear()}${(users.filter(u => u.role === 'student').length + 1).toString().padStart(4, '0')}`;
    
    const newStudent: UserType = {
      id: `usr-new-${Date.now()}`,
      email: regEmail.toLowerCase().trim(),
      password: regPassword,
      name: regName,
      role: 'student',
      avatar_initials: regName.split(' ').map(n => n[0]).join('').slice(-2).toUpperCase() || 'SV',
      avatar_color: 'bg-emerald-600',
      status: 'active',
      joinedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      phone: regPhone || '0901234567',
      major: regMajor,
      studentId: newStudentId,
      gpa: 4.0 // Newly registered student star rating
    };

    onAddUser(newStudent);
    
    // Auto login
    onLoginSuccess(newStudent.email, newStudent.role, newStudent.name);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between" style={{ background: 'radial-gradient(ellipse at top, #eff6ff 0%, #ede9fe 100%)' }}>
      {/* Top logo branding */}
      <div className="pt-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 mb-2">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">LMS Pro</h1>
        <p className="text-xs text-slate-500 font-medium font-sans">Hệ thống Quản lý Học tập Phân quyền Cao cấp</p>
      </div>

      {/* Auth Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {authView === 'login' && (
          <div className="bg-white w-full max-w-md p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 transition-all duration-300">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Đăng Nhập Hệ Thống</h2>
              <p className="text-sm text-slate-400 mt-1">Sử dụng tài khoản LMS được cấp hoặc tài khoản Demo</p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email tài khoản</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@lms.vn"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      fieldHighlight ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => setAuthView('forgot')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                      fieldHighlight ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-4.5 h-4.5"
                  />
                  <span className="text-xs font-medium text-slate-500">Duy trì đăng nhập (Remember)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Đăng Nhập Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo select buttons */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">🎭 Tài Khoản Demo — Click để tự điền</h4>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickSelect('admin@lms.vn', 'Admin@123')}
                  className="px-3 py-2 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Quản trị (Admin)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('manager@lms.vn', 'Manager@123')}
                  className="px-3 py-2 rounded-xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 text-purple-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>Quản lý (Manager)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('teacher@lms.vn', 'Teacher@123')}
                  className="px-3 py-2 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Giảng viên (Teacher)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect('student@lms.vn', 'Student@123')}
                  className="px-3 py-2 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Sinh viên (Student)</span>
                </button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <span className="text-xs text-slate-400">Chưa có tài khoản sinh viên? </span>
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        )}

        {authView === 'register' && (
          <div className="bg-white w-full max-w-lg p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 transition-all duration-300">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${regStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                <span className={`text-xs font-semibold ${regStep === 1 ? 'text-slate-800' : 'text-slate-400'}`}>Cá nhân</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-slate-100">
                <div className={`h-full bg-indigo-600 transition-all ${regStep >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${regStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                <span className={`text-xs font-semibold ${regStep === 2 ? 'text-slate-800' : 'text-slate-400'}`}>Tài khoản</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-slate-100">
                <div className={`h-full bg-indigo-600 transition-all ${regStep >= 3 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${regStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>3</span>
                <span className={`text-xs font-semibold ${regStep === 3 ? 'text-slate-800' : 'text-slate-400'}`}>Học thuật</span>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">Tự Đăng Ký Học Viên</h2>
              <p className="text-xs text-slate-400">Trở thành một phần của cộng đồng LMS Pro</p>
            </div>

            {registerError && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* STEP 1: Personal Info */}
              {regStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Họ và tên sinh viên</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <User className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Số điện thoại</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                          <Phone className="w-4.5 h-4.5" />
                        </span>
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="0911..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Ngày sinh</label>
                      <input
                        type="date"
                        required
                        value={regDob}
                        onChange={(e) => setRegDob(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Giới tính</label>
                    <div className="flex gap-4">
                      {['nam', 'nữ', 'khác'].map((g) => (
                        <label key={g} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={regGender === g}
                            onChange={() => setRegGender(g)}
                            className="text-indigo-600 focus:ring-indigo-500/10 w-4 h-4"
                          />
                          <span className="text-sm font-medium text-slate-600 capitalize">{g}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                    >
                      Quay lại Đăng nhập
                    </button>
                    <button
                      type="button"
                      disabled={!regName || !regPhone || !regDob}
                      onClick={() => setRegStep(2)}
                      className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Tiếp tục</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Account setup & strength meter */}
              {regStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Địa chỉ Email đăng ký</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => {
                          setRegEmail(e.target.value);
                          setRegisterError('');
                        }}
                        placeholder="yourname@student.vn"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                          regEmail && !isEmailUnique ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      />
                    </div>
                    {regEmail && !isEmailUnique && (
                      <p className="text-xs text-rose-500 font-medium mt-1">⚠️ Email này đã được đăng ký trong danh sách người dùng.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mật khẩu bảo mật</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      placeholder="Nhập ít nhất 8 ký tự..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                    />

                    {/* Password Strength bar indicator */}
                    {regPassword && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                          <span style={{ color: strengthInfo.color.replace('bg-', '') }}>{strengthInfo.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4].map((seg) => (
                            <div
                              key={seg}
                              className={`h-full flex-1 transition-all ${
                                strengthInfo.score >= seg ? strengthInfo.color : 'bg-slate-200'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checklist rules */}
                    {isPasswordFocused && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-1.5 text-[11px] font-medium text-slate-500">
                        <div className="flex items-center gap-1">
                          {strengthInfo.hasMinLength ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                          <span>Tối thiểu 8 ký tự</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(strengthInfo.hasUpper && strengthInfo.hasLower) ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                          <span>Gồm chữ hoa & thường</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strengthInfo.hasNumber ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                          <span>Chứa chữ số (0-9)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strengthInfo.hasSpecial ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-300" />}
                          <span>Ký tự cực kỳ đặc biệt</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Xác nhận lại mật khẩu</label>
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại chính xác mật khẩu..."
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                        regConfirmPassword && regPassword !== regConfirmPassword ? 'border-rose-300 bg-rose-50/10' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    />
                    {regConfirmPassword && regPassword !== regConfirmPassword && (
                      <p className="text-xs text-rose-500 font-medium mt-1">❌ Mật khẩu nhập lại không chính xác.</p>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="button"
                      disabled={!regEmail || !regPassword || !regConfirmPassword || !isEmailUnique || regPassword !== regConfirmPassword}
                      onClick={() => setRegStep(3)}
                      className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Tiếp tục học thuật</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Academic details */}
              {regStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Chọn chuyên ngành đào tạo (Major)</label>
                    <select
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Software Engineering">Kỹ thuật Phần mềm (Software Engineering)</option>
                      <option value="Information Technology">Công nghệ Thông tin (Information Technology)</option>
                      <option value="Data Science">Khoa học Dữ liệu (Data Science)</option>
                      <option value="Digital Marketing">Tiếp thị kỹ thuật số (Digital Marketing)</option>
                      <option value="Business Administration">Quản trị Kinh doanh (Business Administration)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Năm tốt nghiệp dự kiến</label>
                      <select
                        value={regGradYear}
                        onChange={(e) => setRegGradYear(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                        <option value="2031">2031</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Mã giới thiệu (Nếu có)</label>
                      <input
                        type="text"
                        value={regReferral}
                        onChange={(e) => setRegReferral(e.target.value)}
                        placeholder="Tuyển sinh..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={regTerms}
                        onChange={(e) => setRegTerms(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10 w-4.5 h-4.5 mt-0.5"
                      />
                      <span className="text-xs text-slate-500 font-medium leading-relaxed">
                        Tôi đồng ý với các Quy chế nội bộ của Nhà trường, Điều khoản tuyển sinh của LMS Pro và cam kết bảo vệ dữ liệu học thuật cá nhân.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="py-2.5 px-5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Quay lại</span>
                    </button>
                    <button
                      type="submit"
                      disabled={!regTerms || !isEmailUnique}
                      className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md shadow-emerald-100 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Hoàn tất Đăng ký</span>
                      <CheckCircle className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {authView === 'forgot' && (
          <div className="bg-white w-full max-w-md p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 transition-all duration-300">
            {!forgotSent ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-xl font-bold text-slate-800">Khôi phục mật khẩu</h2>
                  <p className="text-xs text-slate-400 mt-1">Chúng tôi sẽ gửi một liên kết đặt lại mật khẩu đến email đào tạo của bạn.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (forgotEmail) {
                      setForgotSent(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Nhập Email đã đăng ký</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <Mail className="w-5 h-5" />
                      </span>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="example@student.vn"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition shadow-md shadow-indigo-100 cursor-pointer"
                  >
                    Gửi yêu cầu Khôi phục
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setAuthView('login');
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại trang Đăng nhập</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Đã gửi yêu cầu thành công</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  Một hướng dẫn chi tiết về cách thiết lập lại mật khẩu bảo mật đã được gửi đến <span className="font-semibold text-slate-800">{forgotEmail}</span>. Vui lòng kiểm tra kỹ cả hòm thư rác (Spam).
                </p>

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSent(false);
                      setForgotEmail('');
                      setAuthView('login');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                  >
                    Quay lại trang chính
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer credits */}
      <div className="pb-6 text-center text-[11px] font-medium text-slate-400">
        <p>© 2026 LMS Pro Ecosystem. Bản quyền phần mềm thuộc Nhà trường.</p>
      </div>
    </div>
  );
}
