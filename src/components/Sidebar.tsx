/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Users, Settings, ScrollText, BookOpen, CalendarCheck, Landmark, GraduationCap, ClipboardList, User, LogOut, Award, Sparkles } from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  currentUser: UserType | null;
  activeSubPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  currentUser,
  activeSubPage,
  onPageChange,
  onLogout,
  isOpen,
  onClose,
}: SidebarProps) {

  if (!currentUser) return null;

  // Determine menu items by role
  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Báo cáo chỉ số', icon: LayoutDashboard },
          { id: 'users', label: 'Quản lý Tài Khoản', icon: Users },
          { id: 'finance', label: 'Tài chính & Chi phí', icon: Landmark },
          { id: 'rbac', label: 'Phân Quyền RBAC', icon: Award },
          { id: 'logs', label: 'Audits Logs', icon: ScrollText },
          { id: 'ai-assistant', label: 'Copilot Tư Vấn AI', icon: Sparkles },
          { id: 'settings', label: 'Thiết Lập Hệ Thống', icon: Settings },
        ];
      case 'manager':
        return [
          { id: 'dashboard', label: 'Báo cáo đào tạo', icon: LayoutDashboard },
          { id: 'enrollment', label: 'Duyệt Tuyển Sinh', icon: Users },
          { id: 'schedule', label: 'Xếp Lịch & Phòng học', icon: CalendarCheck },
          { id: 'finance', label: 'Học phí & Học bổng', icon: Landmark },
          { id: 'ai-assistant', label: 'Tính năng AI Copilot', icon: Sparkles },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Bàn Làm Việc', icon: LayoutDashboard },
          { id: 'courses', label: 'Lớp Giảng Dạy', icon: BookOpen },
          { id: 'ai-assistant', label: 'Soạn Giáo Án AI', icon: Sparkles },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Bàn Học Tập', icon: LayoutDashboard },
          { id: 'courses', label: 'Học Phần Đăng Ký', icon: GraduationCap },
          { id: 'grades', label: 'Liên kết Bảng Điểm', icon: ClipboardList },
          { id: 'ai-assistant', label: 'Trợ Lý Mentor AI', icon: Sparkles },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition"
        ></div>
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#111827] text-slate-100 flex flex-col justify-between border-r border-gray-800 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:h-screen shrink-0`}>

        {/* LOGO AREA */}
        <div className="space-y-4">
          <div className="p-6 pb-2 flex items-center justify-between border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white tracking-wider text-sm">
                L
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">LMS Pro</span>
                <span className="text-[9.5px] font-bold text-blue-400 capitalize block tracking-wider leading-none">Learning Central</span>
              </div>
            </div>
          </div>

          {/* Core Roles switch indicator */}
          <div className="mx-4 p-3 rounded-2xl bg-white/5 text-[11px] leading-tight flex items-center gap-2.5 border border-white/10">
            <span className={`w-2.5 h-2.5 rounded-full ${
              currentUser.role === 'admin' ? 'bg-red-500 animate-pulse' :
              currentUser.role === 'manager' ? 'bg-purple-500' :
              currentUser.role === 'teacher' ? 'bg-blue-500' : 'bg-emerald-500'
            }`}></span>
            <div>
              <p className="font-bold text-white capitalize leading-none">{currentUser.role} Dashboard</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">{currentUser.studentId || 'STAFF-ADM'}</p>
            </div>
          </div>

          {/* MENU LINK CHANNELS */}
          <nav className="px-3.5 space-y-1">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeSubPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-l-4 border-white shadow-pro-md'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Profile Tab Link shared for everyone */}
            <div className="pt-4 border-t border-white/5 my-2">
              <button
                onClick={() => {
                  onPageChange('profile');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeSubPage === 'profile'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-l-4 border-white shadow-pro-md'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Cài Đặt Hồ Sơ</span>
              </button>
            </div>
          </nav>
        </div>

        {/* SIDEBAR FOOTER USER CARD */}
        <div className="p-4 border-t border-white/5 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${currentUser.avatar_color || 'bg-gradient-to-tr from-blue-400 to-indigo-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-blue-900/40`}>
              {currentUser.avatar_initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate font-medium">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 bg-white/5 hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>

      </aside>
    </>
  );
}
