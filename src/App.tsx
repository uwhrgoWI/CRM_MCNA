/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthPages } from './components/AuthPages';
import { AdminWorkspace } from './components/AdminWorkspace';
import { ManagerWorkspace } from './components/ManagerWorkspace';
import { TeacherWorkspace } from './components/TeacherWorkspace';
import { StudentWorkspace } from './components/StudentWorkspace';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { AIAssistant } from './components/AIAssistant';
import { Profile } from './components/Profile';

// Seeds
import {
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_GRADES,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './data';
import { User, Course, Assignment, GradeRecord, Transaction, Notification, AuditLog } from './types';

export default function App() {
  // STATE MANAGEMENT OF SEED DATABASE
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [gradeRecords, setGradeRecords] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // AUTH SESSION ENGINE (Null indicates Login needed)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // DRAWER LAYOUT STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubPage, setActiveSubPage] = useState('dashboard');

  // UNIQUE GLOBAL TOAST NOTIFIER SYSTEM
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning' | 'error' | 'info'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    setToastMsg(msg);
    setToastType(type);
  };

  // HANDLERS FOR RECONCILING COMPONENT WRITEBACKS
  const handleAddNewCourse = (newC: Course) => {
    setCourses(prev => [newC, ...prev]);
    addAuditEntry('CREATE_COURSE', `Created courses catalog: ${newC.code} - ${newC.name}`);
  };

  const handleUpdateCourse = (updatedC: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedC.id ? updatedC : c));
  };

  const handleAddNewUser = (newU: User) => {
    setUsers(prev => [newU, ...prev]);
    addAuditEntry('REGISTER_USER', `Account initialized: (${newU.role}) ${newU.name} - ${newU.email}`);
  };

  const handleUpdateUser = (updatedU: User) => {
    setUsers(prev => prev.map(u => u.id === updatedU.id ? updatedU : u));
    if (currentUser?.id === updatedU.id) {
      setCurrentUser(updatedU);
    }
  };

  const handleDeleteUser = (id: string) => {
    const matcher = users.find(u => u.id === id);
    if (!matcher) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditEntry('DELETE_USER', `Purged user account: ${matcher.name} (${matcher.email})`);
    triggerToast(`Đã xoá tài khoản ${matcher.name} thành công.`, 'success');
  };

  const handleAddAssignment = (newA: Assignment) => {
    setAssignments(prev => [newA, ...prev]);
    addAuditEntry('CREATE_ASSIGNMENT', `Created and dispatched homework: ${newA.title}`);
  };

  const handleUpdateAssignment = (updatedA: Assignment) => {
    setAssignments(prev => prev.map(a => a.id === updatedA.id ? updatedA : a));
    const hasNewGraded = updatedA.submissions.some(s => s.status === 'graded');
    if (hasNewGraded) {
      triggerNotification(`Thầy giáo Lê Hoàng Minh đã chấm xong bài tập [${updatedA.title}] của lớp!`);
    }
  };

  const handleUpdateGrade = (updatedG: GradeRecord) => {
    setGradeRecords(prev => prev.map(g => g.id === updatedG.id ? updatedG : g));
  };

  const handleAddGrade = (newG: GradeRecord) => {
    setGradeRecords(prev => [newG, ...prev]);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    if (updatedTx.status === 'paid') {
      triggerNotification(`Giao dịch đóng học phí của ${updatedTx.studentName} đã được ghi nhận thành công!`);
    }
  };

  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
  };

  // Audit Logs Helper
  const addAuditEntry = (action: string, detail: string) => {
    const freshLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: currentUser?.email || 'vãng_lai@lms.vn',
      role: currentUser?.role || 'none',
      action,
      resource: detail,
      ip: '192.168.1.42',
      status: 'success',
    };
    setAuditLogs(prev => [freshLog, ...prev]);
  };

  // Notification Push
  const triggerNotification = (msg: string) => {
    const notify: Notification = {
      id: `notif-${Date.now()}`,
      userId: 'all',
      type: 'info',
      title: 'Cập nhật Hệ thống',
      body: msg,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [notify, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Session login trigger (auth signature match)
  const handleSessionLogin = (email: string, role: string, name: string) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveSubPage('dashboard');
      triggerToast(`Đăng nhập thành công! Chào ${foundUser.name} (${foundUser.role})`, 'success');
      
      const log: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: foundUser.email,
        role: foundUser.role,
        action: 'LOGIN',
        resource: 'SYSTEM_AUTH',
        ip: '10.32.181.5',
        status: 'success',
      };
      setAuditLogs(prev => [log, ...prev]);
    }
  };

  const handleSessionLogout = () => {
    if (currentUser) {
      addAuditEntry('LOGOUT', 'User signed out from security console.');
    }
    setCurrentUser(null);
    triggerToast('Đã đăng xuất tài khoản an toàn.', 'info');
  };

  return (
    <div className="min-h-screen bg-pro-light flex text-slate-800 antialiased font-sans">
      
      {/* 1. AUTH PAGES DIRECTIVE */}
      {!currentUser ? (
        <AuthPages
          users={users}
          onLoginSuccess={handleSessionLogin}
          onAddUser={handleAddNewUser}
        />
      ) : (
        /* 2. AUTHENTICATED BOARD SYSTEM */
        <div className="flex w-full min-h-screen relative overflow-hidden">
          
          {/* Main vertical sidebar */}
          <Sidebar
            currentUser={currentUser}
            activeSubPage={activeSubPage}
            onPageChange={setActiveSubPage}
            onLogout={handleSessionLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Right layout content container */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            
            <Topbar
              currentUser={currentUser}
              onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              activeSubPage={activeSubPage}
              notifications={notifications}
              onMarkNotificationRead={markNotificationRead}
              toast={triggerToast}
            />

            {/* MAIN PORT DIRECTORIES */}
            <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto pb-20">
              
              {activeSubPage === 'ai-assistant' ? (
                <AIAssistant currentUser={currentUser} toast={triggerToast} />
              ) : activeSubPage === 'profile' ? (
                <Profile currentUser={currentUser} onUpdateUser={handleUpdateUser} toast={triggerToast} />
              ) : (
                <>
                  {/* ADMIN ROLE */}
                  {currentUser.role === 'admin' && (
                    <AdminWorkspace
                      users={users}
                      courses={courses}
                      auditLogs={auditLogs}
                      transactions={transactions}
                      onAddUser={handleAddNewUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                      toast={triggerToast}
                      activeSubPage={activeSubPage}
                    />
                  )}

                  {/* MANAGER ACADEMIC ROLE */}
                  {currentUser.role === 'manager' && (
                    <ManagerWorkspace
                      courses={courses}
                      users={users}
                      transactions={transactions}
                      onAddCourse={handleAddNewCourse}
                      onUpdateCourse={handleUpdateCourse}
                      onAddTransaction={handleAddTransaction}
                      onUpdateTransaction={handleUpdateTransaction}
                      toast={triggerToast}
                      activeSubPage={activeSubPage}
                    />
                  )}

                  {/* TEACHER ROLE */}
                  {currentUser.role === 'teacher' && (
                    <TeacherWorkspace
                      courses={courses}
                      users={users}
                      assignments={assignments}
                      gradeRecords={gradeRecords}
                      onAddAssignment={handleAddAssignment}
                      onUpdateAssignment={handleUpdateAssignment}
                      onAddGrade={handleAddGrade}
                      onUpdateGrade={handleUpdateGrade}
                      toast={triggerToast}
                      activeSubPage={activeSubPage}
                      onPageChange={setActiveSubPage}
                    />
                  )}

                  {/* STUDENT ROLE */}
                  {currentUser.role === 'student' && (
                    <StudentWorkspace
                      courses={courses}
                      assignments={assignments}
                      gradeRecords={gradeRecords}
                      transactions={transactions}
                      currentUser={currentUser}
                      onUpdateAssignment={handleUpdateAssignment}
                      onUpdateUser={handleUpdateUser}
                      toast={triggerToast}
                      activeSubPage={activeSubPage}
                      onPageChange={setActiveSubPage}
                    />
                  )}
                </>
              )}

            </main>
          </div>
        </div>
      )}

      {/* GLOBAL TOAST MESSAGE BAR */}
      {toastMsg && (
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg('')}
        />
      )}

    </div>
  );
}
