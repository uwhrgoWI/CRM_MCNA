/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, Bell, Search, Check, Globe } from 'lucide-react';
import { User, Notification } from '../types';

interface TopbarProps {
  currentUser: User | null;
  onMenuToggle: () => void;
  activeSubPage: string;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  toast: (msg: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export function Topbar({
  currentUser,
  onMenuToggle,
  activeSubPage,
  notifications,
  onMarkNotificationRead,
  toast,
}: TopbarProps) {

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!currentUser) return null;

  // Active unread alerts
  const unreadNotifs = notifications.filter(n => !n.read);

  // Quick Action Search handles
  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast(`Kết quả tìm kiếm cho: "${searchQuery}" chưa khớp dữ liệu lập chỉ mục.`, 'info');
    setSearchQuery('');
  };

  // Convert active page name to friendly Vietnamese label
  const getPageTitle = () => {
    switch (activeSubPage) {
      case 'dashboard': return 'Báo cáo chỉ số & Tổng Quan';
      case 'users': return 'Quản lý Tài Khoản Thành Viên';
      case 'rbac': return 'Cấu hình Ma trận phân quyền RBAC';
      case 'settings': return 'Thiết Lập Hệ thống Đào tạo';
      case 'logs': return 'Nhật ký Truy vết Kiểm toán (Audit logs)';
      case 'enrollment': return 'Hồ Sơ Nhập Học & Đăng Ký';
      case 'schedule': return 'Lịch thi khảo thí & Xếp Phòng';
      case 'finance': return 'Định mức Học phí & Học bổng';
      case 'courses': return 'Chi tiết Lớp học phần';
      case 'grades': return 'Sổ điểm & Projections GPA';
      case 'profile': return 'Hệ Thống Hồ Sơ Cá Nhân';
      default: return 'Cảng Thông Tin Lập Trình';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* LEFT: BURGER BUTTON + BREADCRUMB */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-50 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 capitalize">LMS PRO</span>
          <span className="text-slate-300 font-bold">/</span>
          <span className="font-extrabold text-indigo-700 tracking-tight">{getPageTitle()}</span>
        </div>
      </div>

      {/* RIGHT SEARCH BAR + NOTIFICATION ALERTS BELL */}
      <div className="flex items-center gap-4">
        {/* Search Input Portlet */}
        <form onSubmit={handleQuickSearchSubmit} className="relative hidden md:block w-52 lg:w-64">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm nhanh học viên, mã môn..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 hover:bg-slate-50 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
        </form>

        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-[10px] text-slate-500 font-bold font-mono">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>Local (VN)</span>
        </div>

        {/* NOTIFICATION DROP-SHEET CONTAINER */}
        <div className="relative">
          <button
            onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100/70 cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white font-bold rounded-full text-[9px] flex items-center justify-center border-2 border-white animate-bounce-subtle">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Actual notifications Dropdown sheet */}
          {isNotifDropdownOpen && (
            <>
              {/* background dismiss click overlay */}
              <div
                onClick={() => setIsNotifDropdownOpen(false)}
                className="fixed inset-0 z-40 bg-transparent"
              ></div>

              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-3xl border border-slate-150 shadow-2xl p-4 z-50 animate-scaleIn space-y-3.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Thông báo khẩn mới</h4>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">Lập tức</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-center text-slate-400 py-6 font-medium">📭 Không có thông báo nào mới.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border text-xs relative ${
                          n.read ? 'bg-white border-slate-100 text-slate-400' : 'bg-indigo-50/20 border-indigo-100 text-slate-800 font-medium'
                        }`}
                      >
                        <p className="font-bold text-slate-800 text-[11px] pr-4">{n.title}</p>
                        <p className="leading-snug text-[10px] text-slate-500 mt-0.5 pr-4">{n.body}</p>
                        <p className="text-[9px] text-slate-400 mt-1.5 font-mono">{new Date(n.createdAt).toLocaleTimeString('vi-VN')}</p>
                        
                        {!n.read && (
                          <button
                            onClick={() => {
                              onMarkNotificationRead(n.id);
                              toast('Đã dọn dẹp trạng thái thông báo thành Đã đọc', 'success');
                            }}
                            className="absolute top-2.5 right-2.5 p-0.5 rounded bg-white border border-indigo-100 hover:bg-slate-50 cursor-pointer text-indigo-600 shadow-xs"
                            title="Xác thực đã đọc"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

      </div>

    </header>
  );
}
