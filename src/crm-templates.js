// Enterprise CRM Pro - Dynamic Web UI Page Templates
'use strict';

import { 
  USERS_DB, COMPANIES_DB, CONTACTS_DB, LEADS_DB, DEALS_DB, TASKS_DB, 
  ACTIVITIES_DB, QUOTES_DB, PRODUCTS_DB, TICKETS_DB, INVOICES_DB, REVENUE_DATA, AUDIT_LOG_DB 
} from './crm-database.js';

import { svgBarChart, svgLineChart, svgDonut, svgFunnel, svgSparkline } from './crm-charts.js';

// Global formatting tools
export const esc = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const fmtVND = (num) => {
  if (num === undefined || num === null) return '0 ₫';
  return Number(num).toLocaleString('vi-VN') + ' ₫';
};

/* ==========================================================================
   1. AUTHENTICATION PAGES (Login, Register & Forgot)
   ========================================================================== */

export function drawLoginScreen() {
  return `
    <div class="auth-screen">
      <div class="auth-card animate-fadeIn">
        <div class="auth-brand">
          <div class="logo-w" style="justify-content: center; margin-bottom: 8px;">
            <div class="logo-ico"><i class="fa-solid fa-fire text-white"></i></div>
            <span class="brand-title">AURA CRM PRO</span>
          </div>
          <p class="brand-tagline">Hệ thống Trợ lý Kinh doanh & Chăm sóc Khách hàng</p>
        </div>

        <form id="login-form" class="auth-body">
          <div class="fg">
            <label>Địa chỉ Email công sở</label>
            <input type="email" id="login-email" required placeholder="nhanvien@crm.vn" value="superadmin@crm.vn" />
          </div>
          <div class="fg">
            <label>Mật khẩu khóa học</label>
            <div style="position:relative;">
              <input type="password" id="login-pw" required placeholder="••••••••" value="Admin@123" />
              <button type="button" id="toggle-pw-btn" style="position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--n400);">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:600; margin-top:-4px;">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="login-remember" checked /> Ghi nhớ đăng nhập
            </label>
            <a href="#" id="go-forgot-btn">Quên mật khẩu?</a>
          </div>

          <button type="submit" class="btn-auth" id="login-submit-btn">
            <span>Đăng Nhập Ngay</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>
          </button>
        </form>

        <div style="text-align:center; font-size:12px; font-weight:600; color:var(--n500);">
          Chưa có tài khoản doanh nghiệp? <a href="#" id="go-register-btn">Đăng ký phễu mới</a>
        </div>

        <div class="demo-btns">
          <p class="switcher-title" style="margin-bottom:6px;"><i class="fa-solid fa-bolt text-amber-500"></i> Đăng nhập nhanh vai trò Demo:</p>
          <div class="demo-btns-grid">
            <button class="demo-btn" data-email="superadmin@crm.vn" data-pw="Admin@123" style="border-left: 3px solid var(--red); color:var(--red);">👑 Admin</button>
            <button class="demo-btn" data-email="manager@crm.vn" data-pw="Manager@123" style="border-left: 3px solid var(--p600); color:var(--p600);">📊 Manager</button>
            <button class="demo-btn" data-email="sales@crm.vn" data-pw="Sales@123" style="border-left: 3px solid var(--b600); color:var(--b600);">💼 Sales Rep</button>
            <button class="demo-btn" data-email="support@crm.vn" data-pw="Support@123" style="border-left: 3px solid var(--teal); color:var(--teal);">🎧 Support</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function drawRegisterScreen(step) {
  let stepContent = '';
  if (step === 1) {
    stepContent = `
      <div class="fr2">
        <div class="fg">
          <label>Họ và Tên chủ biên *</label>
          <input type="text" id="reg-fullname" required placeholder="Ví dụ: Nguyễn Văn An" />
        </div>
        <div class="fg">
          <label>Số điện thoại *</label>
          <input type="tel" id="reg-phone" required placeholder="Ví dụ: 0912345678" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Phòng ban tác nghiệp</label>
          <select id="reg-dept">
            <option value="Kinh doanh miền Bắc">Ban Kinh doanh - Sales</option>
            <option value="Marketing">Phòng Marketing</option>
            <option value="Chăm sóc Khách hàng">Hỗ trợ CSKH</option>
          </select>
        </div>
        <div class="fg">
          <label>Chức vụ đảm nhiệm</label>
          <input type="text" id="reg-title" placeholder="Ví dụ: Chuyên viên kinh doanh" value="Sales Representative" />
        </div>
      </div>
    `;
  } else if (step === 2) {
    stepContent = `
      <div class="fg">
        <label>Địa chỉ Email công việc *</label>
        <input type="email" id="reg-email" required placeholder="email@congty.com" />
      </div>
      <div class="fg">
        <label>Mật khẩu khởi tạo *</label>
        <input type="password" id="reg-pw" required placeholder="Tối thiểu 8 ký tự, có ký tự đặc biệt" />
      </div>
      <div class="pw-strength">
        <div class="pw-strength-bars">
          <div class="pw-strength-bar" id="psb-1"></div>
          <div class="pw-strength-bar" id="psb-2"></div>
          <div class="pw-strength-bar" id="psb-3"></div>
          <div class="pw-strength-bar" id="psb-4"></div>
        </div>
        <div class="pw-strength-msg" id="reg-pw-strength-msg" style="color:var(--n500)">Độ bảo mật mật khẩu</div>
      </div>
      <div class="pw-chk-list">
        <div class="pw-chk-item" id="pwc-8"><i class="fa-solid fa-circle-check"></i> Chứa tối thiểu 8 ký tự</div>
        <div class="pw-chk-item" id="pwc-up"><i class="fa-solid fa-circle-check"></i> Chứa chữ Hoa</div>
        <div class="pw-chk-item" id="pwc-num"><i class="fa-solid fa-circle-check"></i> Chứa ít nhất 1 số</div>
        <div class="pw-chk-item" id="pwc-sp"><i class="fa-solid fa-circle-check"></i> Chứa ký tự đặc biệt</div>
      </div>
      <div class="fg">
        <label>Xác nhận lại mật khẩu *</label>
        <input type="password" id="reg-confirm" required placeholder="Xác nhận chính xác mật khẩu" />
      </div>
    `;
  } else {
    stepContent = `
      <div class="fg">
        <label>Tên Doanh nghiệp tác nghiệp *</label>
        <input type="text" id="reg-company" required placeholder="Ví dụ: Công ty Công nghệ Aura JSC" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Lĩnh vực ngành nghề</label>
          <select id="reg-industry">
            <option value="Công nghệ thông tin">Phần mềm & Công nghệ</option>
            <option value="Tài chính ngân hàng">Kinh doanh Thương mại</option>
            <option value="Y tế & Dược phẩm">Sản xuất & Phân phối</option>
          </select>
        </div>
        <div class="fg">
          <label>Quy mô nhân sự</label>
          <select id="reg-size">
            <option value="10-50">10 - 50 nhân sự</option>
            <option value="50-200">50 - 200 nhân sự</option>
            <option value="200+">Trên 200 nhân sự</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Nguồn giới thiệu phễu</label>
        <select id="reg-refer">
          <option value="Facebook">Mạng xã hội Facebook</option>
          <option value="Partner">Đối tác giới thiệu</option>
          <option value="Google">Tìm kiếm Google</option>
        </select>
      </div>
    `;
  }

  return `
    <div class="auth-screen">
      <div class="auth-card animate-fadeIn">
        <div class="auth-brand">
          <div class="logo-w" style="justify-content: center; margin-bottom: 4px;">
            <div class="logo-ico"><i class="fa-solid fa-fire text-white"></i></div>
            <span class="brand-title">ĐĂNG KÝ FULFILLMENT</span>
          </div>
          <p class="brand-tagline">Thiết lập tài khoản Enterprise CRM Pro</p>
        </div>

        <div class="step-dots" style="margin: 12px 0 4px 0;">
          <div class="step-dot ${step === 1 ? 'active' : ''}"></div>
          <div class="step-dot ${step === 2 ? 'active' : ''}"></div>
          <div class="step-dot ${step === 3 ? 'active' : ''}"></div>
        </div>

        <form id="register-step-form" class="auth-body">
          ${stepContent}
          
          <div style="display:flex; justify-content:space-between; gap:12px; margin-top:12px;">
            ${step > 1 ? '<button type="button" class="btn bl" id="reg-back-btn" style="flex:1;">Quay lại</button>' : ''}
            <button type="submit" class="btn pr" id="reg-next-btn" style="flex:1.5;">
              <span>${step === 3 ? 'Kích hoạt hệ thống' : 'Tiếp tục tiếp nối'}</span> 
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </form>

        <div style="text-align:center; font-size:12px; font-weight:600; color:var(--n500);">
          Đã có tài khoản sẵn sàng? <a href="#" id="go-login-btn">Đăng nhập ngay</a>
        </div>
      </div>
    </div>
  `;
}

export function drawForgotScreen() {
  return `
    <div class="auth-screen">
      <div class="auth-card animate-fadeIn">
        <div class="auth-brand">
          <div class="logo-w" style="justify-content: center; margin-bottom: 12px;">
            <div class="logo-ico bg-amber-500"><i class="fa-solid fa-key text-white"></i></div>
            <span class="brand-title" style="background:linear-gradient(135deg, #f59e0b, #d97706); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">KHÔI PHỤC</span>
          </div>
          <p class="brand-tagline">Nhập Email phục vụ để nhận mã bảo mật OTP</p>
        </div>

        <form id="forgot-form" class="auth-body">
          <div class="fg">
            <label>Địa chỉ Email của bạn</label>
            <input type="email" id="forgot-email" required placeholder="nhanvien@congty.vn" />
          </div>

          <button type="submit" class="btn pr" style="margin-top:12px;">
            <span>Gửi mã khôi phục</span> <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>

        <div style="text-align:center; font-size:12px; font-weight:600; color:var(--n500);">
          Nhớ lại mật khẩu? <a href="#" id="go-login-btn">Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   2. SHARED COMPONENTS (Sidebar, Topbar & Navigation Renders)
   ========================================================================== */

export function buildSidebar(session, activePage, isCollapsed) {
  const role = session.role;
  let navHtml = '';

  // Super Admin Sidebar Navigation
  if (role === 'superadmin') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Tổng quan</p>
        <div class="ni ${activePage === 'dashboard-superadmin' ? 'active' : ''}" data-page="dashboard-superadmin">
          <span class="ni-ic"><i class="fa-solid fa-chart-line"></i></span>
          <span class="ni-txt">Bảng Điều Khiển</span>
        </div>
        <div class="ni ${activePage === 'reports' ? 'active' : ''}" data-page="reports">
          <span class="ni-ic"><i class="fa-solid fa-paste"></i></span>
          <span class="ni-txt">Báo Cáo & Phân Tích</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Kinh doanh Core</p>
        <div class="ni ${activePage === 'leads' ? 'active' : ''}" data-page="leads">
          <span class="ni-ic"><i class="fa-solid fa-filter"></i></span>
          <span class="ni-txt">Quản Lý Leads</span>
          <span class="ni-bd r" style="font-size:9px;">${LEADS_DB.length}</span>
        </div>
        <div class="ni ${activePage === 'deals' ? 'active' : ''}" data-page="deals">
          <span class="ni-ic"><i class="fa-solid fa-comments-dollar"></i></span>
          <span class="ni-txt">Cơ Hội & Pipeline</span>
        </div>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
        <div class="ni ${activePage === 'products' ? 'active' : ''}" data-page="products">
          <span class="ni-ic"><i class="fa-solid fa-boxes-stacked"></i></span>
          <span class="ni-txt">Danh Mục Sản Phẩm</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Tài chính & Quy trình</p>
        <div class="ni ${activePage === 'quotes' ? 'active' : ''}" data-page="quotes">
          <span class="ni-ic"><i class="fa-solid fa-file-invoice-dollar"></i></span>
          <span class="ni-txt">Bảng Báo Giá</span>
        </div>
        <div class="ni ${activePage === 'invoices' ? 'active' : ''}" data-page="invoices">
          <span class="ni-ic"><i class="fa-solid fa-file-invoice"></i></span>
          <span class="ni-txt">Hóa Đơn & Dự Nợ</span>
        </div>
        <div class="ni ${activePage === 'tasks' ? 'active' : ''}" data-page="tasks">
          <span class="ni-ic"><i class="fa-solid fa-list-check"></i></span>
          <span class="ni-txt">Nhiệm Vụ & Nhật Ký</span>
        </div>
        <div class="ni ${activePage === 'tickets' ? 'active' : ''}" data-page="tickets">
          <span class="ni-ic"><i class="fa-solid fa-headset"></i></span>
          <span class="ni-txt">Hỗ Trợ & SLA Ticketing</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Hệ thống</p>
        <div class="ni ${activePage === 'users' ? 'active' : ''}" data-page="users">
          <span class="ni-ic"><i class="fa-solid fa-id-badge"></i></span>
          <span class="ni-txt">Người dùng & RBAC</span>
        </div>
        <div class="ni ${activePage === 'settings' ? 'active' : ''}" data-page="settings">
          <span class="ni-ic"><i class="fa-solid fa-sliders"></i></span>
          <span class="ni-txt">Thiết Lập Hệ Thống</span>
        </div>
      </div>
    `;
  }
  // Sales Manager Sidebar Navigation
  else if (role === 'manager') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Giám Sát Bán Hàng</p>
        <div class="ni ${activePage === 'dashboard-manager' ? 'active' : ''}" data-page="dashboard-manager">
          <span class="ni-ic"><i class="fa-solid fa-square-poll-vertical"></i></span>
          <span class="ni-txt">Dashboard Quản Lý</span>
        </div>
        <div class="ni ${activePage === 'reports' ? 'active' : ''}" data-page="reports">
          <span class="ni-ic"><i class="fa-solid fa-paste"></i></span>
          <span class="ni-txt">Báo Cáo & Dự Báo</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Quản lý Phân bổ</p>
        <div class="ni ${activePage === 'leads' ? 'active' : ''}" data-page="leads">
          <span class="ni-ic"><i class="fa-solid fa-filter"></i></span>
          <span class="ni-txt">Xem Leads Doanh Nghiệp</span>
        </div>
        <div class="ni ${activePage === 'deals' ? 'active' : ''}" data-page="deals">
          <span class="ni-ic"><i class="fa-solid fa-comments-dollar"></i></span>
          <span class="ni-txt">Cơ Hội & Pipeline</span>
        </div>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Sách biểu & Doanh thu</p>
        <div class="ni ${activePage === 'quotes' ? 'active' : ''}" data-page="quotes">
          <span class="ni-ic"><i class="fa-solid fa-file-invoice-dollar"></i></span>
          <span class="ni-txt">Phê Duyệt Báo Giá</span>
        </div>
        <div class="ni ${activePage === 'invoices' ? 'active' : ''}" data-page="invoices">
          <span class="ni-ic"><i class="fa-solid fa-file-invoice"></i></span>
          <span class="ni-txt">Dòng Tiền & Thu Nợ</span>
        </div>
        <div class="ni ${activePage === 'tasks' ? 'active' : ''}" data-page="tasks">
          <span class="ni-ic"><i class="fa-solid fa-list-check"></i></span>
          <span class="ni-txt">Nhiệm Vụ & Nhật Ký</span>
        </div>
      </div>
    `;
  }
  // Sales Rep Sidebar Navigation
  else if (role === 'sales') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Bàn làm việc</p>
        <div class="ni ${activePage === 'dashboard-salesrep' ? 'active' : ''}" data-page="dashboard-salesrep">
          <span class="ni-ic"><i class="fa-solid fa-user-tie"></i></span>
          <span class="ni-txt">Dashboard Cá Nhân</span>
        </div>
      </div>
      <div class="nav-sec">
        <p class="nav-sec-label">Hồ Sơ Của Tôi</p>
        <div class="ni ${activePage === 'leads' ? 'active' : ''}" data-page="leads">
          <span class="ni-ic"><i class="fa-solid fa-filter"></i></span>
          <span class="ni-txt">Leads được bàn giao</span>
        </div>
        <div class="ni ${activePage === 'deals' ? 'active' : ''}" data-page="deals">
          <span class="ni-ic"><i class="fa-solid fa-comments-dollar"></i></span>
          <span class="ni-txt">Cơ Hội & Pipeline</span>
        </div>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
        <div class="ni ${activePage === 'products' ? 'active' : ''}" data-page="products">
          <span class="ni-ic"><i class="fa-solid fa-boxes-stacked"></i></span>
          <span class="ni-txt">Danh Mục Sản Phẩm</span>
        </div>
        <div class="ni ${activePage === 'quotes' ? 'active' : ''}" data-page="quotes">
          <span class="ni-ic"><i class="fa-solid fa-file-invoice-dollar"></i></span>
          <span class="ni-txt">Khởi Tạo Báo Giá</span>
        </div>
        <div class="ni ${activePage === 'tasks' ? 'active' : ''}" data-page="tasks">
          <span class="ni-ic"><i class="fa-solid fa-list-check"></i></span>
          <span class="ni-txt">Nhiệm Vụ & Nhật Ký</span>
        </div>
      </div>
    `;
  }
  // Support Agent Sidebar Navigation
  else if (role === 'support') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Trạm Phục Vụ</p>
        <div class="ni ${activePage === 'dashboard-support' ? 'active' : ''}" data-page="dashboard-support">
          <span class="ni-ic"><i class="fa-solid fa-headset"></i></span>
          <span class="ni-txt">Support Dashboard</span>
        </div>
        <div class="ni ${activePage === 'tickets' ? 'active' : ''}" data-page="tickets">
          <span class="ni-ic"><i class="fa-solid fa-ticket"></i></span>
          <span class="ni-txt">Danh Sách Tickets</span>
          <span class="ni-bd r">${TICKETS_DB.filter(t=>t.status==='open').length}</span>
        </div>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
      </div>
    `;
  }

  // Common lower sections for all views
  navHtml += `
    <div class="nav-sec" style="margin-top:auto;">
      <div class="ni ${activePage === 'profile' ? 'active' : ''}" data-page="profile">
        <span class="ni-ic"><i class="fa-solid fa-circle-user"></i></span>
        <span class="ni-txt">Hồ sơ cá nhân</span>
      </div>
    </div>
  `;

  const sbClass = isCollapsed ? 'sb collapsed' : 'sb';
  const roleBadgeMap = {
    superadmin: '<span class="role-badge sa">ADMIN</span>',
    manager: '<span class="role-badge m">MANAGER</span>',
    sales: '<span class="role-badge sr">REP</span>',
    support: '<span class="role-badge su">SUPPORT</span>'
  };

  return `
    <aside class="${sbClass}" id="main-sidebar">
      <div class="sb-header">
        <div class="logo-w">
          <div class="logo-ico"><i class="fa-solid fa-fire text-white"></i></div>
          <span class="brand-title" style="font-size: 16px;">AURA CRM PRO</span>
        </div>
        <button class="collapse-btn" id="sidebar-toggle-trigger" aria-label="Collapse Menu">
          <i class="fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}"></i>
        </button>
      </div>

      <div class="sb-user">
        <div class="av sm" style="background:${session.color || 'var(--grad)'}">${session.initials || 'A'}</div>
        <div class="user-info">
          <p class="user-name">${esc(session.name)}</p>
          <div style="display:flex; align-items:center; gap:6px; margin-top:2px;">
            <div class="online-indicator"></div>
            ${roleBadgeMap[role] || ''}
          </div>
        </div>
      </div>

      <nav class="sb-nav">
        ${navHtml}
      </nav>

      <div class="sb-ft">
        <div class="ni" id="logout-sidebar-btn" style="color:var(--red3); background-color:rgba(239, 68, 68, 0.05);">
          <span class="ni-ic"><i class="fa-solid fa-power-off text-rose-500"></i></span>
          <span class="ni-txt font-bold text-rose-300">Đăng xuất (Logout)</span>
        </div>
      </div>
    </aside>
  `;
}

