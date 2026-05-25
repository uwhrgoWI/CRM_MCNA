/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Mail, Phone, User, Calendar, Save, CheckCircle, Smartphone, Bell, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  currentUser: UserType;
  onUpdateUser: (u: UserType) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export function Profile({ currentUser, onUpdateUser, toast }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'channels'>('personal');

  // Personal account details
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '0901234567');
  const [major, setMajor] = useState(currentUser.major || 'Software Engineering');

  // Password modify states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Channels settings
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyInApp, setNotifyInApp] = useState(true);

  // Password rules checker logic
  const checkPasswordStrength = (p: string) => {
    if (!p) return { label: 'Chưa nhập', score: 0, color: 'bg-slate-200 text-slate-500' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;

    if (score <= 1) return { label: 'Rất yếu ⚠️', score, color: 'bg-rose-500 text-white' };
    if (score === 2) return { label: 'Trung bình ⚡', score, color: 'bg-amber-500 text-white' };
    if (score === 3) return { label: 'Mạnh 💪', score, color: 'bg-indigo-500 text-white' };
    return { label: 'Cực kỳ bảo mật 👑', score, color: 'bg-emerald-500 text-white' };
  };

  const strength = checkPasswordStrength(newPassword);

  const handlePersonalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast('Tên hiển thị không được bỏ trống.', 'error');
      return;
    }
    const updated: UserType = {
      ...currentUser,
      name,
      phone,
      major: currentUser.role === 'student' ? major : undefined,
    };
    onUpdateUser(updated);
    toast('Đã cập nhật thông tin cá nhân của bạn!', 'success');
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast('Vui lòng nhập đầy đủ các trường mật khẩu.', 'warning');
      return;
    }
    if (oldPassword !== currentUser.password) {
      toast('Mật khẩu hiện tại không khớp.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Xác nhận mật khẩu mới không khớp.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast('Mật khẩu phải dài từ 8 ký tự trở lên.', 'error');
      return;
    }

    const updated: UserType = {
      ...currentUser,
      password: newPassword,
    };
    onUpdateUser(updated);
    
    // reset form
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast('Mật khẩu của bạn đã được cập nhật thành công!', 'success');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      
      {/* LEFT PROFILE CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center space-y-5">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group cursor-pointer select-none">
            <div className={`w-24 h-24 rounded-full ${currentUser.avatar_color || 'bg-indigo-600'} text-white flex items-center justify-center font-black text-3xl shadow-lg border-4 border-white ring-4 ring-indigo-50`}>
              {currentUser.avatar_initials}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 rounded-b-full py-1 opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-white transition">
              Thay avatar
            </div>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">{currentUser.name}</h3>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase font-mono bg-indigo-50 text-indigo-700 border border-indigo-100">
              Cấp bậc: {currentUser.role}
            </span>
            <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">Tình trạng tài khoản: Độc lập an toàn</p>
          </div>
        </div>

        <div className="w-full text-left text-xs border-t border-slate-50 pt-5 space-y-3 text-slate-500 font-medium">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="font-mono">{currentUser.email}</span>
          </div>
          {currentUser.studentId && (
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Mã Số Sinh Viên: <strong className="font-mono">{currentUser.studentId}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Đã tham gia: {new Date(currentUser.joinedAt || '2026-05-23').toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Bảo mật hệ thống: <strong className="text-emerald-500">Kích hoạt (SSL/AES)</strong></span>
          </div>
        </div>
      </div>

      {/* RIGHT WORKPLACE TAB SHEETS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2 space-y-6">
        <div className="flex gap-4 border-b border-slate-100 pb-2">
          {([
            { id: 'personal', label: 'Thông tin cá nhân' },
            { id: 'security', label: 'Mật khẩu & Bảo mật' },
            { id: 'channels', label: 'Nhận thông báo' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-xs font-bold transition relative cursor-pointer ${
                activeTab === tab.id ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-600 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* PERSONAL PAGE */}
        {activeTab === 'personal' && (
          <form onSubmit={handlePersonalSave} className="space-y-4 text-xs font-semibold animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Họ và Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Số Điện Thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Địa chỉ Email (Staff Lock)</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-400 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phân quyền vai trò</label>
                <input
                  type="text"
                  disabled
                  value={currentUser.role.toUpperCase()}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-indigo-500 rounded-xl font-bold font-mono"
                />
              </div>
            </div>

            {currentUser.role === 'student' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Ngành học thuật bổ sung</label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="Software Engineering">Kỹ nghệ phần mềm (SWE)</option>
                  <option value="Information Security">An toàn thông tin bảo mật</option>
                  <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                  <option value="Data Science">Khoa học dữ liệu (Data Science)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 transition"
            >
              <Save className="w-4 h-4" />
              <span>Cập nhật sơ yếu</span>
            </button>
          </form>
        )}

        {/* SECURITY PASSWORD TAB */}
        {activeTab === 'security' && (
          <form onSubmit={handleSecuritySave} className="space-y-4 text-xs font-semibold animate-fadeIn">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tạI"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mật khẩu mới</label>
                  <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-black ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận lại mật khẩu mới"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-100 transition"
            >
              <Save className="w-4 h-4" />
              <span>Thiết lập mật khẩu mới</span>
            </button>
          </form>
        )}

        {/* NOTIFICATION CHANNELS */}
        {activeTab === 'channels' && (
          <div className="space-y-4 animate-fadeIn text-xs font-semibold">
            <p className="text-slate-400 leading-relaxed font-medium">Bật các cổng đẩy thông báo để không bỏ lỡ các cập nhật lịch dạy, điểm thi hay thông báo của phòng quản lý đào tạo.</p>
            
            <div className="space-y-3.5 pt-2">
              <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs font-bold font-sans">Thông báo qua Email cá nhân</p>
                    <p className="text-[10px] text-slate-400 font-medium">Nhận tóm tắt kết quả xếp lớp và biên lai thu học phí.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded border-slate-200 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs font-bold font-sans">Tin nhắn SMS khẩn</p>
                    <p className="text-[10px] text-slate-400 font-medium">Gửi tự động về cảnh báo chuyên cần hay đóng học phí.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded border-slate-200 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 border border-slate-100 rounded-2xl hover:bg-slate-50/50 cursor-pointer transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-slate-700 text-xs font-bold font-sans">Thông báo Pop-up hệ thống (In-App)</p>
                    <p className="text-[10px] text-slate-400 font-medium">Hiện thực chuông báo thức ở góc Topbar màn hình.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyInApp}
                  onChange={(e) => setNotifyInApp(e.target.checked)}
                  className="w-4.5 h-4.5 text-indigo-600 rounded border-slate-200 focus:ring-indigo-500"
                />
              </label>
            </div>

            <button
              onClick={() => toast('Cấu hình kênh đẩy thông báo của bạn đã lưu thành công!', 'success')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-indigo-100"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Ghi dấu cấu hình</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