export function buildTopbar(title, unreadsCount, session) {
  return `
    <div class="topbar-left">
      <div class="page-pill-live">
        <i class="fa-solid fa-circle text-emerald-500 animate-pulse" style="font-size:6px;"></i> Live
      </div>
      <h1 class="page-title">${esc(title)}</h1>
    </div>

    <div class="topbar-center">
      <div class="global-search-wrap">
        <i class="fa-solid fa-magnifying-glass search-ic-absolute"></i>
        <input type="text" class="search-input-box" id="global-search-input" placeholder="Tìm kiếm Lead, Deal, Khách hàng..." />
        <div class="search-results" id="global-search-dropdown-menu"></div>
      </div>
    </div>

    <div class="topbar-right">
      <!-- Today minicard schedule shortcut -->
      <button class="btn icon-only" id="minical-toggle-shortcut" tooltip="Hôm nay" style="background-color:var(--n50); border:1px solid var(--bd);">
        <i class="fa-regular fa-calendar-check text-indigo-500"></i>
      </button>

      <!-- Notifications panel control -->
      <div class="topbar-right-dropdown">
        <button class="btn icon-only" id="notif-toggle-shortcut" style="background-color:var(--n50); border:1px solid var(--bd); position:relative;">
          <i class="fa-regular fa-bell text-indigo-600"></i>
          ${unreadsCount > 0 ? `<span class="notif-bell-absolute"></span>` : ''}
        </button>
        <div class="dd-menu" id="notif-sc-menu" style="width:330px; padding:12px; max-height:450px; overflow-y:auto;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--n100); padding-bottom:8px; margin-bottom:8px;">
            <p style="font-weight:700; font-size:13px; color:var(--n900);">Thông báo nhận</p>
            <a href="#" id="notif-read-all-btn" style="font-size:11px; font-weight:700;">Đọc tất cả</a>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;" id="notif-list-sc-inject"></div>
          <div style="border-top:1px solid var(--n100); padding-top:8px; margin-top:8px; text-align:center;">
            <a href="#" id="notif-view-all-sc-link" style="font-size:12px; font-weight:700;">Xem tất cả thông báo &rarr;</a>
          </div>
        </div>
      </div>

      <!-- Live Switcher trigger menu -->
      <button class="btn pr" id="topbar-quickaction-trigger" style="padding: 8px 12px; border-radius:100px;">
        <i class="fa-solid fa-circle-plus"></i> Tạo nhanh
      </button>
      <div class="dd-menu" id="topbar-quickaction-menu" style="width: 180px;">
        <div class="dd-item" id="qa-add-lead-btn"><i class="fa-solid fa-filter text-amber-500"></i> Tạo Lead mới</div>
        <div class="dd-item" id="qa-add-deal-btn"><i class="fa-solid fa-comments-dollar text-primary-500"></i> Tạo Deal mới</div>
        <div class="dd-item" id="qa-add-contact-btn"><i class="fa-solid fa-user-plus text-success-500"></i> Thêm Contact</div>
        <div class="dd-item" id="qa-add-task-btn"><i class="fa-solid fa-list-check text-purple-500"></i> Khởi tạo Task</div>
      </div>

      <!-- Quick user profile dropdown -->
      <div class="topbar-right-dropdown">
        <div class="av sm" id="profile-tb-dropdown-trigger" style="cursor:pointer; background:var(--grad);">${session.initials || 'A'}</div>
        <div class="dd-menu" id="profile-tb-dropdown-menu">
          <div style="padding:10px 16px; border-bottom:1px solid var(--n100);">
            <p style="font-weight:700; font-size:12px; color:var(--n900);">${esc(session.name)}</p>
            <p style="font-size:10px; color:var(--n500);">${esc(session.email)}</p>
          </div>
          <div class="dd-item" id="go-profile-sc-btn"><i class="fa-solid fa-circle-user"></i> Hồ sơ cá nhân</div>
          <div class="dd-item" id="go-profile-sec-btn"><i class="fa-solid fa-shield-halved"></i> Đổi mật khẩu</div>
          <div class="dd-sep"></div>
          <div class="dd-item" id="logout-tb-bttn" style="color:var(--red);"><i class="fa-solid fa-power-off"></i> Đăng xuất</div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   3. ROLE SPECIFIC DASHBOARD Renders
   ========================================================================== */

export function renderSuperAdminDashboard() {
  // Key metrics calculations
  const totalRevenue = REVENUE_DATA.reduce((sum, d) => sum + d.revenue, 0);
  const leadsCount = LEADS_DB.length;
  const dealsWon = DEALS_DB.filter(d => d.stage === 'closed_won').length;
  const ticketsCount = TICKETS_DB.filter(t => t.status === 'open').length;

  return `
    <div class="page-container animate-fadeIn" style="display:flex; flex-direction:column; gap:12px;">
      <!-- Welcome Hero Jumbotron (TIGHTENED) -->
      <div class="panel" style="background:var(--grad); border:none; color:white; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:4px;">
        <div style="display:flex; flex-direction:column; gap:2px;">
          <h2 style="font-family:var(--fd); font-size:16px; font-weight:800;">Chào Ngày Mới, Cao Khải Hoàn!</h2>
          <p style="font-size:11.5px; color:rgba(255,255,255,0.8);">Cổng điều phối Super Admin. <i class="fa-solid fa-calendar-check"></i> Hôm nay có <strong class="text-amber-300">3 Deals Báo Giá</strong> sắp chốt.</p>
        </div>
        <div style="display:flex; gap:6px;">
          <button class="btn bl xs" id="sa-export-sc-data" style="background-color:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:white; font-size:11px; padding:4px 8px;"><i class="fa-solid fa-download"></i> Tải sao lưu DB</button>
          <button class="btn pr xs" id="sa-new-quota-target" style="background-color:white; color:var(--b600); font-size:11px; padding:4px 8px;"><i class="fa-solid fa-bullseye"></i> Đặt doanh hiệu</button>
        </div>
      </div>

      <!-- 5 compact Metrics KPI Row -->
      <div class="krow" style="gap:10px; margin-bottom:2px;">
        <div class="kc b" style="padding:10px 14px;">
          <span class="kc-title" style="font-size:11px;">Dòng chi trả MTD</span>
          <span class="kc-val" style="font-size:16px; font-weight:800; line-height:1.2;">${fmtVND(1654000000)}</span>
          <span class="kc-sub" style="font-size:9.5px; margin-top:2px;"><i class="fa-solid fa-circle-up text-emerald-500"></i> <strong class="kc-trend-up">+14%</strong></span>
        </div>
        <div class="kc p" style="padding:10px 14px;">
          <span class="kc-title" style="font-size:11px;">Cơ Hội thắng</span>
          <span class="kc-val" style="font-size:16px; font-weight:800; line-height:1.2;">${dealsWon}</span>
          <span class="kc-sub" style="font-size:9.5px; margin-top:2px;"><i class="fa-solid fa-circle-down text-rose-500"></i> <strong class="kc-trend-down">-2%</strong></span>
        </div>
        <div class="kc g" style="padding:10px 14px;">
          <span class="kc-title" style="font-size:11px;">Leads mới</span>
          <span class="kc-val" style="font-size:16px; font-weight:800; line-height:1.2;">${leadsCount}</span>
          <span class="kc-sub" style="font-size:9.5px; margin-top:2px;"><i class="fa-solid fa-circle-up text-emerald-500"></i> <strong class="kc-trend-up">+8%</strong></span>
        </div>
        <div class="kc a" style="padding:10px 14px;">
          <span class="kc-title" style="font-size:11px;">Win Rate</span>
          <span class="kc-val" style="font-size:16px; font-weight:800; line-height:1.2;">68%</span>
          <span class="kc-sub" style="font-size:9.5px; margin-top:2px;">Đạt mục tiêu SLA</span>
        </div>
        <div class="kc r" style="padding:10px 14px;">
          <span class="kc-title" style="font-size:11px;">Support Tickets</span>
          <span class="kc-val" style="font-size:16px; font-weight:800; line-height:1.2;">${ticketsCount}</span>
          <span class="kc-sub" style="font-size:9.5px; margin-top:2px;">SLA TB: <strong class="text-emerald-600">18m</strong></span>
        </div>
      </div>

      <!-- Compact Chart Columns Grid -->
      <div class="db-grid-3x" style="gap:12px; margin-bottom:2px;">
        <div class="panel" style="display:flex; flex-direction:column; gap:6px; padding:12px;">
          <h3 style="font-family:var(--fd); font-size:12.5px; font-weight:700;"><i class="fa-solid fa-sack-dollar text-indigo-500"></i> Doanh Thu Năm 2025 - 2026</h3>
          <div id="sa-bar-chart-container" class="chart-container-svg" style="height:140px; min-height:140px; max-height:140px;"></div>
        </div>
        <div class="panel" style="display:flex; flex-direction:column; gap:6px; padding:12px;">
          <h3 style="font-family:var(--fd); font-size:12.5px; font-weight:700;"><i class="fa-solid fa-user-plus text-indigo-500"></i> Tốc độ chuyển đổi Lead (6M)</h3>
          <div id="sa-line-chart-container" class="chart-container-svg" style="height:140px; min-height:140px; max-height:140px;"></div>
        </div>
        <div class="panel" style="display:flex; flex-direction:column; gap:6px; padding:12px;">
          <h3 style="font-family:var(--fd); font-size:12.5px; font-weight:700;"><i class="fa-solid fa-pie-chart text-indigo-500"></i> Trạng thái Deals hoạt động</h3>
          <div id="sa-donut-chart-container" class="chart-container-svg" style="height:140px; min-height:140px; max-height:140px;"></div>
        </div>
      </div>

      <!-- Bottom Layout split: Top Performers vs Audit log -->
      <div class="db-grid-2x" style="gap:12px;">
        <div class="panel" style="padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h3 style="font-family:var(--fd); font-size:12.5px; font-weight:700;"><i class="fa-solid fa-trophy text-amber-500"></i> Bảng Phong Thần Sales Rep</h3>
            <button class="btn bl xs" id="sa-view-performance-sc-link" style="font-size:10px; padding:2px 6px;">Hiệu suất</button>
          </div>
          <table class="tw" style="font-size:12px;">
            <thead>
              <tr>
                <th>Chiến binh</th>
                <th>Phòng ban</th>
                <th style="text-align:right;">Deals</th>
                <th style="text-align:right;">Doanh thu</th>
                <th>Trend (Spark)</th>
              </tr>
            </thead>
            <tbody>
              ${USERS_DB.filter(u=>u.role==='sales').slice(0, 4).map((u, i) => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <div class="av xs" style="background:${u.color}; width:20px; height:20px; font-size:9px; line-height:20px;">${u.initials}</div>
                      <span class="cell-bold">${esc(u.name)}</span>
                    </div>
                  </td>
                  <td><span class="chip bl" style="font-size:9px; padding:1px 4px;">${esc(u.dept)}</span></td>
                  <td style="text-align:right;" class="tmono">${u.dealsWon} won</td>
                  <td style="text-align:right;" class="cell-bold tmono text-emerald-600">${fmtVND(u.revenue || 0)}</td>
                  <td>
                    <div id="spark-rep-${u.id}" style="height:15px; width:50px;"></div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="panel" style="padding:12px;">
          <h3 style="font-family:var(--fd); font-size:12.5px; font-weight:700; margin-bottom:8px;"><i class="fa-solid fa-shield-halved text-emerald-500"></i> Nhật ký tác vụ an ninh hệ thống</h3>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${AUDIT_LOG_DB.slice(0, 3).map(log => `
              <div style="display:flex; gap:8px; padding-bottom:6px; border-bottom:1px solid var(--n50); font-size:11.5px;">
                <div style="width:20px; height:20px; border-radius:50%; background-color:var(--n100); display:flex; align-items:center; justify-content:center; color:var(--n500); shrink:0;">
                  <i class="fa-solid fa-user-lock" style="font-size:9.5px;"></i>
                </div>
                <div style="flex:1;">
                  <strong style="color:var(--n900);">${esc(log.user)}</strong> đã ${esc(log.action)} <strong>${esc(log.resource)}</strong>
                  <p style="font-size:9.5px; color:var(--n400); margin-top:1px;">${log.timestamp}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderManagerDashboard() {
  const pipelineValue = DEALS_DB.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').reduce((sum, d) => sum + d.value, 0);
  const leadsThisWeek = LEADS_DB.filter(l => l.priority === 'hot').length;
  const overdueTasks = TASKS_DB.filter(t => t.status !== 'completed').length;

  return `
    <div class="page-container animate-fadeIn">
      <!-- Jumbotron -->
      <div class="panel" style="background:linear-gradient(135deg, var(--p600), var(--b600)); color:white; border:none;">
        <h2 style="font-family:var(--fd); font-size:20px; font-weight:700;">Nhật ký Giám sát Đội ngũ: Trực thuộc Phòng Bán hàng B2B</h2>
        <p style="font-size:13px; color:rgba(255,255,255,0.8); margin-top:4px;">Tổng giá trị phễu dự toán kinh doanh (Pipeline Value) đang lưu động đàm phán chốt là <strong class="text-amber-300 font-mono" style="font-size:15px;">${fmtVND(pipelineValue)}</strong></p>
      </div>

      <!-- KPI metrics -->
      <div class="krow">
        <div class="kc b">
          <span class="kc-title">Trị giá Deals phễu</span>
          <span class="kc-val font-mono">${fmtVND(pipelineValue)}</span>
          <span class="kc-sub">Tổng cơ hội mua sắm lưu động</span>
        </div>
        <div class="kc p">
          <span class="kc-title">Đội ngũ Close Rate</span>
          <span class="kc-val font-mono">68%</span>
          <span class="kc-sub">Hạn mức chỉ tiêu kỉ luật Sales</span>
        </div>
        <div class="kc g">
          <span class="kc-title">Leads ưu tiên Hot MTD</span>
          <span class="kc-val font-mono">${leadsThisWeek}</span>
          <span class="kc-sub">Mức độ hoạt động phễu cao</span>
        </div>
        <div class="kc r">
          <span class="kc-title">Nhiệm vụ quá hạn</span>
          <span class="kc-val font-mono text-rose-500">${overdueTasks}</span>
          <span class="kc-sub">Cần rà soát cuộc họp Giao Ban</span>
        </div>
      </div>

      <!-- Charts Section: Funnel and Team Stats -->
      <div class="db-grid-2x">
        <div class="panel">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-funnel-dollar text-indigo-500"></i> Phân tích tỉ lệ rớt phễu bán hàng (Conversion Funnel)</h3>
          <div id="m-funnel-container"></div>
        </div>

        <div class="panel">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-bullseye text-primary-500"></i> Tiến trình doanh hiệu chỉ tiêu đội ngũ (MTD Quota)</h3>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${USERS_DB.filter(u => u.role === 'sales').slice(0,4).map(sales => {
              const percentage = Math.round((sales.revenue / sales.target) * 100) || 0;
              const barColor = percentage > 80 ? 'g' : percentage > 50 ? 'b' : 'a';
              return `
                <div style="font-size:12px;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-weight:700;">
                    <span>${esc(sales.name)}</span>
                    <span class="tmono">${fmtVND(sales.revenue)} / ${fmtVND(sales.target)} (${percentage}%)</span>
                  </div>
                  <div class="pw tk">
                    <div class="pb ${barColor}" style="width: ${percentage}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSalesRepDashboard() {
  const myDeals = DEALS_DB.filter(d => d.ownerId === 'usr-sales');
  const myRevenue = myDeals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0);
  const myTasks = TASKS_DB.filter(t => t.ownerId === 'usr-sales' && t.status !== 'completed');

  return `
    <div class="page-container animate-fadeIn">
      <!-- Rep customized greeting card -->
      <div class="panel" style="background-color:white; border-left:4px solid var(--b600); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h2 style="font-family:var(--fd); font-size:18px; font-weight:700;">Chào Chiến Binh Đặng Việt Triều!</h2>
          <p style="font-size:12px; color:var(--n500); margin-top:2px;">Bạn có <strong class="text-rose-500">${myTasks.length} nhiệm vụ (Tasks)</strong> cần phải hoàn tất hôm nay để duy trì luân chuyển phễu đàm phán.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn pr" id="rep-call-planning-btn"><i class="fa-solid fa-phone"></i> Đặt lịch hẹn thoại</button>
        </div>
      </div>

      <!-- Summary mini cards -->
      <div class="krow">
        <div class="kc b">
          <span class="kc-title">Doanh số thu kiếm</span>
          <span class="kc-val font-mono">${fmtVND(myRevenue)}</span>
          <span class="kc-sub">So với KPI tháng: <strong>65%</strong></span>
        </div>
        <div class="kc p">
          <span class="kc-title">Deals phụ trách</span>
          <span class="kc-val font-mono">${myDeals.length}</span>
          <span class="kc-sub">Vận hành trong 5 phân kỳ</span>
        </div>
        <div class="kc g">
          <span class="kc-title">Hot Leads của tôi</span>
          <span class="kc-val font-mono">${LEADS_DB.filter(l=>l.ownerId==='usr-sales' && l.priority==='hot').length}</span>
          <span class="kc-sub">Cần bấm gọi ngay</span>
        </div>
      </div>

      <!-- Tasks Checklist Widget (Fully Interactive) -->
      <div class="db-grid-2x">
        <div class="panel">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-list-check text-purple-500"></i> Sổ tay xử lý tác nghiệp Đặng Việt Triều (Tasks Checklist)</h3>
          <div class="checklist-widget" id="salesrep-task-checklist-inject">
            ${myTasks.length === 0 ? `
              <div class="empty">
                <div class="empty-ico"><i class="fa-solid fa-award"></i></div>
                <p class="empty-msg">Tuyệt vời! Đã hoàn tất mọi nhiệm vụ!</p>
              </div>
            ` : myTasks.map(tsk => `
              <div class="chk-item" data-task-id="${tsk.id}">
                <input type="checkbox" class="chk-input" ${tsk.completed ? 'checked' : ''} />
                <div class="tl-body">
                  <span class="chk-label font-bold text-slate-800 ${tsk.completed ? 'text-decoration-line-through text-slate-400' : ''}">${esc(tsk.title)}</span>
                  <p class="tl-meta"><i class="fa-solid fa-clock"></i> Hạn kỳ: ${tsk.dueDate} &middot; <span class="chip ${tsk.priority==='high'?'rd':'bl'}">${tsk.priority}</span></p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="panel">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-user-clock text-indigo-500"></i> Lịch hẹn làm việc sắp diễn ra</h3>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${ACTIVITIES_DB.filter(a=>a.type==='meeting').slice(0, 3).map(meet => `
              <div style="padding:10px; border-radius:var(--rs); background-color:var(--n50); border:1px solid var(--bd); font-size:12px;">
                <p style="font-weight:700; color:var(--n800);"><i class="fa-solid fa-users"></i> ${esc(meet.title)}</p>
                <p style="color:var(--n500); margin-top:2px;">Thời điểm: <span class="tmono">${meet.datetime}</span></p>
                <p style="font-size:10px; color:var(--n400); margin-top:2px;">Ghi chú: ${esc(meet.outcome)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderSupportDashboard() {
  const openTickets = TICKETS_DB.filter(t => t.status === 'open');
  const resolvedCount = TICKETS_DB.filter(t => t.status === 'resolved').length;

  return `
    <div class="page-container animate-fadeIn">
      <div class="panel" style="background-color:white; border-left:4px solid var(--teal);">
        <h2 style="font-family:var(--fd); font-size:18px; font-weight:700;">Hỗ Trợ Tuyến Đầu & Đo lường Chỉ số SLA</h2>
        <p style="font-size:12px; color:var(--n500); margin-top:2px;">Trực thuộc phòng CSKH. Hiện có <strong class="text-rose-500">${openTickets.length} sự cố kỹ thuật</strong> đang chờ tiếp quản phản hồi đầu dòng.</p>
      </div>

      <div class="krow">
        <div class="kc b">
          <span class="kc-title">Tickets đang phân phối</span>
          <span class="kc-val font-mono">${openTickets.length}</span>
          <span class="kc-sub">Quy trình SLA cam kết: 4 giờ</span>
        </div>
        <div class="kc g">
          <span class="kc-title">Sự cố Đã Giải Quyết</span>
          <span class="kc-val font-mono">${resolvedCount} tickets</span>
          <span class="kc-sub">Tỉ lệ CSAT TB: <strong class="text-emerald-500">4.8 / 5.0 ⭐</strong></span>
        </div>
        <div class="kc a">
          <span class="kc-title">SLA Vi Phạm</span>
          <span class="kc-val font-mono text-rose-500">1 ticket</span>
          <span class="kc-sub">Cần can thiệp khẩn cấp chuyên gia</span>
        </div>
      </div>

      <!-- Ticket Queue list -->
      <div class="panel">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-list-check text-indigo-500"></i> Hàng chờ xử lý xử lý tickets an ninh vận hành</h3>
        <table class="tw">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Tiêu đề sự cố</th>
              <th>Khách hàng</th>
              <th>Độ ưu tiên</th>
              <th>Trạng thái</th>
              <th>Cách thức nhận</th>
              <th style="text-align:center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${openTickets.slice(0, 5).map(tk => `
              <tr>
                <td class="tmono cell-bold">${tk.number}</td>
                <td><span style="font-weight:700; color:var(--n800);">${esc(tk.subject)}</span></td>
                <td>${esc(tk.contactName)}</td>
                <td><span class="chip ${tk.priority==='Critical'?'rd':'am'}">${tk.priority}</span></td>
                <td><span class="chip bl">${tk.status}</span></td>
                <td><span class="chip gy">${tk.channel}</span></td>
                <td style="text-align:center;">
                  <button class="btn bl sm" onclick="window.crmApp.openTicketDetail('${tk.id}')"><i class="fa-solid fa-headset"></i> Chăm sóc</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================================================
   4. CORE SALES LEADS VIEW PAGE MODULES
   ========================================================================== */

export function drawLeadsPage(leadsList, activeTab, filterState) {
  return `
    <div class="page-container animate-fadeIn">
      <!-- Toolbar controls filtering -->
      <div class="filter-bar">
        <div class="search-box-md">
          <i class="fa-solid fa-magnifying-glass search-ic-absolute" style="left:10px;"></i>
          <input type="text" id="leads-search-input" value="${esc(filterState.search || '')}" placeholder="Tìm kiếm Lead bằng tên hoặc công ty..." />
        </div>
        <select class="filter-select" id="leads-source-filter">
          <option value="all">Tất cả nguồn tiếp cận</option>
          <option value="Facebook Ads" ${filterState.source==='Facebook Ads'?'selected':''}>Facebook Ads</option>
          <option value="Google Search Form" ${filterState.source==='Google Search Form'?'selected':''}>Google Form</option>
          <option value="Referral Partner" ${filterState.source==='Referral Partner'?'selected':''}>Đối tác Referral</option>
          <option value="Cold Calling Campaign" ${filterState.source==='Cold Calling Campaign'?'selected':''}>Điện thoại lạnh</option>
        </select>
        <select class="filter-select" id="leads-priority-filter">
          <option value="all">Tất cả thứ tự ưu tiên</option>
          <option value="hot" ${filterState.priority==='hot'?'selected':''}>🔥 Hot Leads</option>
          <option value="warm" ${filterState.priority==='warm'?'selected':''}>⚡ Warm Leads</option>
          <option value="cold" ${filterState.priority==='cold'?'selected':''}>❄️ Cold Leads</option>
        </select>
        <button class="btn pr" id="lead-add-modal-trigger"><i class="fa-solid fa-user-plus"></i> Tạo Lead Mới</button>
      </div>

      <!-- Tabbing filters -->
      <div class="tabbar">
        <div class="tab ${activeTab==='all'?'active':''}" data-tab="all">Tất cả (${leadsList.length})</div>
        <div class="tab ${activeTab==='new'?'active':''}" data-tab="new">Mới (${leadsList.filter(l=>l.status==='new').length})</div>
        <div class="tab ${activeTab==='contacting'?'active':''}" data-tab="contacting">Đang xử lý (${leadsList.filter(l=>l.status==='contacting').length})</div>
        <div class="tab ${activeTab==='qualified'?'active':''}" data-tab="qualified">Đã Qualify (${leadsList.filter(l=>l.status==='qualified').length})</div>
        <div class="tab ${activeTab==='lost'?'active':''}" data-tab="lost">Mất Lead (${leadsList.filter(l=>l.status==='lost').length})</div>
      </div>

      <!-- Leads dynamic table -->
      <div class="panel" style="padding:0; overflow-x:auto;">
        ${leadsList.length === 0 ? `
          <div class="empty">
            <div class="empty-ico"><i class="fa-solid fa-user-minus"></i></div>
            <p class="empty-msg">Không tìm thấy bản ghi Leads nào</p>
            <p class="empty-sub">Vui lòng điều chỉnh tiêu chí bộ lọc của bạn hoặc tạo mới.</p>
          </div>
        ` : `
          <table class="tw">
            <thead>
              <tr>
                <th># ID</th>
                <th>Họ Tên Lead</th>
                <th>Công Ty</th>
                <th>Nguồn tiếp cận</th>
                <th>Thứ tự ưu tiên</th>
                <th style="text-align:right;">Giá trị ước lượng</th>
                <th>Người đại diện phụ trách</th>
                <th style="text-align:center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${leadsList.map(led => {
                const priorityBadge = led.priority === 'hot' ? 'chip rd' : led.priority === 'warm' ? 'chip am' : 'chip gy';
                const owner = USERS_DB.find(u => u.id === led.ownerId);
                return `
                  <tr>
                    <td class="tmono">${led.id}</td>
                    <td><span class="cell-bold">${esc(led.name)}</span></td>
                    <td>${esc(led.company)}</td>
                    <td><span class="chip bl">${esc(led.source)}</span></td>
                    <td><span class="${priorityBadge}">${led.priority?.toUpperCase()}</span></td>
                    <td style="text-align:right;" class="tmono cell-bold text-primary-600">${fmtVND(led.value)}</td>
                    <td>
                      <div style="display:flex; align-items:center; gap:6px;">
                        <div class="av xs" style="background:${owner?.color || 'var(--grad)'}">${owner?.initials || 'S'}</div>
                        <span style="font-size:11.5px; font-weight:600;">${owner ? esc(owner.name) : 'Chưa giao'}</span>
                      </div>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:flex; justify-content:center; gap:8px;">
                        <button class="btn gr" onclick="window.crmApp.convertLeadToDeal('${led.id}')" title="Chuyển đổi thành Deal thương thảo"><i class="fa-solid fa-shuffle"></i> Convert</button>
                        <button class="btn bl icon-only" onclick="window.crmApp.openLeadDetail('${led.id}')" title="Chỉnh sửa"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn rd icon-only" onclick="window.crmApp.deleteLead('${led.id}')" title="Xóa bỏ"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

/* ==========================================================================
   5. KANBAN PIPELINE BOARD & DEALS
   ========================================================================== */

export function renderPipelineKanban(dealsList, activeSubTab = 'kanban') {
  const STAGES = [
    { id: 'prospecting', label: 'Tiếp cận khách hàng', color: 'var(--b400)' },
    { id: 'qualified', label: 'Đánh giá đủ điều kiện', color: 'var(--p500)' },
    { id: 'proposal', label: 'Đề xuất giải pháp', color: 'var(--amber)' },
    { id: 'negotiation', label: 'Đàm phán thương thảo', color: 'var(--teal)' },
    { id: 'closed_won', label: 'Hợp Đồng Thành Công (WIN)', color: 'var(--green)' }
  ];

  let boardHtml = '';
  STAGES.forEach(stg => {
    const stgDeals = dealsList.filter(d => d.stage === stg.id);
    const colSumValue = stgDeals.reduce((sum, d) => sum + d.value, 0);

    let cardsHtml = '';
    stgDeals.forEach(deal => {
      const pClass = deal.probability >= 80 ? 'hot' : deal.probability >= 40 ? 'warm' : 'cold';
      cardsHtml += `
        <div class="deal-card ${pClass}" onclick="window.crmApp.openDealDetailModal('${deal.id}')">
          <div class="deal-card-header">
            <span class="deal-card-name">${esc(deal.name)}</span>
            <span class="chip gy" style="font-size:9px;">${deal.probability}%</span>
          </div>
          <div style="font-size:11px; color:var(--n500);">${esc(deal.companyName)}</div>
          <p class="deal-value">${fmtVND(deal.value)}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <div style="font-size:10px; color:var(--n400); font-family:var(--fm);"><i class="fa-regular fa-clock"></i> ${deal.expectedClose}</div>
            <button class="btn bl" style="padding:2px 6px; font-size:10px;" onclick="event.stopPropagation(); window.crmApp.moveDealNextStage('${deal.id}')">
              Dịch chuyển <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      `;
    });

    boardHtml += `
      <div class="pipeline-col">
        <div class="pipeline-col-hd" style="border-top:3px solid ${stg.color}">
          <div style="display:flex; flex-direction:column;">
            <span class="pipeline-col-title">${stg.label}</span>
            <span style="font-size:11px; font-weight:700; color:var(--b600); font-family:var(--fm); margin-top:2px;">${fmtVND(colSumValue)}</span>
          </div>
          <span class="chip gy tmono" style="padding:1px 6px;">${stgDeals.length}</span>
        </div>
        <div class="pipeline-col-body">
          ${stgDeals.length === 0 ? `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 12px; border:2px dashed var(--n200); border-radius:var(--rs); color:var(--n400); font-size:11px; text-align:center;">
              <i class="fa-solid fa-box-open" style="font-size:24px; margin-bottom:8px;"></i> Cột phễu hiện trống
            </div>
          ` : cardsHtml}
        </div>
      </div>
    `;
  });

  let listHtml = '';
  if (activeSubTab === 'list') {
    listHtml = `
      <div class="panel" style="padding:0; overflow-x:auto;">
        <table class="tw">
          <thead>
            <tr>
              <th>Tên Cơ hội / Thương vụ</th>
              <th>Khách hàng & Doanh nghiệp</th>
              <th>Giá trị Dự toán (VND)</th>
              <th>Tiến độ Phễu</th>
              <th>Xác suất chốt</th>
              <th>Hạn dự kiến chốt</th>
              <th style="text-align:center;">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            ${dealsList.map(deal => {
              const stageLabel = STAGES.find(s => s.id === deal.stage)?.label || deal.stage;
              const probClass = deal.probability >= 80 ? 'chip gr' : deal.probability >= 40 ? 'chip am' : 'chip rd';
              return `
                <tr>
                  <td><span class="cell-bold text-primary-600 clickable" onclick="window.crmApp.openDealDetailModal('${deal.id}')">${esc(deal.name)}</span></td>
                  <td>
                    <div style="font-weight:600;">${esc(deal.contactName)}</div>
                    <div style="font-size:11px; color:var(--n500);">${esc(deal.companyName)}</div>
                  </td>
                  <td class="tmono cell-bold text-emerald-600">${fmtVND(deal.value)}</td>
                  <td>
                    <span class="chip bl" style="font-size:10px; font-weight:700;">${stageLabel}</span>
                  </td>
                  <td>
                    <span class="${probClass}" style="font-size:10px; font-weight:700;">${deal.probability}%</span>
                  </td>
                  <td class="tmono">${deal.expectedClose}</td>
                  <td style="text-align:center;">
                    <div style="display:flex; justify-content:center; gap:6px;">
                      <button class="btn bl sm" onclick="window.crmApp.openDealDetailModal('${deal.id}')"><i class="fa-solid fa-eye"></i> Tác nghiệp</button>
                      <button class="btn bl sm icon-only" onclick="window.crmApp.moveDealNextStage('${deal.id}')" title="Dịch chuyển tiến độ"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div class="page-container animate-fadeIn">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bd); padding-bottom: 12px; margin-bottom: 4px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px;">
          <button class="btn ${activeSubTab === 'kanban' ? 'pr' : 'bl'} sm" id="deals-tab-kanban-btn" style="font-weight:700;">
            <i class="fa-solid fa-layer-group"></i> Sơ đồ Phễu Kanban
          </button>
          <button class="btn ${activeSubTab === 'list' ? 'pr' : 'bl'} sm" id="deals-tab-list-btn" style="font-weight:700;">
            <i class="fa-solid fa-list-ul"></i> Danh sách Cơ hội chi tiết
          </button>
        </div>
        <button class="btn pr" id="pipeline-quick-add-deal-btn"><i class="fa-solid fa-circle-plus"></i> Tạo Deal Thương Lượng mới</button>
      </div>

      ${activeSubTab === 'kanban' ? `
        <div class="panel" style="background-color:white; display:flex; justify-content:space-between; align-items:center; padding:12px 24px; margin-bottom: 4px;">
          <p style="font-size:13px; color:var(--n500);"><i class="fa-solid fa-circle-question"></i> Di chuyển các thẻ Deals thương lượng trôi xuôi phễu theo thứ tự từ trái qua phải để chốt đơn hàng.</p>
        </div>
        <div class="pipeline-board">
          ${boardHtml}
        </div>
      ` : listHtml}
    </div>
  `;
}

/* ==========================================================================
   6. TASKS CHECKLISTS VIEWS
   ========================================================================== */

export function renderTasksPage(tasksList, filterTag = 'all') {
  const isActivities = filterTag === 'activities';
  let filtered = tasksList;
  if (!isActivities) {
    if (filterTag === 'today') {
      filtered = tasksList.filter(t => t.dueDate === '23/05/2026');
    } else if (filterTag === 'completed') {
      filtered = tasksList.filter(t => t.completed);
    } else if (filterTag === 'pending') {
      filtered = tasksList.filter(t => !t.completed);
    }
  }

  return `
    <div class="page-container animate-fadeIn">
      <!-- Title & Module tabs -->
      <div class="panel" style="padding: 14px 18px; margin-bottom: 12px; border-left: 4px solid var(--p500);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <h2 style="font-family:var(--fd); font-size:16px; font-weight:800; color:var(--n800);"><i class="fa-solid fa-clipboard-list text-purple-600"></i> Quản lý Nhiệm Vụ & Nhật Ký Tác Lực</h2>
            <p style="font-size:12px; color:var(--n500); margin-top:2px;">Checklist việc cần làm khẩn cấp kết hợp sổ ghi cuộc gọi, cuộc họp, email tác nghiệp với khách hàng.</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn ${!isActivities ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('all')" style="font-weight:700;"><i class="fa-solid fa-list-check"></i> Checklist Công Việc (${tasksList.length})</button>
            <button class="btn ${isActivities ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('activities')" style="font-weight:700;"><i class="fa-solid fa-business-time"></i> Nhật Ký Tác Nghiệp (${ACTIVITIES_DB.length})</button>
          </div>
        </div>
      </div>

      <!-- Action Panel -->
      <div class="panel" style="padding: 12px 16px; margin-bottom: 12px; background-color:var(--n25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="font-size:12px; color:var(--n600);">
          ${isActivities 
            ? 'Theo dõi diễn biến lịch sử liên hệ, thương hiệu kết nối điện thoại và lưu bút ghi nhớ.'
            : 'Sắp xếp, lọc hạn và đánh dấu tiến trình xử lý đầu việc cá nhân.'
          }
        </div>
        ${isActivities 
          ? `<button class="btn pr xs" id="activities-toggle-creator-trigger-btn"><i class="fa-solid fa-circle-plus"></i> Ghi nhận Tác Nghiệp mới</button>`
          : `<button class="btn pr xs" id="tasks-open-creator-modal-trigger"><i class="fa-solid fa-circle-plus"></i> Khởi tạo Task mới</button>`
        }
      </div>

      <!-- Detail views -->
      ${isActivities ? `
        <!-- Activities View -->
        <div class="panel" style="padding: 16px; display:flex; flex-direction:column; gap:10px;">
          ${ACTIVITIES_DB.length === 0 ? `
            <div class="empty">
              <div class="empty-ico"><i class="fa-solid fa-business-time"></i></div>
              <p class="empty-msg">Chưa có nhật ký tác nghiệp nào</p>
            </div>
          ` : ACTIVITIES_DB.map(act => {
            const typeIcon = act.type === 'call' ? '📞' : act.type === 'email' ? '📧' : act.type === 'meeting' ? '📅' : '📝';
            return `
              <div style="display:flex; gap:12px; padding:12px; border:1px solid var(--bd); border-radius:var(--rs); background-color:var(--sur); position:relative; align-items:center; justify-content:space-between;">
                <div style="display:flex; gap:12px; align-items:center; flex:1;">
                  <div style="font-size:20px; padding:6px; border-radius:50%; background-color:var(--n25); display:flex; align-items:center; justify-content:center; width:36px; height:36px;">
                    ${typeIcon}
                  </div>
                  <div style="flex:1;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                      <h4 style="font-weight:700; color:var(--n900); font-size:13px; font-family:var(--fd);">${esc(act.title)}</h4>
                      <span class="tmono" style="font-size:11px; color:var(--n400);">${act.datetime} &middot; Lượng: ${act.duration}</span>
                    </div>
                    <p style="font-size:12px; color:var(--n600); margin: 3px 0;">Kết luận: <span style="font-weight:600; color:var(--b600);">${esc(act.outcome)}</span></p>
                    <p style="font-size:11.5px; color:var(--n500); background-color:var(--n25); padding:6px 10px; border-radius:4px; margin-top:2px; font-style:italic;"><i class="fa-solid fa-quote-left text-slate-300" style="margin-right:2px;"></i> ${esc(act.notes)}</p>
                  </div>
                </div>
                <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; margin-left:12px;">
                  <span class="chip bl font-bold uppercase" style="font-size:8px;">${act.direction || 'outbound'}</span>
                  <button class="btn rd icon-only sm" onclick="window.crmApp.deleteActivityDirect('${act.id}')" title="Xóa" style="width:26px; height:26px;"><i class="fa-solid fa-trash-can" style="font-size:11px;"></i></button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : `
        <!-- Filter Pills for Tasks -->
        <div class="panel" style="padding: 10px 16px; margin-bottom: 12px; background-color: var(--n25); display:flex; gap:8px;">
          <button class="btn ${filterTag === 'all' ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('all')">Tất cả (${tasksList.length})</button>
          <button class="btn ${filterTag === 'today' ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('today')">Hôm nay (${tasksList.filter(t => t.dueDate === '23/05/2026').length})</button>
          <button class="btn ${filterTag === 'pending' ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('pending')">Đang xử lý (${tasksList.filter(t => !t.completed).length})</button>
          <button class="btn ${filterTag === 'completed' ? 'pr' : 'bl'} xs" onclick="window.crmApp.switchTaskView('completed')">Đã xong (${tasksList.filter(t => t.completed).length})</button>
        </div>

        <div class="panel" style="padding:0;">
          ${filtered.length === 0 ? `
            <div class="empty">
              <div class="empty-ico"><i class="fa-solid fa-list-check"></i></div>
              <p class="empty-msg">Hàng chờ checklist công tác rỗng</p>
            </div>
          ` : `
            <table class="tw">
              <thead>
                <tr>
                  <th style="width:40px;">☐</th>
                  <th>Tiêu đề Task</th>
                  <th>Thể loại</th>
                  <th>Hạn chót</th>
                  <th>Ưu tiên</th>
                  <th>Trạng thái</th>
                  <th style="text-align:center;">Xóa</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(tsk => `
                  <tr class="${tsk.completed ? 'completed' : ''}">
                    <td>
                      <input type="checkbox" class="chk-input" ${tsk.completed?'checked':''} onchange="window.crmApp.toggleTaskCompletion('${tsk.id}')" />
                    </td>
                    <td>
                      <span class="cell-bold font-sans ${tsk.completed?'text-decoration-line-through text-slate-400':''}" style="font-size:13px;">${esc(tsk.title)}</span>
                      <p style="font-size:11px; color:var(--n400); margin-top:1px;">Mô tả: ${esc(tsk.description)}</p>
                    </td>
                    <td>
                      <span class="chip bl uppercase font-bold" style="font-size:9.5px;"><i class="fa-regular fa-comment-dots"></i> ${tsk.type}</span>
                    </td>
                    <td class="tmono">${tsk.dueDate}</td>
                    <td><span class="chip ${tsk.priority==='high'?'rd':'bl'}">${tsk.priority?.toUpperCase()}</span></td>
                    <td>
                      <span class="chip ${tsk.completed?'gr':'am'}">${tsk.completed?'Đã hoàn thành':'Chờ làm'}</span>
                    </td>
                    <td style="text-align:center;">
                      <button class="btn rd icon-only sm" onclick="window.crmApp.deleteTask('${tsk.id}')" style="width:28px; height:28px;"><i class="fa-solid fa-trash-can"></i></button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      `}
    </div>
  `;
}

/* ==========================================================================
   7b. FINANCIAL INVOICES & BALANCE DEBTS
   ========================================================================== */

export function renderInvoicesPage(invoicesList) {
  // Calculations
  const totalInvoiced = invoicesList.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = invoicesList.reduce((sum, inv) => {
    if (inv.status === 'paid') return sum + inv.total;
    if (inv.status === 'partial') return sum + inv.total * 0.5; // 50% paid
    return sum;
  }, 0);
  const totalDebt = totalInvoiced - totalCollected;

  return `
    <div class="page-container animate-fadeIn">
      <!-- Metric Cards for Accounts Receivable & Cashflow -->
      <div class="krow" style="margin-bottom: 4px;">
        <div class="kcard b">
          <div class="kc-title">Tổng Doanh Số Đã Xuất Hóa Đơn</div>
          <div class="kc-val font-mono text-primary-600">${fmtVND(totalInvoiced)}</div>
          <div class="kc-sub"><i class="fa-solid fa-file-invoice-dollar"></i> Tổng số: ${invoicesList.length} hóa đơn</div>
        </div>
        <div class="kcard g">
          <div class="kc-title">Dòng Tiền Thực Thu (Đã Thu Hồi)</div>
          <div class="kc-val font-mono text-emerald-600">${fmtVND(totalCollected)}</div>
          <div class="kc-sub"><i class="fa-solid fa-circle-check text-emerald-500"></i> Đã quy chuẩn hoạch toán</div>
        </div>
        <div class="kcard r">
          <div class="kc-title">Tổng Công Nợ / Dư Nợ Chưa Thu</div>
          <div class="kc-val font-mono text-rose-600">${fmtVND(totalDebt)}</div>
          <div class="kc-sub"><i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Yêu cầu hối thúc thanh toán</div>
        </div>
      </div>

      <div class="filter-bar" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700;"><i class="fa-solid fa-file-invoice text-indigo-500"></i> Sổ Sách Hóa Đơn Tài Chính & Theo Dõi Dư Nợ</h3>
        <button class="btn pr" id="invoices-quick-issue-btn"><i class="fa-solid fa-file-invoice-dollar"></i> Phát hành Hóa đơn đỏ VAT</button>
      </div>

      <div class="panel" style="padding:0;">
        ${invoicesList.length === 0 ? `
          <div class="empty">
            <div class="empty-ico"><i class="fa-solid fa-folder-open"></i></div>
            <p class="empty-msg">Chưa ghi nhận hóa đơn tài chính nào trên mạng lưới</p>
          </div>
        ` : `
          <table class="tw">
            <thead>
              <tr>
                <th>Mã Hóa Đơn</th>
                <th>Khách hàng & Đối tác</th>
                <th>Giá trị (VND)</th>
                <th>Đã thu hồi (VND)</th>
                <th>Dư nợ / Công nợ (VND)</th>
                <th>Hạn thanh toán</th>
                <th>Trạng thái thu hồi</th>
                <th style="text-align:center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesList.map(inv => {
                let stBadge = 'chip gy';
                let outstanding = inv.total;
                let paidAmt = 0;
                if (inv.status === 'paid') {
                  stBadge = 'chip gr';
                  outstanding = 0;
                  paidAmt = inv.total;
                } else if (inv.status === 'partial') {
                  stBadge = 'chip bl';
                  outstanding = inv.total * 0.5;
                  paidAmt = inv.total * 0.5;
                } else if (inv.status === 'overdue') {
                  stBadge = 'chip rd';
                  outstanding = inv.total;
                  paidAmt = 0;
                }

                return `
                  <tr>
                    <td class="tmono cell-bold text-indigo-600">${inv.number}</td>
                    <td>
                      <span class="cell-bold">${esc(inv.contactName)}</span>
                      <div style="font-size:10px; color:var(--n400); font-family:var(--fm);">${inv.quoteId}</div>
                    </td>
                    <td class="tmono cell-bold text-gray-700">${fmtVND(inv.total)}</td>
                    <td class="tmono text-emerald-600">${fmtVND(paidAmt)}</td>
                    <td class="tmono text-rose-600 cell-bold">${outstanding > 0 ? fmtVND(outstanding) : '<span class="text-emerald-600">✓ Sạch nợ</span>'}</td>
                    <td class="tmono">${inv.dueDate}</td>
                    <td>
                      <span class="${stBadge} uppercase" style="font-size:10px; font-weight:700;">
                        ${inv.status === 'paid' ? 'Đã Thanh Toán' : inv.status === 'partial' ? 'Đặt cọc 50%' : 'Quá Hạn / Ghi Nợ'}
                      </span>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:flex; justify-content:center; gap:8px;">
                        ${outstanding > 0 ? `
                          <button class="btn gr sm" onclick="window.crmApp.recordInvoicePayment('${inv.id}')" title="Thu hồi công nợ trực tiếp" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-cash-register"></i> Thu hồi</button>
                        ` : ''}
                        <button class="btn bl sm icon-only" onclick="window.crmApp.printInvoice('${inv.id}')" title="Xem chi tiết hóa đơn/In ấn"><i class="fa-solid fa-print"></i></button>
                        <button class="btn rd sm icon-only" onclick="window.crmApp.deleteInvoice('${inv.id}')" title="Hủy hóa đơn"><i class="fa-solid fa-circle-xmark"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

/* ==========================================================================
   7. QUOTATIONS BUILDER & CALCULATION WIDGETS
   ========================================================================== */

export function renderQuotationsPage(quotesList) {
  return `
    <div class="page-container animate-fadeIn">
      <div class="filter-bar" style="display:flex; justify-content:space-between;">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700;"><i class="fa-solid fa-file-invoice-dollar text-primary-500"></i> Quản lý Hồ sơ Báo giá (Quotations Portfolio)</h3>
        <button class="btn pr" id="quotations-open-builder-trigger-btn"><i class="fa-solid fa-file-signature"></i> Tạo Báo giá mới</button>
      </div>

      <div class="panel" style="padding:0;">
        ${quotesList.length === 0 ? `
          <div class="empty">
            <div class="empty-ico"><i class="fa-medium fa-file-invoice"></i></div>
            <p class="empty-msg">Chưa xuất bản biểu mốc báo giá nào</p>
          </div>
        ` : `
          <table class="tw">
            <thead>
              <tr>
                <th>Số báo giá</th>
                <th>Khách hàng đề nghị</th>
                <th>Giá trị tổng ước tính</th>
                <th>Ngày phát hành</th>
                <th>Hạn hiệu lực</th>
                <th>Trạng thái duyệt</th>
                <th style="text-align:center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${quotesList.map(q => {
                let stBadge = 'chip gy';
                if (q.status === 'chap_nhan') stBadge = 'chip gr';
                else if (q.status === 'xem_xet') stBadge = 'chip am';
                else if (q.status === 'tu_choi') stBadge = 'chip rd';
                
                return `
                  <tr>
                    <td class="tmono cell-bold text-primary-600">${q.number}</td>
                    <td><span class="cell-bold">${esc(q.contactName)}</span></td>
                    <td class="tmono cell-bold text-emerald-600">${fmtVND(q.total)}</td>
                    <td class="tmono">${q.createdAt}</td>
                    <td class="tmono">${q.validUntil}</td>
                    <td><span class="${stBadge} uppercase" style="font-size:10px;">${q.status}</span></td>
                    <td style="text-align:center;">
                      <div style="display:flex; justify-content:center; gap:8px;">
                        <button class="btn bl" onclick="window.crmApp.printQuotation('${q.id}')"><i class="fa-solid fa-print"></i> In / Xuất PDF</button>
                        <button class="btn bl icon-only" onclick="window.crmApp.deleteQuote('${q.id}')"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

export function drawQuoteBuilderInner() {
  let productsOptions = PRODUCTS_DB.map(p => `
    <option value="${p.id}" data-price="${p.price}">${esc(p.name)} (${fmtVND(p.price)})</option>
  `).join('');

  return `
    <form id="quote-builder-modal-form" class="auth-body">
      <div class="fr2">
        <div class="fg">
          <label>Chọn liên hệ người mua *</label>
          <select id="qb-customer-contact" required>
            ${CONTACTS_DB.map(c => `<option value="${c.id}">${esc(c.fullName)} (${esc(c.companyName)})</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Kỳ hạn hiệu lực của biểu mẫu *</label>
          <input type="date" id="qb-valid-until" required value="2026-06-30" />
        </div>
      </div>

      <!-- Live Calculation Line Items Sheet -->
      <div style="margin-top:12px;">
        <h4 style="font-size:12px; font-weight:700; color:var(--n500); margin-bottom:8px; text-transform:uppercase;">Hạng mục sản phẩm tính toán giá tiền</h4>
        <table class="quote-items-table" id="qb-items-table-inject">
          <thead>
            <tr>
              <th>Tên sản phẩm/dịch vụ cấu thành</th>
              <th style="width:100px;">Đơn giá</th>
              <th style="width:70px;">SL mua</th>
              <th style="width:100px; text-align:right;">Thành tiền</th>
              <th style="width:50px; text-align:center;">Xử lý</th>
            </tr>
          </thead>
          <tbody id="qb-items-body-rows">
            <!-- Row structures will append here -->
          </tbody>
        </table>
        <button type="button" class="btn bl mt-12" id="qb-append-item-row-btn" style="padding:6px 12px; font-size:11px;"><i class="fa-solid fa-plus"></i> Thêm sản phẩm chi tiếp</button>
      </div>

      <div class="quote-total-section">
        <div class="quote-calc-row">
          <span>Tổng phụ thu (Subtotal):</span>
          <span id="qb-subtotal-inject" class="tmono">0 ₫</span>
        </div>
        <div class="quote-calc-row">
          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
            <input type="checkbox" id="qb-vat-toggle" checked /> Cộng thuế VAT (10%):
          </label>
          <span id="qb-tax-inject" class="tmono">0 ₫</span>
        </div>
        <div class="quote-calc-row" style="font-size:15px; color:var(--b600); border-top:1px solid var(--bd); padding-top:6px;">
          <span>Tổng tiền tất cả:</span>
          <span id="qb-total-inject" class="tmono">0 ₫</span>
        </div>
      </div>

      <div class="fg" style="margin-top:12px;">
        <label>Các điều khoản quy phạm kèm theo</label>
        <textarea id="qb-terms-conditions" rows="2">Báo giá chưa bao gồm phí triển khai ngoài phạm vi nội thành. Hỗ trợ sự cố kỹ thuật 24/7 trong 12 tháng kể từ ngày ký biên bản bàn giao thành công.</textarea>
      </div>
    </form>
  `;
}

/* ==========================================================================
   8. CLIENTS - CONTACTS & COMPANIES VIEWS
   ========================================================================== */

export function renderCustomersPage(activeSubTab = 'b2b') {
  return `
    <div class="page-container animate-fadeIn">
      <!-- Title & Tabs -->
      <div class="panel" style="padding: 14px 18px; margin-bottom: 12px; border-left: 4px solid var(--b500);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <h2 style="font-family:var(--fd); font-size:16px; font-weight:800; color:var(--n800);"><i class="fa-solid fa-address-book text-indigo-500"></i> Quản lý Mạng lưới Khách Hàng (B2B & B2C)</h2>
            <p style="font-size:12px; color:var(--n500); margin-top:2px;">Cơ sở dữ liệu thống nhất về các Doanh nghiệp đối tác (B2B) và các Liên hệ cá nhân / Đại diện mua hàng (B2C).</p>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn ${activeSubTab === 'b2b' ? 'pr' : 'bl'} xs" id="cust-tab-b2b-btn" style="font-weight:700;"><i class="fa-solid fa-building"></i> Doanh Nghiệp B2B (${COMPANIES_DB.length})</button>
            <button class="btn ${activeSubTab === 'b2c' ? 'pr' : 'bl'} xs" id="cust-tab-b2c-btn" style="font-weight:700;"><i class="fa-solid fa-user-group"></i> Cá Nhân B2C (${CONTACTS_DB.length})</button>
          </div>
        </div>
      </div>

      <!-- Action panel based on tab -->
      <div class="panel" style="padding: 12px 16px; margin-bottom: 12px; background-color:var(--n25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div style="font-size:12px; color:var(--n600);">
          ${activeSubTab === 'b2b' 
            ? 'Danh sách pháp nhân kết nối, phân khúc quy mô và doanh thu đóng góp thực tế.'
            : 'Đầu mối liên hệ trực tiếp, chức danh tác nghiệp và các thẻ phân loại khách hàng.'
          }
        </div>
        ${activeSubTab === 'b2b'
          ? `<button class="btn pr xs" id="companies-toggle-creator-trigger-btn"><i class="fa-solid fa-circle-plus"></i> Thêm Doanh Nghiệp B2B</button>`
          : `<button class="btn pr xs" id="contacts-toggle-creator-trigger-btn"><i class="fa-solid fa-circle-plus"></i> Thêm Liên Hệ Mới (B2C)</button>`
        }
      </div>

      <div class="panel" style="padding:0; overflow-x:auto;">
        ${activeSubTab === 'b2b' ? `
          <!-- B2B Companies list -->
          <table class="tw">
            <thead>
              <tr>
                <th>Tên Doanh Nghiệp</th>
                <th>Lĩnh vực</th>
                <th>Quy mô</th>
                <th>Điện thoại</th>
                <th>Website</th>
                <th style="text-align:right;">Doanh số đóng góp</th>
                <th style="text-align:center;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${COMPANIES_DB.map(cmp => `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="av xs" style="background-color:var(--b100); color:var(--b600);"><i class="fa-solid fa-building"></i></div>
                      <div>
                        <span class="cell-bold">${esc(cmp.name)}</span>
                        <div style="font-size:10px; color:var(--n400); margin-top:1px;">ID: ${cmp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="chip bl font-bold" style="font-size:10px;">${esc(cmp.industry)}</span></td>
                  <td><span class="chip pu font-bold" style="font-size:10px;">${esc(cmp.size)}</span></td>
                  <td class="tmono">${cmp.phone}</td>
                  <td class="tmono">
                    <a href="${esc(cmp.website)}" target="_blank" style="color:var(--b600); text-decoration:none;"><i class="fa-solid fa-globe"></i> Visit Site</a>
                  </td>
                  <td class="tmono cell-bold text-emerald-600" style="text-align:right;">${fmtVND(cmp.revenue || 0)}</td>
                  <td style="text-align:center;">
                    <div style="display:inline-flex; gap:6px;">
                      <button class="btn bl icon-only" onclick="window.crmApp.openCompanyDetailModal('${cmp.id}')" title="Xem chi tiết"><i class="fa-solid fa-eye"></i></button>
                      <button class="btn rd icon-only" onclick="window.crmApp.deleteCompanyDirect('${cmp.id}')" title="Xóa bỏ"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <!-- B2C/Reps Contacts List -->
          <table class="tw">
            <thead>
              <tr>
                <th>Khách hàng / Đại diện</th>
                <th>Chức danh</th>
                <th>Doanh nghiệp liên kết</th>
                <th>Điện thoại</th>
                <th>Địa chỉ Email</th>
                <th>Nhóm</th>
                <th style="text-align:center;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${CONTACTS_DB.map(con => {
                const tagColor = con.tags === 'VIP' ? 'rd' : con.tags === 'Nợ xấu' ? 'am' : con.tags === 'Doanh nghiệp' ? 'bl' : 'gr';
                return `
                  <tr>
                    <td>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div class="av sm" style="background-color:var(--p100); color:var(--p600); font-weight:700;">${con.fullName?.substring(0,2) || 'KH'}</div>
                        <div>
                          <span class="cell-bold">${esc(con.fullName)}</span>
                          <div style="font-size:10px; color:var(--n400); margin-top:1px;">Nguồn: ${esc(con.source || 'Direct')}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="chip pu font-bold" style="font-size:10px;">${esc(con.title)}</span></td>
                    <td><span class="cell-bold" style="color:var(--n700);"><i class="fa-solid fa-building text-slate-400" style="margin-right:4px;"></i>${esc(con.companyName)}</span></td>
                    <td class="tmono">${con.phone}</td>
                    <td class="tmono">${esc(con.email)}</td>
                    <td><span class="chip ${tagColor} font-bold" style="font-size:10px;"><i class="fa-solid fa-tag"></i> ${esc(con.tags || 'Khách mới')}</span></td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:6px;">
                        <button class="btn bl icon-only" onclick="window.crmApp.openContactEdit('${con.id}')" title="Sửa hồ sơ"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn rd icon-only" onclick="window.crmApp.deleteContact('${con.id}')" title="Xóa bỏ"><i class="fa-solid fa-trash-can"></i></button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}
      </div>
    </div>
  `;
}

export function renderProductsPage(productsList) {
  return `
    <div class="page-container animate-fadeIn">
      <div class="panel" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:12px; border-left: 4px solid var(--orange);">
        <div>
          <h2 style="font-family:var(--fd); font-size:16px; font-weight:800; color:var(--n800);"><i class="fa-solid fa-boxes-stacked text-amber-500"></i> Danh Mục Giải Pháp & Sản Phẩm Aura</h2>
          <p style="font-size:12px; color:var(--n500); margin-top:2px;">Danh sách bản quyền phần mềm SaaS, dịch vụ tư vấn chuyển đổi số, triển khai tích hợp và thiết bị phần cứng.</p>
        </div>
        <button class="btn pr xs" id="products-toggle-creator-trigger-btn"><i class="fa-solid fa-circle-plus"></i> Thêm Sản Phẩm Mới</button>
      </div>

      <!-- Bento Product Cards Grid -->
      <div class="db-grid-3x" style="gap:14px; margin-bottom:12px;">
        ${productsList.map(p => `
          <div class="panel" style="display:flex; flex-direction:column; gap:8px; border-top: 4px solid ${p.category === 'Service' ? 'var(--teal)' : p.category === 'Hardware' ? 'var(--amber)' : p.category === 'Consult' ? 'var(--purple)' : 'var(--b500)'}; padding: 16px; position:relative; min-height: 250px;">
            <div style="position:absolute; top:12px; right:12px;">
              <span class="chip ${p.status === 'active' ? 'gr' : 'rd'} font-bold select-none uppercase font-sans" style="font-size:8.5px;">${p.status === 'active' ? 'Đang bán' : 'Tạm ngưng'}</span>
            </div>
            
            <div style="font-size:26px; margin-bottom:2px;">${p.emoji || '📦'}</div>
            
            <div style="font-size:9px; font-weight:700; color:var(--n400); text-transform:uppercase; font-family:'JetBrains Mono', monospace;">Mã SKU: ${esc(p.code)}</div>
            <h4 style="font-family:var(--fd); font-size:13.5px; font-weight:800; color:var(--n900); line-height:1.3; margin: 2px 0; min-height: 36px;">${esc(p.name)}</h4>
            
            <div style="display:flex; justify-content:space-between; align-items:center; background-color:var(--n25); padding:4px 8px; border-radius:var(--rs); margin: 2px 0; font-size:11.5px;">
              <span style="color:var(--n400);">Nhóm sản phẩm:</span>
              <span class="chip bl font-bold" style="font-size:9px;">${esc(p.category)}</span>
            </div>

            <p style="font-size:11.5px; color:var(--n500); line-height:1.4; min-height: 32px; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; overflow:hidden;">
              ${esc(p.description)}
            </p>

            <!-- Price and stock level -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; border-top:1px dashed var(--bd); padding-top:8px;">
              <div>
                <span style="font-size:9px; font-weight:700; color:var(--n400); text-transform:uppercase; display:block;">Đơn giá tiêu chuẩn</span>
                <span style="font-size:13.5px; font-weight:800; color:var(--green); font-family:'JetBrains Mono', monospace;">${fmtVND(p.price)}</span>
              </div>
              <div style="text-align:right;">
                <span style="font-size:9px; font-weight:700; color:var(--n400); text-transform:uppercase; display:block;">Kho / Đơn vị</span>
                <span style="font-weight:700; font-size:11.5px; color:var(--n700);">${p.stock} ${esc(p.unit || 'Gói')}</span>
              </div>
            </div>

            <div style="display:flex; gap:6px; margin-top:8px; padding-top:4px;">
              <button class="btn bl xs" onclick="window.crmApp.openProductDetailModal('${p.id}')" style="flex:1; font-weight:700; font-size:11px; padding: 4px 8px;"><i class="fa-solid fa-edit"></i> Điều chỉnh</button>
              <button class="btn rd icon-only sm" onclick="window.crmApp.deleteProductDirect('${p.id}')" title="Xóa bỏ" style="width:28px; height:28px;"><i class="fa-solid fa-trash-can"></i></button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   9. INTERACTIVE LIVE CC CHAT / TICKETING SUPPORT
   ========================================================================== */

export function renderTicketsPage(ticketsList) {
  return `
    <div class="page-container animate-fadeIn">
      <div class="filter-bar" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700;"><i class="fa-solid fa-headset text-teal"></i> Hàng trực xử lý SLA hỗ trợ kỹ thuật</h3>
        <button class="btn pr" id="support-tickets-new-creator-trigger"><i class="fa-solid fa-circle-plus"></i> Khởi tạo Ticket</button>
      </div>

      <div class="panel" style="padding:0;">
        <table class="tw">
          <thead>
            <tr>
              <th>Mã Ticket</th>
              <th>Chủ đề sự cố</th>
              <th>Người yêu cầu</th>
              <th>Mức độ khẩn</th>
              <th>Trạng thái</th>
              <th>Kênh</th>
              <th>Hạn xử lý SLA</th>
              <th style="text-align:center;">Hành động</th>
            </tr>
          </thead>
          <tbody>
            ${ticketsList.map(tk => {
              const priorityMap = {
                Critical: 'chip rd',
                High: 'chip am',
                Medium: 'chip bl',
                Low: 'chip gy'
              };
              
              return `
                <tr>
                  <td class="tmono cell-bold text-primary-600">${tk.number}</td>
                  <td><span class="cell-bold">${esc(tk.subject)}</span></td>
                  <td>${esc(tk.contactName)}</td>
                  <td><span class="${priorityMap[tk.priority] || 'chip bl'}">${tk.priority}</span></td>
                  <td><span class="chip uppercase ${tk.status==='open'?'rd':'gr'}">${tk.status}</span></td>
                  <td><span class="chip bl">${tk.channel}</span></td>
                  <td class="tmono cell-bold text-slate-700">${tk.slaHours} Giờ</td>
                  <td style="text-align:center;">
                    <button class="btn bl" onclick="window.crmApp.openTicketDetail('${tk.id}')"><i class="fa-solid fa-reply"></i> Đàm thoại</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function drawTicketMessageThread(ticket) {
  let threadHtml = ticket.messages.map(msg => {
    const isAgent = msg.sender === 'agent';
    return `
      <div class="message ${isAgent ? 'agent' : 'customer'}">
        <div class="msg-bubble">
          <p style="font-size:11px; font-weight:700; opacity:0.8; margin-bottom:4px;">${isAgent ? 'CHUYÊN VIÊN SUPPORT AURA' : 'KHÁCH HÀNG'}</p>
          <span>${esc(msg.text)}</span>
          <p style="font-size:9px; text-align:right; margin-top:2px; opacity:0.6; font-family:var(--fm);">${msg.time}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:16px;">
      <div class="panel" style="background-color:var(--n50); border:1px solid var(--bd);">
        <p style="font-size:12px; font-weight:700; color:var(--n600);"><i class="fa-solid fa-circle-exclamation text-amber-500"></i> Chủ đề sự cố gốc: <strong class="text-indigo-600">${esc(ticket.subject)}</strong></p>
        <div style="display:flex; gap:16px; font-size:11px; color:var(--n500); margin-top:4px;">
          <span>Đại diện gửi: ${esc(ticket.contactName)}</span>
          <span>SLA cam kết xử lý: ${ticket.slaHours} Giờ</span>
        </div>
      </div>

      <div class="ticket-thread" id="live-ticket-scroller-box">
        ${threadHtml}
      </div>

      <div class="reply-box">
        <div style="display:flex; justify-content:space-between; items:center; font-size:11px; font-weight:700; color:var(--n500);">
          <span>Nhập nội dung phản hồi kỹ thuật:</span>
          <div>
            Phản hồi nhanh (Canned): 
            <select id="support-sc-canned-selector" style="font-size:10px; padding:2px; border-radius:4px;" onchange="window.crmApp.applyCannedResponseToBox()">
              <option value="">Chọn mẫu nhanh...</option>
              <option value="Dạ em đã ghi nhận sự cố, em xin chuyển sang bộ phận kĩ thuật để giải quyết ngay ạ.">Xác nhận sự cố bàn giao</option>
              <option value="Cảm ơn quý đối tác, lỗi sự cố đã được đồng bộ hóa thành công trên máy chủ.">Báo cáo xử lý thành công</option>
              <option value="Dạ mẫu thử nghiệm của quý anh/chị đã kết thúc hạn kỳ, vui lòng gia hạn để tiếp tục.">Cảnh báo gia hạn dịch vụ</option>
            </select>
          </div>
        </div>
        <textarea id="support-reply-textarea-editor" rows="3" placeholder="Nhập câu trả lời chính thức của chuyên viên dịch vụ kỹ thuật..." style="padding:10px; border-radius:var(--rs); border:1px solid var(--bd); font-size:12px; resize:none; outline:none;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:4px;">
          <button type="button" class="btn pr" id="support-submit-msg-bttn" style="padding:8px 24px; font-weight:700;" onclick="window.crmApp.submitAgentResponseToTicket('${ticket.id}')">Gửi phản hồi <i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   10. ROLE-BASED ACCESS CONTROLS (RBAC) MATRIX & SETTINGS
   ========================================================================== */

export function renderUsersPermissionsPage() {
  return `
    <div class="page-container animate-fadeIn">
      <div class="tabbar">
        <div class="tab active">Tài Khoản Nhân Sự (${USERS_DB.length})</div>
      </div>

      <div class="panel" style="padding:0; overflow-x:auto;">
        <table class="tw">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Email tác nghiệp</th>
              <th>Phòng ban bộ môn</th>
              <th>Vai trò phục vụ trên hệ thống</th>
              <th>Trạng thái tài khoản</th>
              <th style="text-align:center;">Kích hoạt / Hủy quyền</th>
            </tr>
          </thead>
          <tbody>
            ${USERS_DB.map(usr => {
              let rbBadge = usr.role === 'superadmin' ? 'chip rd' : usr.role === 'manager' ? 'chip pu' : usr.role === 'support' ? 'chip tl' : 'chip bl';
              return `
                <tr>
                  <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="av sm" style="background:${usr.color || 'var(--grad)'}">${usr.initials}</div>
                      <span class="cell-bold">${esc(usr.name)}</span>
                    </div>
                  </td>
                  <td class="tmono">${esc(usr.email)}</td>
                  <td><span class="chip bl font-bold">${esc(usr.dept)}</span></td>
                  <td><span class="${rbBadge} font-bold uppercase" style="font-size:10px;">${usr.role}</span></td>
                  <td>
                    <span class="chip ${usr.status==='active'?'gr':'gy'}">${usr.status==='active'?'ĐANG HOẠT ĐỘNG':'ĐÃ KHÓA'}</span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:flex; justify-content:center; gap:6px;">
                      <button class="btn ${usr.status==='active'?'rd':'gr'} sm" onclick="window.crmApp.toggleUserStatus('${usr.id}')">
                        ${usr.status==='active' ? '<i class="fa-solid fa-lock"></i> Khóa account' : '<i class="fa-solid fa-lock-open"></i> Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Live RBAC permission matrix visual grid -->
      <div class="panel">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px; border-bottom:1px solid var(--bd); padding-bottom:8px;"><i class="fa-solid fa-network-wired text-indigo-500"></i> Ma Trận Phân Quyền Vai Trò Người Dùng (Role-Based Access Matrix)</h3>
        <table class="tw">
          <thead>
            <tr>
              <th>Mục Module Core</th>
              <th>Super Admin 👑</th>
              <th>Sales Manager 📊</th>
              <th>Sales Rep 💼</th>
              <th>Support Agent 🎧</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="cell-bold">Quyền truy cập toàn hệ thống (All Records)</td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px;">Toàn quyền hệ thống</span></td>
              <td><span class="chip pu uppercase font-bold" style="font-size:9px;">Toàn quyền phân phối</span></td>
              <td><span class="chip gy uppercase font-bold" style="font-size:9px;">Chỉ quản lý cá nhân</span></td>
              <td><span class="chip gy uppercase font-bold" style="font-size:9px;">Chỉ xem tickets</span></td>
            </tr>
            <tr>
              <td class="cell-bold">Xác nhận đơn hàng và báo giá chi chiết</td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px;">Toàn quyền</span></td>
              <td><span class="chip pu uppercase font-bold" style="font-size:9px;">Toàn quyền phê duyệt</span></td>
              <td><span class="chip gy uppercase font-bold" style="font-size:9px;">Chỉ gửi nháp</span></td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px; background-color:#fee2e2; color:#ef4444;">KHÔNG CÓ QUYỀN</span></td>
            </tr>
            <tr>
              <td class="cell-bold">Thay thế & Khóa tài khoản nhân viên (Users)</td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px;">Có toàn quyền</span></td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px; background-color:#fee2e2; color:#ef4444;">KHÔNG CÓ QUYỀN</span></td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px; background-color:#fee2e2; color:#ef4444;">KHÔNG CÓ QUYỀN</span></td>
              <td><span class="chip rd uppercase font-bold" style="font-size:9px; background-color:#fee2e2; color:#ef4444;">KHÔNG CÓ QUYỀN</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderSystemSettingsPage() {
  return `
    <div class="page-container animate-fadeIn">
      <div class="panel">
        <h3 style="font-family:var(--fd); font-size:15px; font-weight:700; margin-bottom:14px; border-bottom:1px solid var(--bd); padding-bottom:8px;"><i class="fa-solid fa-sliders text-indigo-500"></i> Cấu Hình Doanh Nghiệp & Tích Hợp (Aura ERP System Config)</h3>
        
        <div class="fr2">
          <div class="fg">
            <label>Tên Thương hiệu Doanh nghiệp</label>
            <input type="text" id="set-company-name" value="Aura Technology Systems JSC" />
          </div>
          <div class="fg">
            <label>Địa chỉ Trụ sở chính công sở</label>
            <input type="text" id="set-company-address" value="Số 88 Nút Giao Nguyễn Huệ, Quận 1, TPHCM" />
          </div>
        </div>

        <div style="margin-top:16px;">
          <h4 style="font-family:var(--fd); font-size:12px; font-weight:700; color:var(--n500); text-transform:uppercase; margin-bottom:12px;">Bảo mật & Quy chuẩn Mật khẩu</h4>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; cursor:pointer;" class="mb-12">
            <input type="checkbox" id="set-mfa-req" checked /> Bắt buộc thiết lập Xác thực 2 bước (2-Factor Authentication - 2FA) cho tất cả tài khoản
          </label>
          <label style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; cursor:pointer;">
            <input type="checkbox" id="set-failed-lock" checked /> Tự động khóa tài khoản sau 5 lần nhập sai mã khóa OTP hoặc mật khẩu liên tiếp
          </label>
        </div>

        <!-- System feature flags grid toggles -->
        <div style="margin-top:24px; border-top:1px solid var(--bd); padding-top:16px;">
          <h4 style="font-family:var(--fd); font-size:13px; font-weight:700; color:var(--n700); margin-bottom:12px;"><i class="fa-solid fa-toggle-on text-emerald-500"></i> Bảng quản trị Bơm Đột Phá Tính Năng (Feature Flags)</h4>
          <div class="fr2" style="gap:16px; font-size:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:var(--rs); border:1px solid var(--bd); background-color:white;">
              <div>
                <strong>🤖 AI Chatbot Gemini Assistant</strong>
                <p style="font-size:10px; color:var(--n400); margin-top:2px;">Trợ lý thông minh viết email tự động.</p>
              </div>
              <input type="checkbox" checked style="width:20px; height:20px; cursor:pointer;" />
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:var(--rs); border:1px solid var(--bd); background-color:white;">
              <div>
                <strong>📞 Tích hợp Cổng thoại Call Center IP</strong>
                <p style="font-size:10px; color:var(--n400); margin-top:2px;">Nháy phím để kết nối quay thoại trực tiếp.</p>
              </div>
              <input type="checkbox" checked style="width:20px; height:20px; cursor:pointer;" />
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:var(--rs); border:1px solid var(--bd); background-color:white;">
              <div>
                <strong>📩 SMS Brandname Tự động hóa</strong>
                <p style="font-size:10px; color:var(--n400); margin-top:2px;">Gửi tin chăm sóc khi đến kỳ thu nợ.</p>
              </div>
              <input type="checkbox" style="width:20px; height:20px; cursor:pointer;" />
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-radius:var(--rs); border:1px solid var(--bd); background-color:white;">
              <div>
                <strong>📊 Biểu đồ Dự Báo Trend Trí tuệ AI</strong>
                <p style="font-size:10px; color:var(--n400); margin-top:2px;">Ghim báo cáo dòng tiền chuẩn xác 90 ngày.</p>
              </div>
              <input type="checkbox" checked style="width:20px; height:20px; cursor:pointer;" />
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:24px; border-top:1px solid var(--bd); padding-top:16px;">
          <button class="btn bl" onclick="toast('Đóng bảng thiết đặt và thoát!', 'info')">Thoát</button>
          <button class="btn pr" onclick="toast('Đã ghi nhận lưu trữ cấu hình hệ thống!', 'success')"><i class="fa-solid fa-save"></i> Lưu Trực Tiếp</button>
        </div>
      </div>
    </div>
  `;
}

export function renderReportsPage(filterState = { range: '12', repId: 'all', growthExpect: 15 }) {
  const rangeLimit = parseInt(filterState.range) || 12;
  const filteredData = REVENUE_DATA.slice(-rangeLimit);

  // Totals calculations
  const totalRevenue = filteredData.reduce((sum, d) => sum + d.revenue, 0);
  const totalDeals = filteredData.reduce((sum, d) => sum + d.wonDeals, 0);
  const avgDealValue = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0;
  
  // High point month
  const maxMonthObj = filteredData.reduce((max, d) => d.revenue > max.revenue ? d : max, filteredData[0] || { month: 'Chưa có', revenue: 0 });

  const reps = USERS_DB.filter(u => u.role === 'sales');
  
  // Future estimations
  const nextMonths = ['T6/26', 'T7/26', 'T8/26'];
  const baseAvgRevenue = Math.round(totalRevenue / filteredData.length);
  const expectedRate = (100 + Number(filterState.growthExpect || 15)) / 100;

  return `
    <div class="page-container animate-fadeIn">
      <!-- Top banner for Reporting Module -->
      <div class="panel" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:16px; border-left: 4px solid var(--b500);">
        <div>
          <h2 style="font-family:var(--fd); font-size:18px; font-weight:800; color:var(--n800);"><i class="fa-solid fa-chart-pie text-blue-600"></i> Phòng Nghiệp Vụ Báo Cáo & Phân Tích Kinh Doanh</h2>
          <p style="font-size:12.5px; color:var(--n500); margin-top:3px;">Báo cáo tổng hợp số liệu thực tế, tỷ lệ biến thiên doanh thu, và mô phỏng dự báo kế hoạch đại lý.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn bl xs" id="rpt-refresh-btn"><i class="fa-solid fa-arrows-rotate"></i> Làm mới nguồn</button>
          <button class="btn pr xs" id="rpt-export-excel-btn"><i class="fa-solid fa-file-excel"></i> Xuất Báo Cáo XLSX</button>
        </div>
      </div>

      <!-- Filters & state controllers -->
      <div class="panel" style="margin-bottom:16px; padding:16px; background-color:var(--n25);">
        <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end;">
          <div class="fg" style="margin:0; flex:1; min-width:180px;">
            <label style="font-size:11px; font-weight:700; color:var(--n600); margin-bottom:6px; display:block;">Kỳ phân tích báo cáo</label>
            <select id="rpt-filter-range" style="padding:7px 10px; font-size:13px; font-weight:600; width:100%; border-radius: var(--rs); border: 1px solid var(--bd);">
              <option value="3" ${filterState.range === '3' ? 'selected' : ''}>3 tháng gần đây</option>
              <option value="6" ${filterState.range === '6' ? 'selected' : ''}>6 tháng gần đây</option>
              <option value="12" ${filterState.range === '12' ? 'selected' : ''}>12 tháng (Toàn bộ dữ liệu)</option>
            </select>
          </div>
          <div class="fg" style="margin:0; flex:1; min-width:180px;">
            <label style="font-size:11px; font-weight:700; color:var(--n600); margin-bottom:6px; display:block;">Bộ lọc Chiến binh Rep</label>
            <select id="rpt-filter-rep" style="padding:7px 10px; font-size:13px; font-weight:600; width:100%; border-radius: var(--rs); border: 1px solid var(--bd);">
              <option value="all" ${filterState.repId === 'all' ? 'selected' : ''}>Tất cả Sales Reps</option>
              ${reps.map(u => `<option value="${u.id}" ${filterState.repId === u.id ? 'selected' : ''}>${esc(u.name)} (${esc(u.dept)})</option>`).join('')}
            </select>
          </div>
          <div class="fg" style="margin:0; width:150px;">
            <label style="font-size:11px; font-weight:700; color:var(--n600); margin-bottom:6px; display:block;">% Tăng trưởng mô phỏng</label>
            <input type="number" id="rpt-growth-expect" min="1" max="100" value="${filterState.growthExpect || 15}" style="padding:6px 10px; font-size:13px; font-weight:700; text-align:center; width:100%; border-radius: var(--rs); border: 1px solid var(--bd);" />
          </div>
          <div>
            <button class="btn pr" id="rpt-submit-filter-btn" style="height:35px; min-width:110px; font-weight:700;"><i class="fa-solid fa-filter"></i> Áp dụng bộ lọc</button>
          </div>
        </div>
      </div>

      <!-- KPI statistics for reports -->
      <div class="krow" style="margin-bottom:16px;">
        <div class="kc b" style="flex:1;">
          <span class="kc-title"> Doanh Thu Kỳ Phân Tích</span>
          <span class="kc-val">${fmtVND(totalRevenue)}</span>
          <span class="kc-sub">Tổng số tiền thực thu quyết toán</span>
        </div>
        <div class="kc p" style="flex:1;">
          <span class="kc-title"> Tổng Số Hợp Đồng Thắng</span>
          <span class="kc-val">${totalDeals} Deals chốt</span>
          <span class="kc-sub">Trung bình ${(totalDeals / rangeLimit).toFixed(1)} hợp đồng/tháng</span>
        </div>
        <div class="kc g" style="flex:1;">
          <span class="kc-title"> Giá trị TB một Deal</span>
          <span class="kc-val">${fmtVND(avgDealValue)}</span>
          <span class="kc-sub">Mức đầu tư thực tế bình quân</span>
        </div>
        <div class="kc a" style="flex:1;">
          <span class="kc-title"> Doanh Thu Cao Điểm nhất</span>
          <span class="kc-val">${maxMonthObj ? fmtVND(maxMonthObj.revenue) : '0 ₫'}</span>
          <span class="kc-sub">Đạt được vào tháng: <strong>${maxMonthObj ? maxMonthObj.month : 'Chưa có'}</strong></span>
        </div>
      </div>

      <!-- Diagrams Column Grid -->
      <div class="db-grid-2x" style="margin-bottom:16px;">
        <div class="panel" style="display:flex; flex-direction:column; gap:12px; height:340px;">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; color:var(--b600);"><i class="fa-solid fa-chart-simple"></i> Biểu đồ Phân tích Doanh Thu Kỳ Lọc</h3>
          <div style="font-size:11px; color:var(--n400); margin-top:-6px;">Doanh số biểu đạt trực quan tại ERP (Đơn vị triệu đồng)</div>
          <div id="rpt-bar-chart-container" class="chart-container-svg" style="flex:1; width:100%; height:100%; min-height: 180px;"></div>
        </div>

        <div class="panel" style="display:flex; flex-direction:column; gap:12px; height:340px;">
          <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; color:var(--b600);"><i class="fa-solid fa-bullseye text-amber-500"></i> Mô phỏng & Dự báo xu hướng Doanh số (3 tháng tiếp theo)</h3>
          <div style="font-size:11px; color:var(--n400); margin-top:-6px;">Giả định với mục tiêu tăng trưởng dự thảo đề xuất là <span style="font-weight:700; color:var(--amber);">${filterState.growthExpect || 15}%</span> hàng tháng</div>
          
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:12px;">
            ${nextMonths.map((m, index) => {
              const forecastedRevenue = Math.round(baseAvgRevenue * Math.pow(expectedRate, index + 1));
              return `
                <div style="background-color:var(--n25); border:1px dashed var(--bd); border-radius:var(--rs); padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-size:9.5px; color:var(--n400); font-weight:700; text-transform:uppercase;">Tháng dự toán</span>
                    <p style="font-size:14.5px; font-weight:800; color:var(--n800);">${m}</p>
                  </div>
                  <div style="text-align:right;">
                    <span style="font-size:9.5px; color:var(--n400); font-weight:700; text-transform:uppercase;">Doanh thu dự báo (+${filterState.growthExpect}%)</span>
                    <p style="font-size:14.5px; font-weight:800; color:var(--green); font-family:'JetBrains Mono', monospace;">${fmtVND(forecastedRevenue)}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top:auto; font-size:11.5px; background-color:#eff6ff; border-left:4px solid var(--b500); padding:10px; border-radius:0 var(--rs) var(--rs) 0; color:var(--b700); line-height:1.4;">
            <i class="fa-solid fa-circle-info text-blue-600"></i> <strong>Khuyến nghị từ cố vấn Aura AI:</strong> Để đạt mức tăng trưởng kỳ vọng này, bộ phận kinh doanh Aura cần huy động thêm ít nhất 24 lead mới hàng tháng, đồng thời rút ngắn chu kỳ từ xuất đề xuất (Proposal) đến thương lượng chốt ký.
          </div>
        </div>
      </div>

      <!-- Financial Period Analytics Table -->
      <div class="panel">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:700; margin-bottom:12px; border-bottom:1px solid var(--bd); padding-bottom:8px;"><i class="fa-solid fa-list-check text-blue-600"></i> Bảng cấu trúc chi tiết lịch đại kiểm toán theo giai đoạn</h3>
        <table class="tw">
          <thead>
            <tr>
              <th>Tháng thời kỳ</th>
              <th style="text-align:right;">Doanh thu đạt được</th>
              <th style="text-align:right;">Hợp đồng thắng kỳ trước</th>
              <th style="text-align:right;">Doanh số bình quân / Deal chốt</th>
              <th>Đánh giá trạng thái thực tế</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(d => {
              const statusLabel = d.revenue >= 1700000000 
                ? '<span class="chip g uppercase font-bold" style="font-size:9px;">Vượt chỉ tiêu</span>' 
                : d.revenue >= 1200000000 
                ? '<span class="chip bl uppercase font-bold" style="font-size:9px;">Đạt mục tiêu</span>' 
                : '<span class="chip r uppercase font-bold" style="font-size:9px;">Cần nỗ lực bổ sung</span>';
              return `
                <tr>
                  <td class="cell-bold">${d.month}</td>
                  <td style="text-align:right;" class="tmono font-bold text-slate-800">${fmtVND(d.revenue)}</td>
                  <td style="text-align:right;" class="tmono">${d.wonDeals} deals thắng</td>
                  <td style="text-align:right;" class="tmono text-emerald-600 font-bold">${fmtVND(Math.round(d.revenue / d.wonDeals))} / deal</td>
                  <td>${statusLabel}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

