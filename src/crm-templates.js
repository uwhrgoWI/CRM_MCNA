// Enterprise CRM Pro - Dynamic Web UI Page Templates
'use strict';

import {
  USERS_DB, COMPANIES_DB, CONTACTS_DB, LEADS_DB, DEALS_DB, TASKS_DB,
  ACTIVITIES_DB, QUOTES_DB, PRODUCTS_DB, TICKETS_DB, INVOICES_DB, REVENUE_DATA, AUDIT_LOG_DB, CALL_LOGS_DB
} from './crm-database.js';

import { svgBarChart, svgLineChart, svgDonut, svgFunnel, svgSparkline } from './crm-charts.js';

// Deterministic privacy masks for customer contact channels (B2C policy):
// no more random hiding - both channels are masked the same way everywhere,
// and only authorized roles can reveal them (with an audit trail).
export const maskPhone = (p) => {
  const s = String(p || '');
  if (s.length < 5) return '•••••';
  return s.slice(0, 3) + '•••••' + s.slice(-2);
};
export const maskEmail = (e) => {
  const s = String(e || '');
  const at = s.indexOf('@');
  if (at < 1) return '•••@•••';
  const user = s.slice(0, at);
  return (user.length <= 2 ? user[0] + '•' : user.slice(0, 2) + '•••') + s.slice(at);
};

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
            <span class="brand-title">MCNA CRM VN</span>
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

export function renderUnifiedPipelineHeader(currentStep) {
  // Compute metrics dynamically from the active databases
  const leadsCount = LEADS_DB.length;
  const dealsCount = DEALS_DB.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
  const quotesCount = QUOTES_DB.length;
  const invoicesCount = INVOICES_DB.filter(i => i.status === 'pending').length;
  const tasksCount = TASKS_DB.filter(t => !t.completed).length + TICKETS_DB.filter(tk => tk.status === 'open' || tk.status === 'pending').length;

  const steps = [
    { id: 'leads', pageId: 'leads', label: '1. Tiếp Nhận Leads', desc: 'Định Tuyến & Gán SĐT [T1-T2]', count: leadsCount, icon: 'fa-filter', color: '#6366f1' },
    { id: 'deals', pageId: 'pipeline', label: '2. Đàm Phán Deals', desc: 'Pipeline Sơ Đồ Kanban [T3]', count: dealsCount, icon: 'fa-comments-dollar', color: '#0ea5e9' },
    { id: 'quotes', pageId: 'quotes', label: '3. Đăng Ký Báo Giá', desc: 'Bản Đề Xuất Giải Pháp', count: quotesCount, icon: 'fa-file-invoice-dollar', color: '#f59e0b' },
    { id: 'invoices', pageId: 'invoices', label: '4. Kết Toán Hóa Đơn', desc: 'Có Đối Soát Webhook [T4]', count: invoicesCount, icon: 'fa-file-invoice', color: '#10b981' },
    { id: 'tasks', pageId: 'tasks', label: '5. Vận Hành & SLA', desc: 'Triển Khai & Chăm Sóc [T5]', count: tasksCount, icon: 'fa-list-check', color: '#ec4899' }
  ];

  let stepsHtml = '';
  steps.forEach((st, idx) => {
    const isActive = st.id === currentStep;
    const borderStyle = isActive 
      ? `border-top: 4px solid ${st.color}; background: #f8fafc; border-bottom: 2px solid ${st.color}; font-weight: bold;` 
      : `border-top: 4px solid #e2e8f0; background: #ffffff;`;
    
    const tagBg = isActive ? st.color : '#e2e8f0';
    const tagFg = isActive ? '#ffffff' : '#475569';
    const countBadge = `<span style="background:${tagBg}; color:${tagFg}; border-radius:12px; padding:2px 8px; font-size:10.5px; font-weight:800; font-family:var(--fm);">${st.count}</span>`;

    stepsHtml += `
      <div class="flow-step-col ${isActive ? 'active' : ''}" 
           onclick="window.crmApp.go('${st.pageId}')" 
           style="flex: 1; min-width: 175px; padding: 12px; cursor: pointer; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s; ${borderStyle}; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;"
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.08)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="color:${st.color}; font-size:14px;"><i class="fa-solid ${st.icon}"></i></span>
            <span style="font-weight:800; font-size:11.5px; color:${isActive ? 'var(--n900)' : 'var(--n700)'};">${st.label}</span>
          </div>
          ${countBadge}
        </div>
        <p style="font-size:10px; color:var(--n500); margin:6px 0 0 0; line-height:1.2; font-weight:500;">${st.desc}</p>
      </div>
    `;

    if (idx < steps.length - 1) {
      stepsHtml += `
        <div style="display:flex; align-items:center; justify-content:center; color:var(--n300); padding:0 4px;" class="flow-arrow-sep">
          <i class="fa-solid fa-chevron-right" style="font-size: 13px;"></i>
        </div>
      `;
    }
  });

  return `
    <div class="unified-flow-header panel animate-fadeIn" style="padding:12px 18px; margin-bottom:16px; background:#ffffff; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.04); border-left: 4px solid #4f46e5;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="background:linear-gradient(135deg, #4f46e5, #818cf8); color:white; width:22px; height:22px; display:inline-flex; align-items:center; justify-content:center; border-radius:50%; font-size:11px;">
            <i class="fa-solid fa-arrow-right-to-bracket animate-pulse"></i>
          </span>
          <span style="font-size:12.5px; font-weight:800; color:var(--n800); text-transform:uppercase; letter-spacing:0.5px;">Tiến Trình Kinh Doanh MCNA Unified Pipeline Flow</span>
        </div>
        <div style="font-size:10px; font-weight:800; color:#4f46e5; background:#e0e7ff; padding:3px 10px; border-radius:12px; text-transform: uppercase; letter-spacing: 0.5px;">
          <i class="fa-solid fa-cloud-bolt text-indigo-500"></i> Đồng bộ dòng dữ liệu thời gian thực
        </div>
      </div>
      <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;" class="flow-steps-row">
        ${stepsHtml}
      </div>
    </div>
  `;
}

export function buildSidebar(session, activePage, isCollapsed) {
  const role = session.role;
  let navHtml = '';

  // Business flow section - items are filtered by role (RBAC):
  // marketers (manager) never see quotes/invoices; support only sees SLA tickets.
  const canSeeFinance = role === 'superadmin' || role === 'sales';
  const isSupport = role === 'support';
  const flowSecHtml = `
    <div class="nav-sec">
      <p class="nav-sec-label" style="display:flex; align-items:center; gap:5px; color:#4f46e5; font-weight:800; font-size:10.5px; letter-spacing:0.5px; text-transform:uppercase;"><i class="fa-solid fa-route animate-pulse"></i> Quy Trình Kinh Doanh 5 Bước</p>
      ${!isSupport ? `
      <div class="ni ${activePage === 'leads' ? 'active' : ''}" data-page="leads">
        <span class="ni-ic" style="color:#6366f1;"><i class="fa-solid fa-filter"></i></span>
        <span class="ni-txt">1. Tiếp Nhận Leads</span>
        <span class="ni-bd r" style="background:#6366f1; font-size:9.5px; font-weight:bold;">${LEADS_DB.length}</span>
      </div>
      <div class="ni ${activePage === 'deals' || activePage === 'pipeline' ? 'active' : ''}" data-page="pipeline">
        <span class="ni-ic" style="color:#0ea5e9;"><i class="fa-solid fa-comments-dollar"></i></span>
        <span class="ni-txt">2. Đàm Phán Deals</span>
        <span class="ni-bd r" style="background:#0ea5e9; font-size:9.5px; font-weight:bold;">${DEALS_DB.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length}</span>
      </div>` : ''}
      ${canSeeFinance ? `
      <div class="ni ${activePage === 'quotes' ? 'active' : ''}" data-page="quotes">
        <span class="ni-ic" style="color:#f59e0b;"><i class="fa-solid fa-file-invoice-dollar"></i></span>
        <span class="ni-txt">3. Đăng Ký Báo Giá</span>
        <span class="ni-bd r" style="background:#f59e0b; font-size:9.5px; font-weight:bold;">${QUOTES_DB.length}</span>
      </div>
      <div class="ni ${activePage === 'invoices' ? 'active' : ''}" data-page="invoices">
        <span class="ni-ic" style="color:#10b981;"><i class="fa-solid fa-file-invoice"></i></span>
        <span class="ni-txt">4. Sổ Sách Hóa Đơn</span>
        <span class="ni-bd r" style="background:#10b981; font-size:9.5px; font-weight:bold;">${INVOICES_DB.filter(inv => inv.status === 'pending').length}</span>
      </div>` : ''}
      ${!isSupport ? `
      <div class="ni ${activePage === 'tasks' ? 'active' : ''}" data-page="tasks">
        <span class="ni-ic" style="color:#ec4899;"><i class="fa-solid fa-list-check"></i></span>
        <span class="ni-txt">5. Vận Hành Tác Vụ</span>
        <span class="ni-bd r" style="background:#ec4899; font-size:9.5px; font-weight:bold;">${TASKS_DB.filter(t => !t.completed).length}</span>
      </div>` : ''}
      <div class="ni ${activePage === 'tickets' ? 'active' : ''}" data-page="tickets">
        <span class="ni-ic" style="color:#14b8a6;"><i class="fa-solid fa-headset"></i></span>
        <span class="ni-txt">SLA Tickets Hỗ Trợ</span>
        <span class="ni-bd r" style="background:#14b8a6; font-size:9.5px; font-weight:bold;">${TICKETS_DB.filter(t => t.status === 'open').length}</span>
      </div>
      ${!isSupport ? `
      <div class="ni ${activePage === 'kpi-calls' ? 'active' : ''}" data-page="kpi-calls">
        <span class="ni-ic" style="color:#f43f5e;"><i class="fa-solid fa-phone-volume"></i></span>
        <span class="ni-txt">KPI Cuộc Gọi</span>
        <span class="ni-bd r" style="background:#f43f5e; font-size:9.5px; font-weight:bold;">${(() => { const d = new Date(); const tk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; const today = CALL_LOGS_DB.filter(c => c.dateKey === tk); return role === 'sales' ? today.filter(c => c.repId === session.id).length : today.length; })()}</span>
      </div>` : ''}
    </div>
  `;

  // Super Admin Sidebar Navigation
  if (role === 'superadmin') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Tổng quan</p>
        <div class="ni ${activePage === 'dashboard-superadmin' ? 'active' : ''}" data-page="dashboard-superadmin">
          <span class="ni-ic"><i class="fa-solid fa-chart-line"></i></span>
          <span class="ni-txt">Bảng Điều Khiển</span>
        </div>
        <div class="ni ${activePage === 'mcna-funnel' ? 'active' : ''}" data-page="mcna-funnel">
          <span class="ni-ic"><i class="fa-solid fa-diagram-project text-purple-500"></i></span>
          <span class="ni-txt font-semibold" style="color: #6366f1;">Phễu 5 Tầng MCNA</span>
          <span class="ni-bd r" style="background:var(--p500); font-size:9px; padding:1px 3px;">LIVE Sim</span>
        </div>
        <div class="ni ${activePage === 'reports' ? 'active' : ''}" data-page="reports">
          <span class="ni-ic"><i class="fa-solid fa-paste"></i></span>
          <span class="ni-txt">Báo Cáo & Phân Tích</span>
        </div>
      </div>
      
      ${flowSecHtml}
      
      <div class="nav-sec">
        <p class="nav-sec-label">Dữ liệu & Bổ trợ</p>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
        <div class="ni ${activePage === 'products' ? 'active' : ''}" data-page="products">
          <span class="ni-ic"><i class="fa-solid fa-boxes-stacked"></i></span>
          <span class="ni-txt">Mã Hàng Sản Phẩm</span>
        </div>
        <div class="ni ${activePage === 'sales-toolkit' ? 'active' : ''}" data-page="sales-toolkit">
          <span class="ni-ic"><i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i></span>
          <span class="ni-txt" style="font-weight:700;">Hộp Công Cụ Sales</span>
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
        <p class="nav-sec-label font-bold text-violet-700">Khối Phòng Ban Marketing</p>
        <div class="ni ${activePage === 'dashboard-manager' ? 'active' : ''}" data-page="dashboard-manager">
          <span class="ni-ic"><i class="fa-solid fa-square-poll-vertical"></i></span>
          <span class="ni-txt">Dashboard Marketers</span>
        </div>
        <div class="ni ${activePage === 'mcna-funnel' ? 'active' : ''}" data-page="mcna-funnel">
          <span class="ni-ic"><i class="fa-solid fa-diagram-project text-purple-500"></i></span>
          <span class="ni-txt font-semibold" style="color: #6366f1;">Phễu 5 Tầng MCNA</span>
          <span class="ni-bd r" style="background:var(--p500); font-size:9px; padding:1px 3px;">LIVE Sim</span>
        </div>
        <div class="ni ${activePage === 'reports' ? 'active' : ''}" data-page="reports">
          <span class="ni-ic"><i class="fa-solid fa-paste"></i></span>
          <span class="ni-txt">Báo Cáo & Dự Báo</span>
        </div>
      </div>
      
      ${flowSecHtml}
      
      <div class="nav-sec">
        <p class="nav-sec-label">Dữ liệu & Bổ trợ</p>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
        <div class="ni ${activePage === 'sales-toolkit' ? 'active' : ''}" data-page="sales-toolkit">
          <span class="ni-ic"><i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i></span>
          <span class="ni-txt" style="font-weight:700;">Hộp Công Cụ Sales</span>
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
        <div class="ni ${activePage === 'mcna-funnel' ? 'active' : ''}" data-page="mcna-funnel">
          <span class="ni-ic"><i class="fa-solid fa-diagram-project text-purple-500"></i></span>
          <span class="ni-txt font-semibold" style="color: #6366f1;">Phễu 5 Tầng MCNA</span>
          <span class="ni-bd r" style="background:var(--p500); font-size:9px; padding:1px 3px;">LIVE Sim</span>
        </div>
      </div>
      
      ${flowSecHtml}
      
      <div class="nav-sec">
        <p class="nav-sec-label">Dữ liệu & Bổ trợ</p>
        <div class="ni ${activePage === 'contacts' ? 'active' : ''}" data-page="contacts">
          <span class="ni-ic"><i class="fa-solid fa-user-group"></i></span>
          <span class="ni-txt font-semibold">Khách Hàng (B2B/B2C)</span>
        </div>
        <div class="ni ${activePage === 'products' ? 'active' : ''}" data-page="products">
          <span class="ni-ic"><i class="fa-solid fa-boxes-stacked"></i></span>
          <span class="ni-txt">Mã Hàng Sản Phẩm</span>
        </div>
        <div class="ni ${activePage === 'sales-toolkit' ? 'active' : ''}" data-page="sales-toolkit">
          <span class="ni-ic"><i class="fa-solid fa-wand-magic-sparkles text-amber-500"></i></span>
          <span class="ni-txt" style="font-weight:700;">Hộp Công Cụ Sales</span>
        </div>
      </div>
    `;
  }
  // Support Agent Sidebar Navigation - SLA desk only (RBAC)
  else if (role === 'support') {
    navHtml = `
      <div class="nav-sec">
        <p class="nav-sec-label">Trạm Phục Vụ</p>
        <div class="ni ${activePage === 'dashboard-support' ? 'active' : ''}" data-page="dashboard-support">
          <span class="ni-ic"><i class="fa-solid fa-headset"></i></span>
          <span class="ni-txt">Support Dashboard</span>
        </div>
      </div>

      ${flowSecHtml}
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
    manager: '<span class="role-badge m" style="background:#7c3aed; color:white; padding:2px 6px; border-radius:4px; font-size:9.5px; font-weight:bold;">MARKETERS</span>',
    sales: '<span class="role-badge sr">REP</span>',
    support: '<span class="role-badge su">SUPPORT</span>'
  };

  return `
    <aside class="${sbClass}" id="main-sidebar">
      <div class="sb-header">
        <div class="logo-w">
          <div class="logo-ico"><i class="fa-solid fa-fire text-white"></i></div>
          <span class="brand-title" style="font-size: 16px;">MCNA CRM VN</span>
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

      <!-- Bản đồ Tiến trình Kinh doanh 5 Giai đoạn tích hợp -->
      <div style="margin-top: 24px;">
        <div style="background-color: white; border-radius: var(--r); border: 1px solid var(--bd); padding: 20px; box-shadow: var(--sh);">
          <div style="border-bottom: 2px solid #818cf8; padding-bottom: 10px; margin-bottom: 16px;">
            <h3 style="font-family: var(--fd); font-size: 16px; font-weight: 800; color: #4338ca; display: flex; align-items: center; gap: 8px; margin: 0;">
              <i class="fa-solid fa-route animate-pulse"></i> KHÔNG GIAN BẢN ĐỒ TIẾN TRÌNH KINH DOANH 5 BƯỚC (UNIFIED PIPELINE)
            </h3>
            <p style="font-size: 12px; color: var(--n500); margin-top: 4px; margin-bottom: 0;">
              Hội tụ đầy đủ thông tin xuyên suốt từ giai đoạn tiếp nhận Leads mới đến đàm phán hợp đồng, thanh quyết toán hóa đơn nợ dòng tiền và vận hành SLA Tickets xử lý sự vụ.
            </p>
          </div>
          ${renderUnifiedSalesPipeline()}
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
            ${ACTIVITIES_DB.filter(a=>a.type==='meeting').slice(0, 3).map(meet => {
              const quizCompleted = window.PREMEETING_QUIZ_COMPLETED && window.PREMEETING_QUIZ_COMPLETED[meet.id];
              return `
                <div style="padding:10px; border-radius:var(--rs); background-color:var(--n50); border:1px solid var(--bd); font-size:12px; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:start; gap:8px;">
                    <p style="font-weight:700; color:var(--n800);"><i class="fa-solid fa-users"></i> ${esc(meet.title)}</p>
                    ${quizCompleted ? `<span class="chip gr" style="font-size:9px; font-weight:700; white-space:nowrap;"><i class="fa-solid fa-trophy"></i> Ready: ${quizCompleted.score}/100</span>` : `<span class="chip rd" style="font-size:9px; font-weight:700; white-space:nowrap;"><i class="fa-solid fa-triangle-exclamation"></i> Quiz Chưa Làm</span>`}
                  </div>
                  <p style="color:var(--n500);">Thời điểm: <span class="tmono">${meet.datetime}</span></p>
                  <p style="font-size:10px; color:var(--n400);">Ghi chú: ${esc(meet.outcome)}</p>
                  <button class="btn pr xs font-bold" onclick="window.crmApp.openPreMeetingQuizModal('${meet.id}')" style="margin-top:6px; padding:3px 8px; font-size:10px; align-self:start;"><i class="fa-solid fa-circle-question"></i> Trả lời Quiz Chuẩn bị (Pre-Meeting Quiz)</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Bản đồ Tiến trình Kinh doanh 5 Giai đoạn tích hợp -->
      <div style="margin-top: 24px; grid-column: span 2;">
        <div style="background-color: white; border-radius: var(--r); border: 1px solid var(--bd); padding: 20px; box-shadow: var(--sh);">
          <div style="border-bottom: 2px solid #818cf8; padding-bottom: 10px; margin-bottom: 16px;">
            <h3 style="font-family: var(--fd); font-size: 16px; font-weight: 800; color: #4338ca; display: flex; align-items: center; gap: 8px; margin: 0;">
              <i class="fa-solid fa-route animate-pulse"></i> SƠ ĐỒ TIẾN TRÌNH KINH DOANH CÁ NHÂN (UNIFIED 5-STAGE KANBAN)
            </h3>
            <p style="font-size: 12px; color: var(--n500); margin-top: 4px; margin-bottom: 0;">
              Quản lý tiến trình dịch chuyển, liên kết Leads và Deals thông suốt của khách hàng từ tiếp cận đến thanh toán thanh quyết toán nợ và xử lý vận hành.
            </p>
          </div>
          ${renderUnifiedSalesPipeline()}
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

export function drawLeadsPage(leadsList, activeTab, filterState, viewerRole) {
  // First, apply activeTab filter
  const stateFilteredList = activeTab === 'all' ? leadsList : leadsList.filter(l => l.status === activeTab);
  // Only the Sales Manager / admin can filter & distribute unassigned leads
  const canDistribute = viewerRole === 'manager' || viewerRole === 'superadmin';
  const tbuCount = leadsList.filter(l => l.status === 'to_be_updated' || !l.ownerId).length;

  return `
    <div class="page-container animate-fadeIn">
      ${renderUnifiedPipelineHeader('leads')}
      <!-- B2B & B2C Segregation Header Row -->
      <div class="panel" style="padding: 12px 18px; margin-bottom: 12px; border-left: 4px solid var(--p500); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h2 style="font-family:var(--fd); font-size:16px; font-weight:800; color:var(--n800); margin:0;"><i class="fa-solid fa-people-arrows text-indigo-500"></i> MCNA CRM VN - Phân Hệ Chăm Sóc & Tiếp Cận Lead</h2>
          <p style="font-size:11.5px; color:var(--n500); margin-top:2px;">Quản trị phễu tiếp cận riêng biệt: Doanh nghiệp (B2B) và Đại chúng (B2C) với chế độ bảo mật thông tin tối đa.</p>
        </div>
        <div style="display:flex; gap:6px; background:var(--n50); border:1px solid var(--bd); padding:4px; border-radius:var(--rs);">
          <button class="btn ${(!filterState.leadType || filterState.leadType === 'all') ? 'pr' : 'bl'} xs" onclick="window.crmApp.changeLeadTypeFilter('all')" style="font-weight:700; padding:4px 8px; font-size:11px;"><i class="fa-solid fa-layer-group"></i> Tất cả (${leadsList.length})</button>
          <button class="btn ${filterState.leadType === 'b2b' ? 'pr' : 'bl'} xs" onclick="window.crmApp.changeLeadTypeFilter('b2b')" style="font-weight:700; padding:4px 8px; font-size:11px;"><i class="fa-solid fa-building"></i> B2B Doanh Nghiệp (${leadsList.filter(l=>l.leadType==='b2b').length})</button>
          <button class="btn ${filterState.leadType === 'b2c' ? 'pr' : 'bl'} xs" onclick="window.crmApp.changeLeadTypeFilter('b2c')" style="font-weight:700; padding:4px 8px; font-size:11px;"><i class="fa-solid fa-user-tag"></i> B2C Cá Nhân (${leadsList.filter(l=>l.leadType==='b2c').length})</button>
        </div>
      </div>

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
        <div class="tab ${activeTab==='all'?'active':''}" data-tab="all">Tất cả trạng thái (${leadsList.length})</div>
        <div class="tab ${activeTab==='to_be_updated'?'active':''}" data-tab="to_be_updated" style="${tbuCount>0?'color:#b45309;font-weight:800;':''}">⏳ To be updated (${tbuCount})</div>
        <div class="tab ${activeTab==='new'?'active':''}" data-tab="new">Mới (${leadsList.filter(l=>l.status==='new').length})</div>
        <div class="tab ${activeTab==='contacting'?'active':''}" data-tab="contacting">Đang xử lý (${leadsList.filter(l=>l.status==='contacting').length})</div>
        <div class="tab ${activeTab==='qualified'?'active':''}" data-tab="qualified">Đã Qualify (${leadsList.filter(l=>l.status==='qualified').length})</div>
        <div class="tab ${activeTab==='lost'?'active':''}" data-tab="lost">Mất Lead (${leadsList.filter(l=>l.status==='lost').length})</div>
      </div>

      <!-- Leads dynamic table -->
      <div class="panel" style="padding:0; overflow-x:auto;">
        ${stateFilteredList.length === 0 ? `
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
                <th>Phân Loại</th>
                <th>Họ Tên Lead</th>
                <th>Mô Hình / Doanh Nghiệp</th>
                <th style="min-width:180px;">Kênh Tiếp Cận Khả Dụng</th>
                <th>Nguồn tiếp cận</th>
                <th>Thứ tự ưu tiên</th>
                <th style="text-align:right;">Giá trị dự tính</th>
                <th>Người phụ trách</th>
                <th style="text-align:center; min-width: 140px;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${stateFilteredList.map(led => {
                const priorityBadge = led.priority === 'hot' ? 'chip rd' : led.priority === 'warm' ? 'chip am' : 'chip gy';
                const owner = USERS_DB.find(u => u.id === led.ownerId);
                const isB2C = led.leadType === 'b2c';

                // B2C privacy policy: both channels masked deterministically;
                // full values are revealed only in the detail modal by the
                // assigned rep / manager (audited).
                let contactDisplayHtml = '';
                if (isB2C) {
                  contactDisplayHtml = `
                    <div style="font-family:var(--fm); line-height: 1.3;">
                      <span class="text-emerald-700 font-bold" style="font-size:11.5px; background: rgba(16,185,129,0.1); padding:2px 5px; border-radius:4px;"><i class="fa-solid fa-phone"></i> ${maskPhone(led.phone)}</span>
                      <div style="font-size:9.5px; color:var(--n400); margin-top:3px;">
                        <i class="fa-solid fa-shield-halved text-rose-500" title="Bảo mật B2C"></i> Email: <em>${esc(maskEmail(led.email))}</em>
                      </div>
                      <div style="font-size:9px; color:var(--n400); margin-top:2px;">🔒 Giải mã trong chi tiết Lead (có ghi Audit)</div>
                    </div>
                  `;
                } else {
                  contactDisplayHtml = `
                    <div style="font-family:var(--fm); line-height: 1.3; font-size:11px; color:var(--n600);">
                      <div><i class="fa-solid fa-phone" style="width:12px;"></i> ${led.phone}</div>
                      <div style="margin-top:2px;"><i class="fa-solid fa-envelope" style="width:12px;"></i> ${esc(led.email)}</div>
                    </div>
                  `;
                }

                return `
                  <tr>
                    <td class="tmono">${led.id}</td>
                    <td>
                      ${isB2C 
                        ? `<span class="chip pu font-bold" style="font-size:9.5px; padding:2px 6px;"><i class="fa-solid fa-user-tag text-purple-600"></i> B2C cá nhân</span>`
                        : `<span class="chip bl font-bold" style="font-size:9.5px; padding:2px 6px;"><i class="fa-solid fa-building text-blue-600"></i> B2B pháp nhân</span>`
                      }
                    </td>
                    <td>
                      <span class="cell-bold">${esc(led.name)}</span>
                      <!-- Notes Display -->
                      ${led.notes ? `
                        <div style="font-size:10.5px; color:#5b21b6; background:#f5f3ff; border:1px solid #ddd6fe; border-radius:4px; padding:2px 6px; margin-top:4px; max-width:200px; word-break:break-word;">
                          <i class="fa-solid fa-note-sticky text-purple-500"></i> ${esc(led.notes)}
                        </div>
                      ` : ''}
                      <!-- Connected Deals Display -->
                      ${(() => {
                        const dl = DEALS_DB.filter(d => 
                          (d.contactName && d.contactName.toLowerCase() === led.name.toLowerCase()) || 
                          (d.companyName && d.companyName.toLowerCase() === led.company.toLowerCase()) ||
                          d.id === led.dealId || led.notes?.includes(d.id) || d.name?.includes(led.name)
                        );
                        if (dl.length > 0) {
                          return `
                            <div style="margin-top:4px; display:flex; flex-direction:column; gap:2px;">
                              ${dl.map(d => `
                                <div style="display:inline-flex; align-items:center; background:#ecfdf5; color:#047857; font-size:9.5px; border:1px solid #a7f3d0; padding:1px 6px; border-radius:4px; width:fit-content; font-weight:bold;">
                                  <i class="fa-solid fa-briefcase" style="margin-right:4px;"></i> Deal: ${esc(d.name)} (${esc(d.stage.replace('_', ' ').toUpperCase())})
                                </div>
                              `).join('')}
                            </div>
                          `;
                        } else {
                          return `<div style="margin-top:4px; font-size:9px; color:var(--n400); font-style:italic;">Chưa có Deal liên kết</div>`;
                        }
                      })()}
                    </td>
                    <td>
                      ${isB2C 
                        ? `<span style="font-size:11.5px; color:var(--n500); font-style:italic;">Khách mua tự do</span>`
                        : `<span style="font-size:11.5px; font-weight:700; color:var(--n750);"><i class="fa-solid fa-building text-slate-400" style="margin-right:4px;"></i>${esc(led.company)}</span>`
                      }
                    </td>
                    <td>${contactDisplayHtml}</td>
                    <td><span class="chip bl" style="font-size:10px;">${esc(led.source)}</span></td>
                    <td><span class="${priorityBadge}">${led.priority?.toUpperCase()}</span></td>
                    <td style="text-align:right;" class="tmono cell-bold text-primary-600">${fmtVND(led.value)}</td>
                    <td>
                      ${owner ? `
                      <div style="display:flex; align-items:center; gap:6px;">
                        <div class="av xs" style="background:${owner.color || 'var(--grad)'}">${owner.initials || 'S'}</div>
                        <span style="font-size:11.5px; font-weight:600;">${esc(owner.name)}</span>
                      </div>` : `
                      <span class="chip am font-bold" style="font-size:10px; padding:3px 8px;"><i class="fa-solid fa-hourglass-half"></i> To be updated</span>`}
                    </td>
                    <td style="text-align:center;">
                      <div style="display:flex; justify-content:center; gap:4px;">
                        ${!led.ownerId && canDistribute ? `<button class="btn am xs" onclick="window.crmApp.openAssignLeadModal('${led.id}')" title="Lọc & chia Lead cho Sales" style="padding:4px 6px; font-size:10.5px; font-weight:700;"><i class="fa-solid fa-share-from-square"></i> Chia</button>` : ''}
                        <button class="btn gr xs" onclick="window.crmApp.convertLeadToDeal('${led.id}')" title="Chuyển đổi thành Deal thương thảo" style="padding:4px 6px; font-size:10.5px;"><i class="fa-solid fa-shuffle"></i> Convert</button>
                        <button class="btn bl icon-only xs" onclick="window.crmApp.openLeadDetail('${led.id}')" title="Chi tiết & Tiếp cận bảo mật" style="padding:4px 6px;"><i class="fa-solid fa-eye"></i></button>
                        <button class="btn rd icon-only xs" onclick="window.crmApp.deleteLead('${led.id}')" title="Xóa bỏ" style="padding:4px 6px;"><i class="fa-solid fa-trash-can"></i></button>
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

  let contentHtml = '';
  if (activeSubTab === 'kanban') {
    contentHtml = `
      <div class="panel" style="background-color:white; display:flex; justify-content:space-between; align-items:center; padding:12px 24px; margin-bottom: 4px;">
        <p style="font-size:13px; color:var(--n500);"><i class="fa-solid fa-circle-question"></i> Di chuyển các thẻ Deals thương lượng trôi xuôi phễu theo thứ tự từ trái qua phải để chốt đơn hàng.</p>
      </div>
      <div class="pipeline-board">
        ${boardHtml}
      </div>
    `;
  } else if (activeSubTab === 'list') {
    contentHtml = listHtml;
  } else if (activeSubTab === 'unified') {
    contentHtml = renderUnifiedSalesPipeline();
  }

  return `
    <div class="page-container animate-fadeIn">
      ${renderUnifiedPipelineHeader('deals')}
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--bd); padding-bottom: 12px; margin-bottom: 12px; flex-wrap: wrap; gap: 12px;">
        <div style="display: flex; gap: 8px;">
          <button class="btn ${activeSubTab === 'kanban' ? 'pr' : 'bl'} sm" id="deals-tab-kanban-btn" style="font-weight:700;">
            <i class="fa-solid fa-layer-group"></i> Sơ đồ Phễu Kanban
          </button>
          <button class="btn ${activeSubTab === 'list' ? 'pr' : 'bl'} sm" id="deals-tab-list-btn" style="font-weight:700;">
            <i class="fa-solid fa-list-ul"></i> Danh sách Cơ hội chi tiết
          </button>
          <button class="btn ${activeSubTab === 'unified' ? 'pr' : 'bl'} sm" id="deals-tab-unified-btn" style="font-weight:800; border-left: 4px solid #6366f1;">
            <i class="fa-solid fa-route text-indigo-400 animate-pulse"></i> Bản Đồ Tiến Trình 5 Bước (Unified Sales Pipeline)
          </button>
        </div>
        <button class="btn pr" id="pipeline-quick-add-deal-btn"><i class="fa-solid fa-circle-plus"></i> Tạo Deal Thương Lượng mới</button>
      </div>

      ${contentHtml}
    </div>
  `;
}

export function renderUnifiedSalesPipeline() {
  // Compute lists for each of the 5 stages

  // 1. Awareness Stage (status: 'new', 'contacting')
  const stage1Leads = LEADS_DB.filter(l => l.status === 'new' || l.status === 'contacting');
  const stage1Sum = stage1Leads.reduce((sum, l) => sum + (l.value || 0), 0);

  // 2. Lead Stage (qualified leads and prospecting/qualified deals, paired together to link across stages)
  const qualLeads = LEADS_DB.filter(l => l.status === 'qualified' || l.status === 'proposal');
  const earlyDeals = DEALS_DB.filter(d => d.stage === 'prospecting' || d.stage === 'qualified');

  const stage2Items = [];
  const processedDealIds = new Set();
  const processedLeadIds = new Set();

  qualLeads.forEach(lead => {
    // Check if there is an early deal associated with this lead
    const matchedDeal = earlyDeals.find(d => 
      (d.contactName && d.contactName.toLowerCase() === lead.name.toLowerCase()) || 
      (d.companyName && d.companyName.toLowerCase() === lead.company.toLowerCase()) ||
      d.id === lead.dealId || lead.notes?.includes(d.id) || d.name?.includes(lead.name)
    );
    if (matchedDeal) {
      stage2Items.push({
        type: 'paired',
        lead: lead,
        deal: matchedDeal,
        id: `paired-${lead.id}-${matchedDeal.id}`
      });
      processedLeadIds.add(lead.id);
      processedDealIds.add(matchedDeal.id);
    } else {
      stage2Items.push({
        type: 'lead',
        lead: lead,
        id: `lead-${lead.id}`
      });
      processedLeadIds.add(lead.id);
    }
  });

  earlyDeals.forEach(deal => {
    if (!processedDealIds.has(deal.id)) {
      // Find matching lead in LEADS_DB (even if status is general)
      const matchedLead = LEADS_DB.find(lead => 
        (deal.contactName && deal.contactName.toLowerCase() === lead.name.toLowerCase()) || 
        (deal.companyName && deal.companyName.toLowerCase() === lead.company.toLowerCase()) ||
        deal.id === lead.dealId || lead.notes?.includes(deal.id)
      );
      if (matchedLead) {
        stage2Items.push({
          type: 'paired',
          lead: matchedLead,
          deal: deal,
          id: `paired-${matchedLead.id}-${deal.id}`
        });
      } else {
        stage2Items.push({
          type: 'deal',
          deal: deal,
          id: `deal-${deal.id}`
        });
      }
      processedDealIds.add(deal.id);
    }
  });

  const stage2Sum = stage2Items.reduce((sum, item) => {
    const val1 = item.lead ? (item.lead.value || 0) : 0;
    const val2 = item.deal ? (item.deal.value || 0) : 0;
    return sum + Math.max(val1, val2);
  }, 0);

  // 3. Sales Stage (proposing or negotiating deals)
  const salesDeals = DEALS_DB.filter(d => d.stage === 'proposal' || d.stage === 'negotiation');
  const stage3Sum = salesDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // 4. Payment Stage (closed won deals and their matching invoices)
  const wonDeals = DEALS_DB.filter(d => d.stage === 'closed_won');
  const paymentItems = wonDeals.map(deal => {
    const invoices = INVOICES_DB.filter(inv => 
      inv.quoteId === deal.id || 
      inv.contactId === deal.contactId || 
      (deal.contactName && inv.contactName && inv.contactName.toLowerCase().includes(deal.contactName.toLowerCase()))
    );
    const totalInvoiced = invoices.reduce((s, iv) => s + iv.total, 0);
    const totalPaid = invoices.filter(iv => iv.status === 'paid').reduce((s, iv) => s + iv.total, 0);
    const outstanding = Math.max(0, deal.value - totalPaid);
    
    return {
      deal,
      invoices,
      totalInvoiced,
      totalPaid,
      outstanding
    };
  });
  const stage4Sum = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);

  // 5. Control Stage (open support SLA tickets and operational tasks)
  const controlTasks = TASKS_DB.filter(t => !t.completed);
  const controlTickets = TICKETS_DB.filter(tk => tk.status === 'open' || tk.status === 'pending' || tk.status === 'escalated');

  // Let's build the HTML structure for the 5 stages
  return `
    <div class="panel" style="background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); padding: 16px; margin-bottom: 16px; border: 1px solid #ddd6fe; border-radius: var(--r);">
      <h3 style="font-family: var(--fd); font-weight: 800; font-size: 15px; color: #4338ca; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-compass animate-spin" style="animation-duration: 4s;"></i> Bản Đồ Tiến Trình Kinh Doanh Thuần Nhất (SalesPipeline Map)
      </h3>
      <p style="font-size: 12.5px; color: #6b21a8; line-height: 1.4; margin-top: 4px;">
        Góc nhìn hội tụ tích hợp xâu chuỗi 5 giai đoạn cốt lõi của doanh nghiệp: 
        <strong>(1) Awareness</strong> ➔ 
        <strong>(2) Lead</strong> ➔ 
        <strong>(3) Sales</strong> ➔ 
        <strong>(4) Payment</strong> ➔ 
        <strong>(5) Control</strong>. 
        Mọi dữ liệu từ hồ sơ Leads tiềm năng, Cơ hội thương thảo, Báo giá đã duyệt, Hóa đơn nợ nần và Phiếu sự cố hỗ trợ SLA đều được nối tuyến hoàn hảo.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(5, minmax(250px, 1fr)); gap: 14px; margin-top: 12px; overflow-x: auto; padding-bottom: 24px; align-items: start;">
      
      <!-- COLUMN 1: AWARENESS -->
      <div style="background: #fafafa; border: 1px solid var(--bd); border-radius: var(--r); padding: 12px; min-height: 600px; display: flex; flex-direction: column;">
        <div style="border-top: 4px solid #6366f1; padding-top: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--fd); font-weight: 800; font-size: 13px; color: #3730a3; text-transform: uppercase;">1. Awareness</span>
            <span class="chip" style="background: #e0e7ff; color: #4f46e5; font-size: 10px; font-weight: 800;">${stage1Leads.length}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #4338ca; margin-top: 2px;">Vốn ước tính: ${fmtVND(stage1Sum)}</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${stage1Leads.length === 0 ? `
            <div style="padding: 40px 12px; text-align: center; border: 2px dashed #e2e8f0; border-radius: var(--rs); color: var(--n400); font-size: 11.5px;">
              <i class="fa-solid fa-magnet" style="font-size: 24px; margin-bottom: 8px; color: #c7d2fe;"></i> Chưa có Leads mới tiếp cận
            </div>
          ` : stage1Leads.map(l => {
            const matchedDeal = DEALS_DB.find(d => 
              (d.contactName && d.contactName.toLowerCase() === l.name.toLowerCase()) || 
              (d.companyName && d.companyName.toLowerCase() === l.company.toLowerCase()) ||
              d.id === l.dealId || l.notes?.includes(d.id)
            );
            return `
              <div class="deal-card" style="border-left: 4px solid #6366f1; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh);" onclick="window.crmApp.openLeadDetail('${l.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #e0e7ff; color: #4f46e5; font-weight: 800;">AWARENESS</span>
                  <span style="font-size: 9px; color: var(--n500); font-family: var(--fm);">${l.createdAt}</span>
                </div>
                <div style="font-family: var(--f); font-weight: 700; font-size: 12.5px; color: var(--n900);">${esc(l.name)}</div>
                <div style="font-size: 11.5px; color: var(--n500); margin-bottom: 6px;">${esc(l.company)}</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 6px; margin-top: 6px;">
                  <span style="font-family: var(--fm); font-size: 11px; font-weight: bold; color: #4f46e5;">Value: ${fmtVND(l.value)}</span>
                  <span class="chip ${l.priority === 'hot' ? 'rd' : l.priority === 'warm' ? 'am' : 'gy'}" style="font-size: 8px; text-transform: uppercase;">${l.priority}</span>
                </div>

                <div style="margin-top: 8px; border-top: 1px dashed #f1f5f9; padding-top: 8px;">
                  ${matchedDeal ? `
                    <div style="background: #edf1fe; border: 1px solid #c7d2fe; color: #3f51b5; padding: 4px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; display: flex; align-items: center; gap: 4px;" onclick="event.stopPropagation(); window.crmApp.openDealDetailModal('${matchedDeal.id}')">
                      <i class="fa-solid fa-route text-indigo-500"></i> Đã nối: ${esc(matchedDeal.name.substring(0, 16))}...
                    </div>
                  ` : `
                    <button class="btn pr xs" style="width: 100%; border-radius: 6px; padding: 4px; font-size: 10px; justify-content: center; background: #6366f1; border-color: #6366f1; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.convertLeadToDeal('${l.id}')">
                      <i class="fa-solid fa-shuffle"></i> Thăng cấp thành Deal
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- COLUMN 2: LEAD & QUALIFY -->
      <div style="background: #fafafa; border: 1px solid var(--bd); border-radius: var(--r); padding: 12px; min-height: 600px; display: flex; flex-direction: column;">
        <div style="border-top: 4px solid #0ea5e9; padding-top: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--fd); font-weight: 800; font-size: 13px; color: #0369a1; text-transform: uppercase;">2. Lead & Qualify</span>
            <span class="chip" style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 800;">${stage2Items.length}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-top: 2px;">Vốn ước tính: ${fmtVND(stage2Sum)}</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${stage2Items.length === 0 ? `
            <div style="padding: 40px 12px; text-align: center; border: 2px dashed #e2e8f0; border-radius: var(--rs); color: var(--n400); font-size: 11.5px;">
              <i class="fa-solid fa-route" style="font-size: 24px; margin-bottom: 8px; color: #bae6fd;"></i> Chưa có cơ hội ở giai đoạn Thẩm định
            </div>
          ` : stage2Items.map(item => {
            const hasDeal = item.type === 'paired' || item.type === 'deal';
            const hasLead = item.type === 'paired' || item.type === 'lead';
            const value = item.deal ? item.deal.value : item.lead.value;
            const name = item.deal ? item.deal.name : item.lead.name;
            const company = item.deal ? item.deal.companyName : item.lead.company;
            const source = item.lead ? item.lead.source : 'Inbound Platform';
            
            return `
              <div class="deal-card" style="border-left: 4px solid #0ea5e9; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh);" 
                   onclick="${item.deal ? `window.crmApp.openDealDetailModal('${item.deal.id}')` : `window.crmApp.openLeadDetail('${item.lead.id}')`}">
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #e0f2fe; color: #0284c7; font-weight: 800; text-transform: uppercase;">
                    ${item.type === 'paired' ? 'LINKED PRO' : item.type.toUpperCase()}
                  </span>
                  <span style="font-size: 8px; color: var(--n400);" class="tmono">${esc(source.substring(0, 12))}</span>
                </div>

                <div style="font-family: var(--f); font-weight: 700; font-size: 12.5px; color: var(--n900);">${esc(name)}</div>
                <div style="font-size: 11px; color: var(--n500); margin-bottom: 2px;">${esc(company)}</div>

                ${item.type === 'paired' ? `
                  <div style="font-size: 9px; padding: 2px 6px; background:#f0fdf4; border: 1px solid #bbf7d0; color: #16a34a; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; margin-top:4px; font-weight:800;">
                    <i class="fa-solid fa-circle-check"></i> Đã liên kết Lead ➔ Deal
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 6px; margin-top: 8px;">
                  <span style="font-family: var(--fm); font-size: 11px; font-weight: bold; color: #0284c7;">${fmtVND(value)}</span>
                  ${item.deal ? `<span class="chip gy" style="font-size: 8px; font-weight: 700;">Prob: ${item.deal.probability}%</span>` : ''}
                </div>

                <div style="margin-top: 8px; border-top: 1px dashed #f1f5f9; padding-top: 8px;">
                  ${item.type === 'lead' ? `
                    <button class="btn pr xs" style="width: 100%; border-radius: 6px; padding: 4px; font-size: 10px; justify-content: center; background: #0ea5e9; border-color: #0ea5e9; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.convertLeadToDeal('${item.lead.id}')">
                      <i class="fa-solid fa-wand-magic-sparkles"></i> Khởi tạo Deal Thẩm Định
                    </button>
                  ` : `
                    <button class="btn bl xs" style="width: 100%; border-radius: 6px; padding: 4px; font-size: 10px; justify-content: center; color: #0284c7; border-color: #0284c7; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.moveDealNextStage('${item.deal.id}')">
                      Chuyển Xuôi Sales GĐ3 <i class="fa-solid fa-chevron-right"></i>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- COLUMN 3: SALES PITCH -->
      <div style="background: #fafafa; border: 1px solid var(--bd); border-radius: var(--r); padding: 12px; min-height: 600px; display: flex; flex-direction: column;">
        <div style="border-top: 4px solid #f59e0b; padding-top: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--fd); font-weight: 800; font-size: 13px; color: #b45309; text-transform: uppercase;">3. Sales & Proposal</span>
            <span class="chip" style="background: #fef3c7; color: #b45309; font-size: 10px; font-weight: 800;">${salesDeals.length}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #d97706; margin-top: 2px;">Vốn ước tính: ${fmtVND(stage3Sum)}</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${salesDeals.length === 0 ? `
            <div style="padding: 40px 12px; text-align: center; border: 2px dashed #e2e8f0; border-radius: var(--rs); color: var(--n400); font-size: 11.5px;">
              <i class="fa-solid fa-file-pdf" style="font-size: 24px; margin-bottom: 8px; color: #fde047;"></i> Chưa có Cơ hội đang soạn thảo báo giá
            </div>
          ` : salesDeals.map(d => {
            const matchedQuotes = QUOTES_DB.filter(q => q.dealId === d.id);
            return `
              <div class="deal-card" style="border-left: 4px solid #f59e0b; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh);" onclick="window.crmApp.openDealDetailModal('${d.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #fef3c7; color: #b45309; font-weight: 800;">SALES PITCH</span>
                  <span class="chip gy" style="font-size: 8.5px; font-weight: 700; background: #fff7ed; color: #c2410c;">P: ${d.probability}%</span>
                </div>
                <div style="font-family: var(--f); font-weight: 700; font-size: 12.5px; color: var(--n900);">${esc(d.name)}</div>
                <div style="font-size: 11px; color: var(--n500); margin-bottom: 6px;">KH: ${esc(d.contactName)}</div>

                <!-- Synchronized Quotations linkage -->
                <div style="background: #fafaf9; border: 1px solid #e7e5e4; border-radius: 6px; padding: 6px; margin: 8px 0; display:flex; flex-direction:column; gap:4px;">
                  <div style="font-size: 9px; font-weight: 800; color: #78716c; text-transform: uppercase;"><i class="fa-solid fa-file-contract"></i> Bản Đề xuất Báo Giá:</div>
                  ${matchedQuotes.length > 0 ? matchedQuotes.map(q => {
                    let stBg = '#f1f5f9';
                    let stCol = '#475569';
                    if (q.status === 'chap_nhan') { stBg = '#ecfdf5'; stCol = '#16a34a'; }
                    else if (q.status === 'da_gui' || q.status === 'xem_xet') { stBg = '#fffbeb'; stCol = '#d97706'; }
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; background: ${stBg}; color: ${stCol}; padding: 2px 4px; border-radius: 4px; font-weight: 700;">
                        <span>${q.number}</span>
                        <span>${q.status.toUpperCase()}</span>
                      </div>
                    `;
                  }).join('') : `
                    <div style="font-size: 9.5px; color: var(--red); font-style: italic; margin-bottom: 2px;"><i class="fa-solid fa-triangle-exclamation"></i> Không có báo giá đăng ký</div>
                    <button class="btn pr xs" style="width: 100%; border-radius: 4px; padding: 2px 4px; font-size: 9.5px; justify-content: center; background: #f59e0b; border-color: #f59e0b; font-weight: bold;" onclick="event.stopPropagation(); window.crmApp.go('quotes')">
                      <i class="fa-solid fa-plus-circle"></i> Soạn Báo Giá (Q3)
                    </button>
                  `}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 6px; margin-top: 8px;">
                  <span style="font-family: var(--fm); font-size: 11px; font-weight: bold; color: #b45309;">${fmtVND(d.value)}</span>
                  <span style="font-size: 8.5px; color: var(--n400);" class="tmono"><i class="fa-regular fa-clock"></i> ${d.expectedClose}</span>
                </div>

                <div style="margin-top: 8px;">
                  <button class="btn gr xs" style="width: 100%; border-radius: 6px; padding: 4px; font-size: 10px; justify-content: center; background: #ee5b02; border-color: #ee5b02; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.moveDealNextStage('${d.id}')">
                    Chốt ký Hợp Đồng <i class="fa-solid fa-circle-check"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- COLUMN 4: PAYMENT RECONCILIATION -->
      <div style="background: #fafafa; border: 1px solid var(--bd); border-radius: var(--r); padding: 12px; min-height: 600px; display: flex; flex-direction: column;">
        <div style="border-top: 4px solid #10b981; padding-top: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--fd); font-weight: 800; font-size: 13px; color: #065f46; text-transform: uppercase;">4. Payment & Won</span>
            <span class="chip" style="background: #d1fae5; color: #065f46; font-size: 10px; font-weight: 800;">${wonDeals.length}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #047857; margin-top: 2px;">DT Won chốt: ${fmtVND(stage4Sum)}</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${paymentItems.length === 0 ? `
            <div style="padding: 40px 12px; text-align: center; border: 2px dashed #e2e8f0; border-radius: var(--rs); color: var(--n400); font-size: 11.5px;">
              <i class="fa-solid fa-file-invoice-dollar" style="font-size: 24px; margin-bottom: 8px; color: #a7f3d0;"></i> Chưa ghi nhận hợp đồng thành công nào
            </div>
          ` : paymentItems.map(item => {
            return `
              <div class="deal-card" style="border-left: 4px solid #10b981; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh);" onclick="window.crmApp.openDealDetailModal('${item.deal.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #d1fae5; color: #047857; font-weight: 800; text-transform: uppercase;">CONTRACT WON</span>
                  <span style="font-size: 9px; color: #059669; font-weight: bold;"><i class="fa-solid fa-circle-check"></i> Đã Chốt</span>
                </div>
                <div style="font-family: var(--f); font-weight: 700; font-size: 12.5px; color: var(--n900);">${esc(item.deal.name)}</div>
                <div style="font-size: 11px; color: var(--n500); margin-bottom: 4px;">Doanh nghiệp: ${esc(item.deal.companyName)}</div>
                <div style="font-weight: 600; font-size: 11.5px; color: var(--n700); margin-bottom: 4px;">Giá trị: <span class="tmono cell-bold text-emerald-600">${fmtVND(item.deal.value)}</span></div>

                <!-- Linked Invoices synchronization status -->
                <div style="background: #f0fdf4; border: 1px solid #c6f6d5; border-radius: 6px; padding: 6px; margin: 8px 0; display:flex; flex-direction:column; gap:2px;">
                  <div style="font-size: 9px; font-weight: 800; color: #047857; text-transform: uppercase;"><i class="fa-solid fa-money-bill-wave"></i> Thu nợ đỏ hóa đơn:</div>
                  ${item.invoices.length > 0 ? item.invoices.map(inv => {
                    let stBg = '#fee2e2';
                    let stCol = '#b91c1c';
                    if (inv.status === 'paid') { stBg = '#d1fae5'; stCol = '#047857'; }
                    else if (inv.status === 'partial') { stBg = '#fef3c7'; stCol = '#b45309'; }
                    return `
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; background: ${stBg}; color: ${stCol}; padding: 1.5px 3px; border-radius: 4px; font-weight: bold; margin-bottom:1px;">
                        <span class="tmono">${inv.number}</span>
                        <span>${inv.status.toUpperCase()}</span>
                      </div>
                    `;
                  }).join('') + `
                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #a7f3d0; margin-top: 4px; padding-top: 4px; font-size: 9.5px; font-weight: 800; color: #065f46;">
                      <span>Outstanding Debt:</span>
                      <span class="tmono">${fmtVND(item.outstanding)}</span>
                    </div>
                  ` : `
                    <div style="font-size: 9.5px; color: var(--red); font-style: italic; margin-bottom: 2px;"><i class="fa-solid fa-triangle-exclamation"></i> Chưa lập Hóa đơn thanh quyết toán</div>
                    <button class="btn pr xs" style="width: 100%; border-radius: 4px; padding: 2px 4px; font-size: 9.5px; justify-content: center; background: #10b981; border-color: #10b981; font-weight: bold;" onclick="event.stopPropagation(); window.crmApp.spawnInvoiceFromQuote('${item.deal.id}')">
                      <i class="fa-solid fa-file-invoice"></i> + Xuất hóa đơn thu nợ
                    </button>
                  `}
                </div>

                <div style="margin-top: 8px; display: flex; gap: 4px;">
                  ${item.outstanding > 0 && item.invoices.length > 0 ? `
                    <button class="btn gr xs" style="flex: 1; border-radius: 6px; padding: 4px; font-size: 9.5px; justify-content: center; background: #10b981; border-color: #10b981; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.recordInvoicePayment('${item.invoices[0].id}')">
                      <i class="fa-solid fa-cash-register"></i> Thu nợ
                    </button>
                  ` : ''}
                  <button class="btn bl xs" style="flex: 1; border-radius: 6px; padding: 4px; font-size: 9.5px; justify-content: center; color: #10b981; border-color: #10b981; font-weight: 800;" onclick="event.stopPropagation(); window.crmApp.go('tasks')">
                    Bàn giao SLA <i class="fa-solid fa-truck-ramp-box"></i>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- COLUMN 5: POST-SALE CONTROL -->
      <div style="background: #fafafa; border: 1px solid var(--bd); border-radius: var(--r); padding: 12px; min-height: 600px; display: flex; flex-direction: column;">
        <div style="border-top: 4px solid #ec4899; padding-top: 8px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-family: var(--fd); font-weight: 800; font-size: 13px; color: #9d174d; text-transform: uppercase;">5. Post-Sales & SLA</span>
            <span class="chip" style="background: #fce7f3; color: #9d174d; font-size: 10px; font-weight: 800;">${controlTasks.length + controlTickets.length}</span>
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #be185d; margin-top: 2px;">Sự cố: ${controlTickets.length} | SLA Tasks: ${controlTasks.length}</div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
          ${controlTasks.length === 0 && controlTickets.length === 0 ? `
            <div style="padding: 40px 12px; text-align: center; border: 2px dashed #e2e8f0; border-radius: var(--rs); color: var(--n400); font-size: 11.5px;">
              <i class="fa-solid fa-circle-check" style="font-size: 24px; margin-bottom: 8px; color: #fbcfe8;"></i> Vận hành hoàn hảo, không tồn đọng tickets lỗi
            </div>
          ` : ''}

          <!-- Display Tasks checklist -->
          ${controlTasks.map(t => {
            return `
              <div class="deal-card" style="border-left: 4px solid #ec4899; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #fce7f3; color: #be185d; font-weight: 800;">ACTIVE OPERATION</span>
                  <input type="checkbox" style="width: auto; height: auto; cursor: pointer; margin: 0; transform: scale(1.15);" onchange="window.crmApp.toggleTaskCompletion('${t.id}')" title="Đánh dấu Hoàn tất tác nghiệp" />
                </div>
                <div style="font-family: var(--f); font-weight: 700; font-size: 12px; color: var(--n900); margin-bottom: 4px;">${esc(t.title)}</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 6px; margin-top: 6px; font-size: 10px; color: var(--n400);">
                  <span>Hạn: ${t.dueDate}</span>
                  <span class="chip ${t.priority === 'high' ? 'rd' : 'gy'}" style="font-size: 8.5px; text-transform: uppercase;">${t.priority}</span>
                </div>
              </div>
            `;
          }).join('')}

          <!-- Display active support/SLA tickets -->
          ${controlTickets.map(tk => {
            return `
              <div class="deal-card" style="border-left: 4px solid #14b8a6; padding: 10px; background: white; border-radius: var(--rs); position: relative; border-radius: 8px; box-shadow: var(--sh); cursor: pointer;" onclick="window.crmApp.openTicketDetail('${tk.id}')">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="chip" style="font-size: 8px; padding: 1px 4px; background: #ccfbf1; color: #0f766e; font-weight: 800;">🎫 ACTIVE TICKET</span>
                  <span class="chip ${tk.priority === 'Critical' || tk.priority === 'High' ? 'rd' : 'bl'}" style="font-size: 8px; font-weight: 700; text-transform: uppercase;">${tk.priority}</span>
                </div>
                <div style="font-family: var(--f); font-weight: 700; font-size: 12px; color: var(--n900);">${tk.number}: ${esc(tk.subject)}</div>
                <div style="font-size: 11px; color: var(--n500); margin-bottom: 4px;">Khách báo: ${esc(tk.contactName)}</div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #f1f5f9; padding-top: 6px; margin-top: 6px;">
                  <span style="font-size: 9.5px; color: var(--n400);"><i class="fa-solid fa-envelope-open-text"></i> ${tk.channel}</span>
                  <span style="font-size: 10px; font-weight: 800; background: #e6fffa; border: 1px solid #14b8a6; color:#0f766e; padding: 1px 4px; border-radius:4px;">SLA: ${tk.slaHours}h</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

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
      ${renderUnifiedPipelineHeader('tasks')}
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

export function renderInvoicesPage(invoicesList, viewerRole) {
  // RBAC: sales reps only see contract value, due date and collection status -
  // collected cash and outstanding debt are reserved for admin/finance views.
  const hideFinance = viewerRole === 'sales';

  // Calculations - workflow-generated invoices store the value in `amount`
  // instead of `total`, so normalize to avoid NaN aggregates.
  const invValue = (inv) => Number(inv.total ?? inv.amount ?? 0);
  const totalInvoiced = invoicesList.reduce((sum, inv) => sum + invValue(inv), 0);
  const totalCollected = invoicesList.reduce((sum, inv) => {
    if (inv.status === 'paid') return sum + invValue(inv);
    if (inv.status === 'partial') return sum + invValue(inv) * 0.5; // 50% paid
    return sum;
  }, 0);
  const totalDebt = totalInvoiced - totalCollected;

  return `
    <div class="page-container animate-fadeIn">
      ${renderUnifiedPipelineHeader('invoices')}
      <!-- Metric Cards for Accounts Receivable & Cashflow -->
      <div class="krow" style="margin-bottom: 4px;">
        <div class="kcard b">
          <div class="kc-title">Tổng Giá Trị Hợp Đồng Đã Xuất Hóa Đơn</div>
          <div class="kc-val font-mono text-primary-600">${fmtVND(totalInvoiced)}</div>
          <div class="kc-sub"><i class="fa-solid fa-file-invoice-dollar"></i> Tổng số: ${invoicesList.length} hóa đơn</div>
        </div>
        ${hideFinance ? `
        <div class="kcard" style="border-left:4px solid #94a3b8;">
          <div class="kc-title">Dòng Tiền & Công Nợ</div>
          <div class="kc-val" style="font-size:15px; color:var(--n500);">🔒 Quyền Tài chính / Quản trị</div>
          <div class="kc-sub">Sales chỉ xem giá trị hợp đồng, hạn thanh toán & trạng thái thu hồi</div>
        </div>` : `
        <div class="kcard g">
          <div class="kc-title">Dòng Tiền Thực Thu (Đã Thu Hồi)</div>
          <div class="kc-val font-mono text-emerald-600">${fmtVND(totalCollected)}</div>
          <div class="kc-sub"><i class="fa-solid fa-circle-check text-emerald-500"></i> Đã quy chuẩn hoạch toán</div>
        </div>
        <div class="kcard r">
          <div class="kc-title">Tổng Công Nợ / Dư Nợ Chưa Thu</div>
          <div class="kc-val font-mono text-rose-600">${fmtVND(totalDebt)}</div>
          <div class="kc-sub"><i class="fa-solid fa-triangle-exclamation text-rose-500"></i> Yêu cầu hối thúc thanh toán</div>
        </div>`}
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
                <th>Giá trị hợp đồng (VND)</th>
                ${hideFinance ? '' : `<th>Đã thu hồi (VND)</th>
                <th>Dư nợ / Công nợ (VND)</th>`}
                <th>Hạn thanh toán</th>
                <th>Trạng thái thu hồi</th>
                <th style="text-align:center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${invoicesList.map(inv => {
                const invTotal = invValue(inv);
                let stBadge = 'chip gy';
                let outstanding = invTotal;
                let paidAmt = 0;
                if (inv.status === 'paid') {
                  stBadge = 'chip gr';
                  outstanding = 0;
                  paidAmt = invTotal;
                } else if (inv.status === 'partial') {
                  stBadge = 'chip bl';
                  outstanding = invTotal * 0.5;
                  paidAmt = invTotal * 0.5;
                } else if (inv.status === 'overdue') {
                  stBadge = 'chip rd';
                  outstanding = invTotal;
                  paidAmt = 0;
                }

                // Look up matching client details in memory to satisfy user request on invoice ledger page
                const clientContact = CONTACTS_DB.find(c => c.fullName === inv.contactName) || 
                                      LEADS_DB.find(l => l.name === inv.contactName) || {};
                const clientPhone = clientContact.phone || '';
                const clientEmail = clientContact.email || '';

                return `
                  <tr>
                    <td class="tmono cell-bold text-indigo-600">${inv.number}</td>
                    <td>
                      <div class="font-bold text-gray-800" style="font-size:12.5px;">${esc(inv.contactName)}</div>
                      ${clientPhone ? `<div style="font-size:10.5px; color:#059669; font-weight:600; display:inline-flex; align-items:center; gap:4px; margin-top:2px; background:#ecfdf5; padding:1px 6px; border-radius:3px;"><i class="fa-solid fa-phone text-emerald-500" style="font-size:8px;"></i> SĐT: ${maskPhone(clientPhone)}</div>` : ''}
                      ${clientEmail ? `<div style="font-size:10px; color:#4f46e5; font-weight:500; display:flex; align-items:center; gap:4px; margin-top:1px; opacity:0.85;"><i class="fa-solid fa-envelope" style="font-size:8px;"></i> ${esc(maskEmail(clientEmail))}</div>` : ''}
                      <div style="font-size:9.5px; color:var(--n400); font-family:var(--fm); margin-top:1px;">Biểu giá: ${inv.quoteId}</div>
                    </td>
                    <td class="tmono cell-bold text-gray-700">${fmtVND(invTotal)}</td>
                    ${hideFinance ? '' : `<td class="tmono text-emerald-600">${fmtVND(paidAmt)}</td>
                    <td class="tmono text-rose-600 cell-bold">${outstanding > 0 ? fmtVND(outstanding) : '<span class="text-emerald-600">✓ Sạch nợ</span>'}</td>`}
                    <td class="tmono">${inv.dueDate}</td>
                    <td>
                      <span class="${stBadge} uppercase" style="font-size:10px; font-weight:700;">
                        ${inv.status === 'paid' ? 'Đã Thanh Toán' : inv.status === 'partial' ? 'Đặt cọc 50%' : 'Quá Hạn / Ghi Nợ'}
                      </span>
                    </td>
                    <td style="text-align:center;">
                      <div style="display:flex; justify-content:center; gap:8px;">
                        ${outstanding > 0 ? (hideFinance ? '' : `
                          <button class="btn gr sm" onclick="window.crmApp.recordInvoicePayment('${inv.id}')" title="Thu hồi công nợ trực tiếp" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-cash-register"></i> Thu hồi</button>
                        `) : `
                          <button class="btn sm" onclick="window.crmApp.go('tasks')" title="Khởi chạy Checklist bàn giao / Chăm sóc SLA" style="padding: 4px 8px; font-size: 11px; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; font-weight:700;"><i class="fa-solid fa-truck-ramp-box text-emerald-500"></i> Bàn giao SLA</button>
                        `}
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
      ${renderUnifiedPipelineHeader('quotes')}
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
                      <div style="display:flex; justify-content:center; gap:8px; align-items:center;">
                        <button class="btn gr sm" onclick="window.crmApp.spawnInvoiceFromQuote('${q.id}')" title="Phát hành hóa đơn trực thu"><i class="fa-solid fa-file-invoice"></i> Xuất Hóa Đơn</button>
                        <button class="btn bl sm" onclick="window.crmApp.printQuotation('${q.id}')"><i class="fa-solid fa-print"></i> In / PDF</button>
                        <button class="btn bl sm icon-only" onclick="window.crmApp.deleteQuote('${q.id}')"><i class="fa-solid fa-trash-can"></i></button>
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

export function renderCustomersPage(activeSubTab = 'b2c') {
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
                <th>Sales Phụ trách</th>
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
                  <td>
                    ${(() => {
                      const associatedDeal = DEALS_DB.find(d => d.companyId === cmp.id);
                      let repId = associatedDeal ? associatedDeal.ownerId : null;
                      if (!repId) {
                        const associatedContact = CONTACTS_DB.find(c => c.companyId === cmp.id);
                        repId = associatedContact ? associatedContact.ownerId : null;
                      }
                      const salesUser = USERS_DB.find(u => u.id === (repId || 'usr-sales'));
                      const salesName = salesUser ? salesUser.name : 'Chưa phân bổ';
                      return `<div style="display:flex; align-items:center; gap:6px; font-weight:600; color:var(--n700); font-size:11px;">
                        <i class="fa-solid fa-user-tie text-indigo-500" style="font-size:10px;"></i> ${esc(salesName)}
                      </div>`;
                    })()}
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
                <th>Khách hàng cá nhân (B2C)</th>
                <th>Kênh tiếp cận bảo mật</th>
                <th>Phân khúc khách lẻ</th>
                <th>Ghi chú tiêu dùng</th>
                <th>Nhãn nhóm</th>
                <th>Sales Phụ trách</th>
                <th style="text-align:center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${CONTACTS_DB.map(con => {
                const tagColor = con.tags === 'VIP' ? 'rd' : con.tags === 'Nợ xấu' ? 'am' : con.tags === 'Khách lẻ' ? 'pu' : 'gr';
                // B2C privacy policy: deterministic masking on both channels
                const contactDisplayHtml = `
                  <div style="font-family:var(--fm); line-height: 1.3;">
                    <span class="text-emerald-700 font-bold" style="font-size:11.5px; background: rgba(16,185,129,0.1); padding:2px 5px; border-radius:4px;"><i class="fa-solid fa-phone"></i> ${maskPhone(con.phone)}</span>
                    <div style="font-size:9.5px; color:var(--n400); margin-top:3px;">
                      <i class="fa-solid fa-shield-halved text-rose-500" title="Bảo mật B2C"></i> Email: <em>${esc(maskEmail(con.email))}</em>
                    </div>
                    <div style="font-size:9px; color:var(--n400); margin-top:2px;">🔒 Giải mã trong hồ sơ chi tiết (có ghi Audit)</div>
                  </div>
                `;

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
                    <td>${contactDisplayHtml}</td>
                    <td><span class="chip pu font-bold" style="font-size:10px;"><i class="fa-solid fa-user-tag text-purple-600"></i> ${esc(con.title || 'Khách tiêu dùng')}</span></td>
                    <td><span style="font-size:11.5px; color:var(--n600); font-style:italic;">${esc(con.notes || 'Khách lẻ tự do mua sắm cá nhân')}</span></td>
                    <td><span class="chip ${tagColor} font-bold" style="font-size:10px;"><i class="fa-solid fa-tag"></i> ${esc(con.tags || 'Khách lẻ')}</span></td>
                    <td>
                      ${(() => {
                        const salesUser = USERS_DB.find(u => u.id === (con.ownerId || 'usr-sales'));
                        const salesName = salesUser ? salesUser.name : 'Chưa phân bổ';
                        return `<div style="display:flex; align-items:center; gap:6px; font-weight:600; color:var(--n700); font-size:11px;">
                          <i class="fa-solid fa-user-tie text-indigo-500" style="font-size:10px;"></i> ${esc(salesName)}
                        </div>`;
                      })()}
                    </td>
                    <td style="text-align:center;">
                      <div style="display:inline-flex; gap:4px;">
                        <button class="btn bl icon-only xs" onclick="window.crmApp.openContactEdit('${con.id}')" title="Sửa hồ sơ & thông tin tiếp cận" style="padding:4px 6px;"><i class="fa-solid fa-edit"></i></button>
                        <button class="btn rd icon-only xs" onclick="window.crmApp.deleteContact('${con.id}')" title="Xóa bỏ" style="padding:4px 6px;"><i class="fa-solid fa-trash-can"></i></button>
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
      ${renderUnifiedPipelineHeader('tasks')}
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
      <div class="filter-bar" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="font-family:var(--fd); font-size:15px; font-weight:800; margin:0;"><i class="fa-solid fa-id-badge text-rose-500"></i> Quản Trị Tài Khoản Nhân Sự (${USERS_DB.length})</h3>
          <p style="font-size:11.5px; color:var(--n500); margin-top:2px;">Admin tạo tài khoản cho Sales / Marketers; tài khoản Sales được gửi email kèm thông tin đăng nhập.</p>
        </div>
        <button class="btn pr" id="users-create-btn" onclick="window.crmApp.openCreateUserModal()"><i class="fa-solid fa-user-plus"></i> Tạo Tài Khoản Mới</button>
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
              <th style="text-align:center; min-width:240px;">Quản trị tài khoản (Supabase)</th>
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
                  <td><span class="${rbBadge} font-bold uppercase" style="font-size:10px;">${usr.role === 'manager' ? 'MARKETERS' : usr.role === 'superadmin' ? 'ADMIN' : usr.role === 'sales' ? 'REP' : usr.role}</span></td>
                  <td>
                    <span class="chip ${usr.status==='active'?'gr':'gy'}">${usr.status==='active'?'ĐANG HOẠT ĐỘNG':'ĐÃ KHÓA'}</span>
                  </td>
                  <td style="text-align:center;">
                    <div style="display:flex; justify-content:center; gap:5px; flex-wrap:wrap;">
                      <button class="btn bl sm" title="Sửa hồ sơ tài khoản" onclick="window.crmApp.openUserEditModal('${usr.id}')" style="padding:4px 8px;"><i class="fa-solid fa-pen"></i> Sửa</button>
                      <button class="btn am sm" title="Đặt lại mật khẩu & gửi email" onclick="window.crmApp.resetUserPassword('${usr.id}')" style="padding:4px 8px;"><i class="fa-solid fa-key"></i> MK</button>
                      <button class="btn ${usr.status==='active'?'gy':'gr'} sm" title="${usr.status==='active'?'Khóa':'Kích hoạt'} tài khoản" onclick="window.crmApp.toggleUserStatus('${usr.id}')" style="padding:4px 8px;">
                        ${usr.status==='active' ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-lock-open"></i>'}
                      </button>
                      <button class="btn rd sm" title="Xóa tài khoản khỏi Supabase" onclick="window.crmApp.deleteStaffUser('${usr.id}')" style="padding:4px 8px;"><i class="fa-solid fa-trash-can"></i></button>
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

      <!-- Funnel Conversion Report Section (UAT: TC-022) -->
      <div class="panel" style="margin-bottom:16px; border-left: 4px solid #6366f1;">
        <h3 style="font-family:var(--fd); font-size:14px; font-weight:800; color:#312e81; margin-bottom:14px; border-bottom:1px solid var(--bd); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-filter text-indigo-500"></i> Báo Cáo Hiệu Suất Tỷ Lệ Chuyển Đổi Phễu Đa Tầng (TC-022)
        </h3>
        
        <p style="font-size:12px; color:var(--n500); margin-bottom:14px; line-height:1.4;">
          Số liệu đối soát tự động từ các lớp mốc sự kiện của Phễu. T1 (Nhận thức toàn phần) → T2 (Chấm Điểm & Phân loại) → T3 (Dòng Cơ hội thương đãi) → T4 (Quyết toán thanh quỹ thắng chi).
        </p>

        <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:stretch;">
          <!-- T1 -->
          <div style="flex:1; min-width:180px; padding:14px; background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div>
              <div style="font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">T1: Tiếp Cận (Awareness)</div>
              <p style="font-family:var(--fm); font-size:24px; font-weight:800; color:#1e293b; margin:6px 0;">
                ${LEADS_DB.length}
              </p>
            </div>
            <span class="chip gy" style="font-size:9.5px; font-weight:700; width:fit-content; margin:0 auto;">100% Phễu sơ khởi</span>
          </div>

          <!-- Arrow 1 -->
          <div style="display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:16px; font-weight:bold;">
            <i class="fa-solid fa-angle-right"></i>
          </div>

          <!-- T2 -->
          <div style="flex:1; min-width:180px; padding:14px; background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div>
              <div style="font-size:11px; font-weight:800; color:#1e40af; text-transform:uppercase; letter-spacing:0.5px;">T2: Đánh Giá (Scoring)</div>
              <p style="font-family:var(--fm); font-size:24px; font-weight:800; color:#1d4ed8; margin:6px 0;">
                ${LEADS_DB.filter(l => l.status !== 'new' && l.status !== 'pending_assignment').length}
              </p>
            </div>
            <span class="chip bl font-bold" style="font-size:9.5px; width:fit-content; margin:0 auto;">
              ${LEADS_DB.length > 0 ? ((LEADS_DB.filter(l => l.status !== 'new' && l.status !== 'pending_assignment').length / LEADS_DB.length) * 100).toFixed(1) : 0}% Chuyển đổi
            </span>
          </div>

          <!-- Arrow 2 -->
          <div style="display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:16px; font-weight:bold;">
            <i class="fa-solid fa-angle-right"></i>
          </div>

          <!-- T3 -->
          <div style="flex:1; min-width:180px; padding:14px; background-color:#faf5ff; border:1px solid #e9d5ff; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div>
              <div style="font-size:11px; font-weight:800; color:#6b21a8; text-transform:uppercase; letter-spacing:0.5px;">T3: Đề Xuất (Sales)</div>
              <p style="font-family:var(--fm); font-size:24px; font-weight:800; color:#7e22ce; margin:6px 0;">
                ${DEALS_DB.filter(d => d.stage !== 'prospecting' && d.stage !== 'qualified').length}
              </p>
            </div>
            <span class="chip pu font-bold" style="font-size:9.5px; width:fit-content; margin:0 auto;">
              ${LEADS_DB.filter(l => l.status !== 'new' && l.status !== 'pending_assignment').length > 0 ? ((DEALS_DB.filter(d => d.stage !== 'prospecting' && d.stage !== 'qualified').length / LEADS_DB.filter(l => l.status !== 'new' && l.status !== 'pending_assignment').length) * 100).toFixed(1) : 0}% Chuyển đổi
            </span>
          </div>

          <!-- Arrow 3 -->
          <div style="display:flex; align-items:center; justify-content:center; color:#cbd5e1; font-size:16px; font-weight:bold;">
            <i class="fa-solid fa-angle-right"></i>
          </div>

          <!-- T4 -->
          <div style="flex:1; min-width:180px; padding:14px; background-color:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div>
              <div style="font-size:11px; font-weight:800; color:#166534; text-transform:uppercase; letter-spacing:0.5px;">T4: Quyết Toán (Payment)</div>
              <p style="font-family:var(--fm); font-size:24px; font-weight:800; color:#15803d; margin:6px 0;">
                ${DEALS_DB.filter(d => d.stage === 'closed_won').length}
              </p>
            </div>
            <span class="chip gr font-bold" style="font-size:9.5px; width:fit-content; margin:0 auto;">
              ${DEALS_DB.filter(d => d.stage !== 'prospecting' && d.stage !== 'qualified').length > 0 ? ((DEALS_DB.filter(d => d.stage === 'closed_won').length / DEALS_DB.filter(d => d.stage !== 'prospecting' && d.stage !== 'qualified').length) * 100).toFixed(1) : 0}% Chuyển đổi
            </span>
          </div>
        </div>

        <div style="background-color:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; margin-top:14px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="font-size:12.5px; color:#334155; display:flex; align-items:center; gap:6px;">
            🏁 <strong style="color:#0f172a;">Tỷ lệ thắng phễu lũy kế (T1 → T4 Closed Won):</strong> 
            <span style="font-size:14.5px; font-weight:900; color:#16a34a; font-family:var(--fm); background:#dcfce7; padding:2px 8px; border-radius:4px;">
              ${LEADS_DB.length > 0 ? ((DEALS_DB.filter(d => d.stage === 'closed_won').length / LEADS_DB.length) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div style="font-size:11px; color:#64748b; font-style:italic;">
            (Chỉ số phễu thực thi dựa trên dòng quan hệ dữ liệu liên phòng ban)
          </div>
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

/* ==========================================================================
   7c. SALES UTILITY TOOLKIT & MULTI-FEATURE HUBS
   ========================================================================== */

export function renderSalesToolkitPage(plannerDb, diagnosisAnswers, roiInputs, emailTemplates, dealsDb) {
  const activeTab = window.TOOLKIT_TAB_STATE || 'planner';
  
  return `
    <div class="page-container animate-fadeIn">
      <!-- Hub Header & Toolkit Tab Switcher -->
      <div class="panel" style="background: linear-gradient(135deg, #1e1b4b, #312e81); color: white; border-radius: var(--rs); padding: 24px; position: relative;">
        <div style="max-width: 750px;">
          <h2 style="font-family: var(--fd); font-size: 20px; font-weight: 850; color: #fbbf24;"><i class="fa-solid fa-wand-magic-sparkles"></i> Hộp Công Cụ Bổ Trợ Sales & Playbook Hub</h2>
          <p style="font-size: 13px; color: #c7d2fe; margin-top: 6px; line-height:1.5;">
            Trang bị các công cụ thực chiến đỉnh cao nhằm hỗ trợ nhân sự Sales chuẩn bị thương lượng chốt hời, lên sổ Daily Planner, chẩn đoán chi tiết nút thắt Pain Point của đối tác, thẩm định ROI thực chứng cho sếp và customize email tự động chuẩn hóa biến thương vụ.
          </p>
        </div>
        
        <!-- Tab Selector Switcher -->
        <div style="display: flex; gap: 8px; margin-top: 20px; flex-wrap: wrap;">
          <button class="btn" id="tk-tab-planner" style="display-flex; align-items:center; gap:6px; background: ${activeTab === 'planner' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; color: ${activeTab === 'planner' ? '#1e1b4b' : 'white'}; border: 1px solid ${activeTab === 'planner' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}; font-weight: 700; font-size:11.5px; padding: 6px 12px;">
            <i class="fa-solid fa-calendar-day"></i> Daily Planner
          </button>
          <button class="btn" id="tk-tab-diagnosis" style="display-flex; align-items:center; gap:6px; background: ${activeTab === 'diagnosis' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; color: ${activeTab === 'diagnosis' ? '#1e1b4b' : 'white'}; border: 1px solid ${activeTab === 'diagnosis' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}; font-weight: 700; font-size:11.5px; padding: 6px 12px;">
            <i class="fa-solid fa-stethoscope"></i> Pain Diagnosis
          </button>
          <button class="btn" id="tk-tab-roi" style="display-flex; align-items:center; gap:6px; background: ${activeTab === 'roi' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; color: ${activeTab === 'roi' ? '#1e1b4b' : 'white'}; border: 1px solid ${activeTab === 'roi' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}; font-weight: 700; font-size:11.5px; padding: 6px 12px;">
            <i class="fa-solid fa-chart-line"></i> ROI Calculator
          </button>
          <button class="btn" id="tk-tab-email" style="display-flex; align-items:center; gap:6px; background: ${activeTab === 'email' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; color: ${activeTab === 'email' ? '#1e1b4b' : 'white'}; border: 1px solid ${activeTab === 'email' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}; font-weight: 700; font-size:11.5px; padding: 6px 12px;">
            <i class="fa-solid fa-envelope-open-text"></i> Email Library
          </button>
          <button class="btn" id="tk-tab-quiz" style="display-flex; align-items:center; gap:6px; background: ${activeTab === 'quiz' ? '#fbbf24' : 'rgba(255,255,255,0.08)'}; color: ${activeTab === 'quiz' ? '#1e1b4b' : 'white'}; border: 1px solid ${activeTab === 'quiz' ? '#fbbf24' : 'rgba(255,255,255,0.15)'}; font-weight: 700; font-size:11.5px; padding: 6px 12px;">
            <i class="fa-solid fa-graduation-cap"></i> Pre-Meeting Quiz
          </button>
        </div>
      </div>

      <!-- Active Content Rendering Pane -->
      <div class="tk-active-pane">
        ${activeTab === 'planner' ? renderSubTabPlanner(plannerDb) : ''}
        ${activeTab === 'diagnosis' ? renderSubTabDiagnosis(diagnosisAnswers) : ''}
        ${activeTab === 'roi' ? renderSubTabRoi(roiInputs) : ''}
        ${activeTab === 'email' ? renderSubTabEmail(emailTemplates, dealsDb) : ''}
        ${activeTab === 'quiz' ? renderSubTabQuiz() : ''}
      </div>
    </div>
  `;
}

function renderSubTabPlanner(plannerDb) {
  const mits = plannerDb.filter(p => p.isMIT);
  const others = plannerDb.filter(p => !p.isMIT);

  return `
    <div class="db-grid-2x animate-fadeIn" style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1.2fr; gap:16px;">
      <!-- Input Planner Card -->
      <div class="panel" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 style="font-family: var(--fd); font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--indigo-800);">
            <i class="fa-solid fa-calendar-plus text-indigo-500"></i> Lên Lịch Trình Tác Nghiệp Bán Hàng
          </h3>
          
          <div class="auth-body">
            <div class="fg" style="margin-bottom:12px;">
              <label style="font-weight:700;">Nội dung kế hoạch / Tác nghiệp cần hoàn tất *</label>
              <input type="text" id="planner-task-title" placeholder="Ví dụ: Gọi điện báo giá thương lượng ERP bên VNPT..." style="width:100%;" />
            </div>
            
            <div class="fr2" style="display:flex; gap:12px; margin-bottom:12px;">
              <div class="fg" style="flex:1;">
                <label style="font-weight:700;">Giờ thực thi / Nhắc hẹn</label>
                <input type="text" id="planner-task-time" value="10:00" placeholder="Ví dụ: 10:00, 15:30..." style="width:100%;" />
              </div>
              <div class="fg" style="display: flex; align-items: center; justify-content: start; flex:1.2; margin-top:24px;">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 700; font-size: 12px; margin:0;">
                  <input type="checkbox" id="planner-task-is-mit" value="1" style="width: auto; margin:0;" />
                  <span>Việc Cực Kỳ Quan Trọng (MIT) ⭐</span>
                </label>
              </div>
            </div>
            
            <button class="btn pr" id="planner-add-task-btn" style="width:100%;">
              <i class="fa-solid fa-plus"></i> Thêm vào Sổ Daily Planner
            </button>
          </div>
        </div>
        
        <div style="margin-top: 24px; font-size: 12px; color: var(--n500); border-top: 1px dashed var(--bd); padding-top: 12px; line-height:1.5;">
          <p>💡 <strong>Lời khuyên Sáng tạo từ Aura Coach:</strong> Để tối đa tỷ lệ chốt sales, bạn không nên phân bổ quá 3 MITs (Most Important Tasks) mỗi ngày. Tập trung hoàn tất dứt điểm các mục quan trọng trước khi giải quyết việc phát sinh.</p>
        </div>
      </div>

      <!-- Planner Lists Display -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- MIT Part -->
        <div class="panel" style="border-left: 4px solid var(--amber-500); background-color: #fffbeb;">
          <h3 style="font-family: var(--fd); font-size: 13.5px; font-weight: 700; margin-bottom: 12px; color: #b45309; display:flex; justify-content:space-between; align-items:center;">
            <span><i class="fa-solid fa-star text-amber-500 animate-pulse"></i> VIỆC CỰC KỲ QUAN TRỌNG HÔM NAY (MITs)</span>
            <span class="chip font-mono font-bold" style="background:#fef3c7; color:#b45309; font-size:10px;">${mits.length}/3 ghém</span>
          </h3>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${mits.length === 0 ? `
              <div style="padding: 16px; text-align:center; color: #d97706; font-size: 12px; font-style:italic;">
                Chưa có nhiệm vụ ghim làm MIT ngày hôm nay. Hãy ghim một việc!
              </div>
            ` : mits.map(task => `
              <div style="background: white; border: 1px solid #fde68a; border-radius: var(--rs); padding: 12px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                  <button onclick="window.crmApp.togglePlannerTask('${task.id}')" style="background:none; border:none; padding:4px; font-size:16px; cursor:pointer; color:${task.completed ? '#16a34a' : 'var(--n400)'};">
                    <i class="${task.completed ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i>
                  </button>
                  <div>
                    <span style="${task.completed ? 'text-decoration: line-through; color: var(--n400);' : 'font-weight:700; color:#1e293b;'}; font-size:12.5px;">${esc(task.title)}</span>
                    <div style="font-size: 10px; color: var(--n500); margin-top:2px;"><i class="fa-solid fa-clock"></i> Thời gian: <span class="tmono" style="font-weight:700;">${task.time}</span></div>
                  </div>
                </div>
                <button class="btn rd sm icon-only" onclick="window.crmApp.deletePlannerTask('${task.id}')" title="Xóa tác vụ" style="background:transparent; border:none; color:var(--rose-600);"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- General Schedule -->
        <div class="panel">
          <h3 style="font-family: var(--fd); font-size: 13.5px; font-weight: 700; margin-bottom: 12px; color: var(--indigo-800);">
            <i class="fa-solid fa-business-time text-indigo-500"></i> LỊCH TRÌNH KHÁC & REMINDERS
          </h3>
          
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${others.length === 0 ? `
              <div style="padding: 16px; text-align:center; color: var(--n400); font-size: 12px; font-style:italic;">
                Chưa có lịch trình bổ trợ nào khác. Hãy chuẩn bị tươm tất!
              </div>
            ` : others.map(task => `
              <div style="background: var(--n50); border: 1px solid var(--bd); border-radius: var(--rs); padding: 10px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px; flex:1;">
                  <button onclick="window.crmApp.togglePlannerTask('${task.id}')" style="background:none; border:none; padding:4px; font-size:15px; cursor:pointer; color:${task.completed ? '#16a34a' : 'var(--n400)'};">
                    <i class="${task.completed ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i>
                  </button>
                  <div>
                    <span style="${task.completed ? 'text-decoration: line-through; color: var(--n400);' : 'font-weight:500; color:var(--n800);'}; font-size:12.5px;">${esc(task.title)}</span>
                    <p style="font-size: 10px; color: var(--n400); margin-top:2px;"><i class="fa-solid fa-bell"></i> Sắp nhắc lúc: <span class="tmono">${task.time}</span></p>
                  </div>
                </div>
                <button class="btn rd sm icon-only" onclick="window.crmApp.deletePlannerTask('${task.id}')" title="Xóa tác vụ" style="background:transparent; border:none; color:var(--rose-600);"><i class="fa-solid fa-trash-can"></i></button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

const DIAGNOSIS_QUESTIONS = [
  {
    q: "Doanh nghiệp xử lý bao nhiêu Leads/Khách hàng tiềm năng hàng tháng?",
    o: ["Dưới 50 leads (Quy mô nhỏ)", "Từ 50 - 200 leads (Đang tăng trưởng)", "Từ 200 - 1000 leads (Lượng lớn)", "Đại doanh nghiệp > 1000 leads (Khổng lồ)"]
  },
  {
    q: "Thất thoát leads trước khi chốt đơn thường nằm ở khâu nào?",
    o: ["Bỏ quên liên hệ, không gọi lại kịp", "Không biết lead từ nguồn quảng cáo nào để tối ưu", "Hết hàng hoặc tư vấn sai giá", "Mất kết nối sau khi gửi báo giá thủ công"]
  },
  {
    q: "Quy trình lập Báo giá (Quotation) đang tốn bao lâu thời gian?",
    o: ["Làm file Excel thủ công mất nửa ngày", "Gặp lỗi sai lệch tính toán điều khoản chiết khấu", "Phê duyệt nội bộ của sếp siêu chậm", "Nhanh chóng nhờ hệ thống tự động hóa"]
  },
  {
    q: "Bao nhiêu phần trăm hóa đơn tài chính bị quá hạn thanh toán / thu hồi nợ trễ nải?",
    o: ["Từ 5% - 15% (Kiểm soát khá ổn)", "Từ 15% - 30% (Nghiêm trọng, đọng vốn)", "Trên 30% (Nguy khốn dòng tiền thực thu)", "Không nắm được con số chi tiết để theo dõi"]
  },
  {
    q: "Đội ngũ chăm sóc khách hàng / CSKH sau bán xử lý phàn nàn thế nào?",
    o: ["Qua chat zalo cá nhân, hay bị trôi tin nhắn", "Chưa có cam kết rõ ràng SLA phản hồi sự cố", "Khách hàng thường xuyên phàn nàn phản ứng chậm", "Kiểm soát mượt mà qua hệ thống Ticket tập trung"]
  },
  {
    q: "Sự liên đới phối hợp giữa phòng Marketing, Sales và Support thế nào?",
    o: ["Độc lập hoàn toàn, dữ liệu cát cứ cát rạn", "Sales đổ lỗi khách kém, Marketing đổ lỗi Sales lười", "Bàn giao dữ liệu thủ công qua Viber/Zalo group", "Liên thông đồng bộ trên 1 nền tảng duy nhất"]
  },
  {
    q: "Khả năng đo lường chỉ số ROI hoạt động tiếp thị quảng cáo?",
    o: ["Mơ hồ, chỉ tính cảm quan doanh số", "Biết chi phí tổng, không lọc được ROI từng chiến dịch", "Tốn nhiều tuần để tổng hợp báo cáo sếp", "Realtime hoàn toàn qua biểu đồ báo cáo thông minh"]
  },
  {
    q: "Lập kịch bản Email tiếp thị trong doanh nghiệp hiện tại ra sao?",
    o: ["Kinh doanh viên tự viết tùy tiện", "Copy-paste thô sơ từ file Word chia sẻ", "Chưa có quy chuẩn thư viện email mẫu", "Thư viện email tích hợp tự động phân rã biến số"]
  },
  {
    q: "Ngân sách tối đa dành cho việc số hóa CRM / ERP vận hành năm nay?",
    o: ["Dưới 50 Triệu VND (Khởi nghiệp tiết kiệm)", "50 Triệu - 200 Triệu VND (Doanh nghiệp vừa và nhỏ)", "200 Triệu - 1 Tỷ VND (Doanh nghiệp quy chuẩn)", "Trên 1 Tỷ VND (Đại tập đoàn tùy biến sâu)"]
  },
  {
    q: "Kế hoạch phân bổ nhân sự quản lý khi đưa phần mềm mới vào?",
    o: ["Kinh doanh kiêm nhiệm không có chuyên môn", "Yêu cầu thuê ngoài vận hành trọn gói", "Có bộ phận IT / Admin sẵn sàng túc trực tiếp nhận chuyển giao", "Mọi người tự làm tự học không cần quản trị"]
  }
];

function renderSubTabDiagnosis(diagnosisAnswers) {
  const answeredCount = diagnosisAnswers.filter(a => a !== null).length;
  const isFinished = answeredCount === 10;
  
  let resultHtml = '';
  if (isFinished) {
    const bigBizCount = diagnosisAnswers.reduce((sum, ansIdx, qIdx) => {
      if (qIdx === 0 && ansIdx >= 2) return sum + 1;
      if (qIdx === 8 && ansIdx >= 2) return sum + 1;
      return sum;
    }, 0);
    
    const csSupportBottlenecks = diagnosisAnswers[4] <= 2 || diagnosisAnswers[5] === 0;
    
    let recProduct = 'Aura CRM Core Enterprise Suite';
    let recPrice = '120000000';
    let recCode = 'PRO-ERP-2026';
    let description = 'Hệ sinh thái đồng bộ liên thông phân hệ Leads, Pipeline, Báo Giá, Hóa đơn tài chính, đối chiếu dòng tiền và rà soát nợ phải thu.';
    
    if (bigBizCount >= 2) {
      recProduct = 'Aura Enterprise ERP Cloud Pack';
      recPrice = '350000000';
      recCode = 'ENT-CLOUD-ERP';
      description = 'Đại diện giải pháp ERP tích hợp sâu, tùy biến trường dữ liệu, đồng bộ sổ cái kế toán tự động, lập báo cáo phân phối đa chi nhánh.';
    } else if (csSupportBottlenecks) {
      recProduct = 'Aura CS Customer Satisfaction Hub';
      recPrice = '75000000';
      recCode = 'AURA-CS-SLA';
      description = 'Tập trung phân hệ Ticketing hỗ trợ CSKH, kiểm soát SLA cam kết 4h phản hồi, giảm thiểu tin nhắn trôi lạc, thu CSAT chuyên nghiệp.';
    } else {
      recProduct = 'Aura CRM Standard Cloud Suite';
      recPrice = '45000000';
      recCode = 'AURA-STD-SaaS';
      description = 'Thích hợp cho đội nhóm vừa và nhỏ, quản lý phễu Kanban mượt mà, email template thư viện tốt, tính toán hóa đơn dư nợ.';
    }

    resultHtml = `
      <div class="panel text-slate-800 animate-fadeIn" style="margin-top: 16px; background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: var(--rs); padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:start; border-bottom: 2px solid #bbf7d0; padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <span class="chip font-bold" style="background:#dcfce7; color:#16a34a; font-size:11px; padding: 4px 12px;"><i class="fa-solid fa-circle-check"></i> KẾT QUẢ CHẨN ĐOÁN HOÀN TẤT</span>
            <h3 style="font-family: var(--fd); font-size:16px; font-weight:850; color:#14532d; margin-top:6px;">Khuyến Nghị Thiết Kế Vận Hành Cho Đối Tác</h3>
          </div>
          <button class="btn bl sm" id="diagnosis-reset-btn" style="border-color:#86efac; color:#15803d; font-weight:700;"><i class="fa-solid fa-rotate-left"></i> Chẩn đoán lại</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:stretch;">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <p style="font-size:12.5px; line-height:1.6;">🛡️ <strong>Kịch bản sơ bộ điểm nghẽn:</strong> Dữ liệu tiếp cận của doanh nghiệp hiển thị sự suy hao trong khâu đàm phán gửi báo giá thủ công. Sự phối hợp giữa các khâu còn rời rạc trực trực làm gia tăng chu kỳ deal và thất thoát nợ xấu.</p>
            
            <div style="background-color: white; border: 1px solid #dcfce7; border-radius:var(--rs); padding:12px; font-size:11.5px;">
              <p style="font-weight:700; color:#14532d; margin-bottom:4px;"><i class="fa-solid fa-shield-halved text-emerald-500"></i> Lộ trình chuyển đổi số đề xuất:</p>
              <ul style="margin-left: 18px; list-style-type: decimal; line-height: 1.6; display:flex; flex-direction:column; gap:4px;">
                <li>Quy chuẩn phễu Pipeline thành quy trình Kanban tối ưu.</li>
                <li>Thực thi Email Template Library khớp tự động sáp nhập sáp tắp.</li>
                <li>Hối thúc nợ hóa đơn liên liên bằng bảng tự tính công nợ.</li>
                <li>Sử dụng Pre-meeting Quiz bồi dưỡng kinh doanh viên tinh nhuệ.</li>
              </ul>
            </div>
          </div>

          <div style="background-color: white; border: 1.5px solid #86efac; border-radius: var(--rs); padding:16px; display:flex; flex-direction:column; justify-content:space-between; box-shadow: 0 4px 6px rgba(0,0,0,0.02)">
            <div>
              <p style="font-size:10px; color:var(--n500); font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">Gói Giải Pháp Phù Hợp Tối Ưu</p>
              <h4 style="font-family:var(--fd); font-size:16px; font-weight:800; color:var(--indigo-800); margin-top:2px;">${recProduct}</h4>
              <p style="font-size:11.5px; color:var(--n600); margin-top:4px; line-height:1.5;">${description}</p>
            </div>

            <div style="border-top:1px dashed #f1f5f9; padding-top:12px; margin-top:16px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-size:10px; color:var(--n400); display:block;">Đơn giá cam kết:</span>
                <strong class="tmono text-emerald-600" style="font-size:15px; font-weight:800;">${fmtVND(parseInt(recPrice))}</strong>
              </div>
              <button class="btn pr font-bold" onclick="window.crmApp.convertDiagnosisToQuote('${recCode}', '${esc(recProduct)}', ${recPrice})" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-file-invoice-dollar"></i> Tạo Báo Giá Ngay</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="margin-top: 16px;">
      ${resultHtml}

      <div class="panel" style="margin-top: 16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--bd); padding-bottom:12px;">
          <div>
            <h3 style="font-family: var(--fd); font-size: 15px; font-weight: 700; color: var(--n800);">
              <i class="fa-solid fa-clipboard-question text-indigo-500"></i> Khảo sát Chẩn Đoán Điểm Nghẽn & Đề Xuất Sản Phẩm (Pain Point Survey)
            </h3>
            <p style="font-size: 11.5px; color: var(--n500); margin-top: 2px;">Vui lòng trả lời 10 câu hỏi để AI phân tích đề xuất gói dịch vụ lý tưởng cấu trúc theo rủi ro của khách.</p>
          </div>
          <span class="chip font-bold text-slate-700 font-mono" id="diagnosis-answered-chip" style="background:var(--n100); font-size:11px;">Hoàn thành: ${answeredCount}/10</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${DIAGNOSIS_QUESTIONS.map((q, qIdx) => {
            const chosenValue = diagnosisAnswers[qIdx];
            return `
              <div style="background: var(--n50); padding: 12px; border-radius: var(--rs); border: 1.5px solid ${chosenValue !== null ? 'var(--indigo-300)' : 'var(--bd)'};">
                <p style="font-weight: 700; font-size: 12.5px; color: var(--n850); margin-bottom: 8px;">
                  <strong class="text-indigo-600">Câu ${qIdx + 1}:</strong> ${esc(q.q)}
                </p>
                <div style="font-size: 11.5px; display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
                  ${q.o.map((option, oIdx) => {
                    const isChecked = chosenValue === oIdx;
                    return `
                      <label style="display:flex; align-items:center; gap:8px; padding:6px 10px; background: white; border: 1.5px solid ${isChecked ? 'var(--b600)' : 'var(--bd)'}; border-radius:var(--rs); cursor:pointer; font-weight: ${isChecked ? '700' : 'normal'}; transition: all 0.15s ease; margin:0;">
                        <input type="radio" name="dg-q-${qIdx}" class="diagnosis-radio-btn" data-q-idx="${qIdx}" data-o-idx="${oIdx}" ${isChecked ? 'checked' : ''} style="width: auto; cursor:pointer; margin:0;" />
                        <span>${esc(option)}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 24px; display:flex; justify-content:center; gap:12px;">
          <button class="btn pr font-bold" id="diagnosis-submit-btn" style="padding: 10px 30px; font-size:13.5px;"><i class="fa-solid fa-stethoscope"></i> Bắt đầu Phần tích thuật toán</button>
        </div>
      </div>
    </div>
  `;
}

function renderSubTabRoi(roiInputs) {
  const rev = roiInputs.revenue;
  const staff = roiInputs.salesStaff;
  const hours = roiInputs.wasteHours;
  const salary = roiInputs.salary;
  const closeRate = roiInputs.closeRate / 100;
  const dVal = roiInputs.dealValue;
  const cost = roiInputs.crmCost;

  const savedHoursPerDay = Math.min(hours, 1.5);
  const totalSavedHoursYearly = Math.round(savedHoursPerDay * staff * 22 * 12);
  
  const hourSalaryRate = salary / 176;
  const timeSavedValueYearly = Math.round(totalSavedHoursYearly * hourSalaryRate);

  const additionalCloseRatePct = closeRate * 0.20;
  const estimatedDealsProcessedYearly = rev / dVal;
  const extraDealsClosedYearly = Math.round(estimatedDealsProcessedYearly * additionalCloseRatePct);
  const additionalRevenueYearly = extraDealsClosedYearly * dVal;

  const totalValueGainedYearly = additionalRevenueYearly + timeSavedValueYearly;
  const roiPct = Math.round(((totalValueGainedYearly - cost) / cost) * 100);
  const paybackMonths = Math.round((cost / (totalValueGainedYearly / 12)) * 10) / 10;

  return `
    <div class="db-grid-2x animate-fadeIn" style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1.2fr; gap:16px;">
      <!-- Inputs Column -->
      <div class="panel" style="display:flex; flex-direction:column; gap:12px;">
        <h3 style="font-family: var(--fd); font-size: 14.5px; font-weight: 700; margin-bottom: 2px; color: var(--n800);">
          <i class="fa-solid fa-calculator text-indigo-500"></i> Nhập Thông Số Tài Chính Đối Tác
        </h3>
        <p style="font-size:11px; color:var(--n500); margin-bottom:12px;">Cài đặt các hằng số mô hình kinh doanh của khách để hiển thị biểu thức ROI.</p>

        <div class="auth-body" style="display:flex; flex-direction:column; gap:10px;">
          <div class="fg">
            <label style="font-weight:700;">Tổng Doanh thu Doanh nghiệp / Năm (VND) *</label>
            <input type="number" id="roi-inp-revenue" value="${rev}" required style="width:100%;" />
            <span style="font-size:10px; color:var(--b600); font-weight:700;"><i class="fa-solid fa-wallet"></i> Quy đổi: ${fmtVND(rev)}</span>
          </div>

          <div class="fr2" style="display:flex; gap:12px;">
            <div class="fg" style="flex:1;">
              <label style="font-weight:700;">Lương Sales TB (đ/tháng)</label>
              <input type="number" id="roi-inp-salary" value="${salary}" style="width:100%;" />
            </div>
            <div class="fg" style="flex:1;">
              <label style="font-weight:700;">Tỉ lệ chốt Deals (%)</label>
              <input type="number" id="roi-inp-closerate" value="${roiInputs.closeRate}" style="width:100%;" />
            </div>
          </div>

          <div class="fr2" style="display:flex; gap:12px;">
            <div class="fg" style="flex:1;">
              <label style="font-weight:700;">Số nhân sự Sales</label>
              <input type="number" id="roi-inp-staff" value="${staff}" style="width:100%;" />
            </div>
            <div class="fg" style="flex:1;">
              <label style="font-weight:700;">Hao phí báo biểu/Sales/ngày (h)</label>
              <input type="number" step="0.1" id="roi-inp-hours" value="${hours}" style="width:100%;" />
            </div>
          </div>

          <div class="fg">
            <label style="font-weight:700;">Giá trị bình quân thương vụ (VND) *</label>
            <input type="number" id="roi-inp-dealvalue" value="${dVal}" style="width:100%;" />
            <span style="font-size:10px; color:var(--b600); font-weight:700;">Quy đổi: ${fmtVND(dVal)}</span>
          </div>

          <div class="fg" style="background-color: var(--n50); padding: 10px; border:1px solid #c7d2fe; border-radius:var(--rs);">
            <label style="color:var(--indigo-800); font-weight:700;"><i class="fa-solid fa-circle-dollar-to-slot"></i> Chi phí đầu tư Aura CRM đề xuất (VND) *</label>
            <input type="number" id="roi-inp-crmcost" value="${cost}" style="width:100%;" />
            <span style="font-size:10px; color:var(--b600); font-weight:700;">Dự toán: ${fmtVND(cost)}</span>
          </div>
        </div>
      </div>

      <!-- Outputs Display Column -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="panel" style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 1.5px solid #bfdbfe; color:#1e3a8a; display:flex; flex-direction:column; justify-content:space-between; height:100%;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:start; border-bottom:1.5px solid #bfdbfe; padding-bottom:8px; margin-bottom:14px;">
              <h3 style="font-family: var(--fd); font-size: 14.5px; font-weight: 850; color: #1e3a8a;">
                <i class="fa-solid fa-award"></i> THẨM ĐỊNH HIỆU QUẢ HOÀN VỐN (ROI REPORT)
              </h3>
              <span class="chip font-bold uppercase font-mono" style="background:#bfdbfe; color:#1e3a8a; font-size:9.5px;">Biểu đồ dự toán tài khóa</span>
            </div>

            <!-- Bento Metrics -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div style="background:white; padding:10px; border-radius:var(--rs); border:1px solid #bfdbfe;">
                <span style="font-size:10px; color:#1e3a8a; display:block;">Thời gian Sales giải phóng:</span>
                <strong style="font-size:14.5px; font-weight:800; color:#2563eb;" class="tmono">${totalSavedHoursYearly.toLocaleString()} giờ / năm</strong>
                <span style="font-size:8.5px; color:var(--n500); display:block; margin-top:2px;">~${Math.round(savedHoursPerDay * 22)} tiếng/sales/tháng</span>
              </div>

              <div style="background:white; padding:10px; border-radius:var(--rs); border:1px solid #bfdbfe;">
                <span style="font-size:10px; color:#1e3a8a; display:block;">Giá trị thời gian phục dựng:</span>
                <strong style="font-size:14.5px; font-weight:800; color:#16a34a;" class="tmono">${fmtVND(timeSavedValueYearly)}</strong>
                <span style="font-size:8.5px; color:var(--n500); display:block; margin-top:2px;">Quy chuẩn theo quỹ lương phòng</span>
              </div>

              <div style="background:white; padding:10px; border-radius:var(--rs); border:1px solid #bfdbfe; grid-column: span 2;">
                <span style="font-size:10.5px; color:#1e3a8a; display:block;">Doanh thu thăng tiến thêm (Tăng trưởng tỷ lệ chốt sales 20%):</span>
                <strong style="font-size:16.5px; font-weight:800; color:#059669;" class="tmono">+ ${fmtVND(additionalRevenueYearly)}</strong>
                <span style="font-size:9px; color:var(--n500); display:block; margin-top:2px;">Nhờ tự động hóa quy trình, sales chốt thêm <strong class="text-emerald-600">${extraDealsClosedYearly} deals</strong> thắng</span>
              </div>
            </div>

            <!-- ROI and Payback Period -->
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:12px; margin-top:16px;">
              <div style="background: linear-gradient(135deg, #059669, #047857); color:white; padding:12px; border-radius:var(--rs); box-shadow: 0 4px 10px rgba(4,120,87,0.15); text-align:center;">
                <span style="font-size:9px; opacity:0.8; display:block;">TỶ SUẤT SINH LỜI SẢN PHẨM (ROI)</span>
                <strong style="font-size:24px; font-weight:900;" class="tmono">${roiPct}%</strong>
                <span style="font-size:8.5px; opacity:0.8; display:block; margin-top:2px;">Doanh thu dôi ra vượt chi đầu tư</span>
              </div>

              <div style="background:#1e3a8a; color:white; padding:12px; border-radius:var(--rs); text-align:center;">
                <span style="font-size:9px; opacity:0.8; display:block;">DỰ TÍNH HÒA VỐN SAU</span>
                <strong style="font-size:22px; font-weight:800;" class="tmono">${paybackMonths} tháng</strong>
                <span style="font-size:8.5px; opacity:0.8; display:block; margin-top:2px;">Thời điểm thu hồi vốn ròng</span>
              </div>
            </div>
          </div>

          <div style="border-top:1px dashed #bfdbfe; padding-top:12px; margin-top:16px; display:flex; justify-content:space-between; align-items:center;">
            <p style="font-size:10px; color:#475569; width: 60%; line-height:1.4;">Chắp cánh sales thuyết phục đại hội đồng cổ đông phê duyệt.</p>
            <button class="btn pr font-bold" onclick="window.print()" style="background:#1e3a8a; border-color:#1e3a8a; color:white; font-size:10.5px; padding: 4px 10px;"><i class="fa-solid fa-print"></i> In Thẩm Định ROI</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSubTabEmail(emailTemplates, dealsDb) {
  const catFilter = window.EMAIL_TPL_FILTER_CAT || 'all';
  const dtypeFilter = window.EMAIL_TPL_FILTER_DEAL_TYPE || 'all';

  // Filter templates list based on stage and deal type segmentations
  const filteredTemplates = emailTemplates.filter(tpl => {
    const matchesCat = (catFilter === 'all' || tpl.category === catFilter);
    const matchesDtype = (dtypeFilter === 'all' || tpl.dealType === 'all' || !tpl.dealType || tpl.dealType === dtypeFilter);
    return matchesCat && matchesDtype;
  });

  const curTplId = window.ACTIVE_TPL_ID || (filteredTemplates[0] ? filteredTemplates[0].id : '');
  let activeTpl = filteredTemplates.find(t => t.id === curTplId);
  if (!activeTpl && filteredTemplates.length > 0) {
    activeTpl = filteredTemplates[0];
  }

  const selectedDealId = window.ACTIVE_TPL_DEAL_ID || (dealsDb[0] ? dealsDb[0].id : '');
  const selectedDeal = dealsDb.find(d => d.id === selectedDealId) || dealsDb[0];

  let resolvedSubject = activeTpl ? activeTpl.subject : '';
  let resolvedBody = activeTpl ? activeTpl.body : '';

  if (activeTpl && selectedDeal) {
    const formatDealVal = selectedDeal.value ? fmtVND(selectedDeal.value) : (selectedDeal.amount ? fmtVND(selectedDeal.amount) : '0 ₫');
    
    const reps = {
      '{{KHÁCH_HÀNG}}': selectedDeal.contactName || 'Quý Đối tác',
      '{{TÊN_DOANH_NGHIỆP}}': selectedDeal.company || 'Doanh nghiệp liên kết',
      '{{TÊN_DEAL}}': selectedDeal.name || 'Gói giải pháp doanh nghiệp',
      '{{GIÁ_TRỊ_DEAL}}': formatDealVal,
      '{{HẠN_CHỐT}}': selectedDeal.closureDate || '30/06/2026',
      '{{SỐ_HÓA_ĐƠN}}': 'HD-2026-0038',
      '{{HẠN_THANH_TOÁN}}': '30/06/2026',
      '{{TÊN_SALES}}': 'Đặng Việt Triều (Sales Rep)'
    };

    for (const [ph, val] of Object.entries(reps)) {
       resolvedSubject = resolvedSubject.replaceAll(ph, val);
       resolvedBody = resolvedBody.replaceAll(ph, val);
    }
  }

  return `
    <div class="db-grid-2x animate-fadeIn" style="margin-top: 16px; display: grid; grid-template-columns: 1fr 1.3fr; gap:16px;">
      <!-- Templates Selection -->
      <div class="panel" style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--bd); padding-bottom:8px; margin-bottom:4px;">
          <h3 style="font-family: var(--fd); font-size: 14px; font-weight: 700; color: var(--indigo-950);">
            <i class="fa-solid fa-folder-open text-indigo-500"></i> Thư Viện Mẫu Email Bán Hàng
          </h3>
          <button class="btn pr xs font-bold" id="email-add-tpl-btn" style="padding:4px 8px; font-size:10.5px;"><i class="fa-solid fa-plus"></i> Thêm Mẫu Mới</button>
        </div>

        <!-- Interactive Advanced Filters -->
        <div style="background-color: var(--n50); padding: 10px; border-radius: var(--rs); display: flex; flex-direction: column; gap: 8px; border: 1px solid var(--bd-dim, var(--bd));">
          <!-- Category Filter Bar -->
          <div>
            <span style="font-size: 9.5px; font-weight: 750; color: var(--n500); text-transform: uppercase; display: block; margin-bottom: 4px;"><i class="fa-solid fa-route text-indigo-500"></i> Lọc Giai đoạn / Giao dịch:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${[
                { value: 'all', label: 'Tất cả' },
                { value: 'intro', label: 'Tiếp cận/Intro' },
                { value: 'quote', label: 'Báo giá/Proposal' },
                { value: 'invoice', label: 'VAT/Nợ' },
                { value: 'care', label: 'Chăm sóc' }
              ].map(opt => {
                const isSelected = catFilter === opt.value;
                return `<button class="btn ${isSelected ? 'pr' : 'bl'} xs" onclick="window.crmApp.setEmailTemplateFilters('${opt.value}', undefined)" style="font-size:9.5px; padding:2px 6px; font-weight:700;">${opt.label}</button>`;
              }).join('')}
            </div>
          </div>
          
          <!-- Deal segment / Customer Type Filter Bar -->
          <div style="border-top: 1px dashed var(--bd); padding-top: 6px;">
            <span style="font-size: 9.5px; font-weight: 750; color: var(--n500); text-transform: uppercase; display: block; margin-bottom: 4px;"><i class="fa-solid fa-tags text-amber-500"></i> Phân khúc khách hàng:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${[
                { value: 'all', label: 'Tất cả phân khúc' },
                { value: 'b2b', label: 'B2B Doanh nghiệp' },
                { value: 'b2c', label: 'B2C Khách lẻ' }
              ].map(opt => {
                const isSelected = dtypeFilter === opt.value;
                return `<button class="btn ${isSelected ? 'pr' : 'bl'} xs" onclick="window.crmApp.setEmailTemplateFilters(undefined, '${opt.value}')" style="font-size:9.5px; padding:2px 6px; font-weight:700;">${opt.label}</button>`;
              }).join('')}
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px; margin-top:4px; max-height: 480px; overflow-y: auto; padding-right:4px;">
          ${filteredTemplates.length === 0 ? `
            <div style="padding:32px 16px; text-align:center; color:var(--n400); background: var(--n50); border: 1px dashed var(--bd); border-radius: var(--rs); font-size:11.5px; line-height:1.5;">
              <div style="font-size:26px; margin-bottom:8px;">📥</div>
              Chưa có mẫu Email nào khớp với các bộ lọc phân khúc đã chọn.<br/>
              <span class="text-indigo-500 cursor-pointer font-bold" onclick="window.crmApp.setEmailTemplateFilters('all', 'all')">Huỷ lọc</span> hoặc nhấp <strong class="text-indigo-600 font-bold">"Thêm Mẫu Mới"</strong> để kiến tạo!
            </div>
          ` : filteredTemplates.map(tpl => {
            const isActive = activeTpl && tpl.id === activeTpl.id;
            let catBadge = '';
            if (tpl.category === 'intro') catBadge = '<span class="chip bl" style="font-size:8px;">TIẾP CẬN</span>';
            if (tpl.category === 'quote') catBadge = '<span class="chip gr" style="font-size:8px;">BÁO GIÁ</span>';
            if (tpl.category === 'invoice') catBadge = '<span class="chip rd" style="font-size:8px;">VAT/NỢ</span>';
            if (tpl.category === 'care') catBadge = '<span class="chip gy" style="font-size:8px;">CHĂM SÓC</span>';

            let dtypeBadge = '';
            if (tpl.dealType === 'b2b') dtypeBadge = '<span class="chip pu" style="font-size:8px; border-color:#8b5cf6;"><i class="fa-solid fa-building"></i> B2B VP</span>';
            else if (tpl.dealType === 'b2c') dtypeBadge = '<span class="chip am" style="font-size:8px; border-color:#f59e0b;"><i class="fa-solid fa-user-shield"></i> B2C Lẻ</span>';
            else dtypeBadge = '<span class="chip sl" style="font-size:8px;"><i class="fa-solid fa-globe"></i> Chung</span>';

            return `
              <div class="tpl-item" onclick="window.crmApp.selectEmailTemplate('${tpl.id}')" style="padding:10px; border-radius:var(--rs); border:1.5px solid ${isActive ? 'var(--b600)' : 'var(--bd)'}; background:${isActive ? 'var(--b50)' : 'white'}; cursor:pointer; display:flex; flex-direction:column; gap:4px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: all 0.1s ease-in-out;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:11.5px; color:${isActive ? 'var(--b700)' : 'var(--n850)'}">${esc(tpl.name)}</strong>
                  <div style="display:flex; gap:3px; align-items:center;">
                    ${catBadge}
                    ${dtypeBadge}
                  </div>
                </div>
                <p style="font-size:10px; color:var(--n500); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; margin:0;" title="${esc(tpl.subject)}">Chủ đề: ${esc(tpl.subject)}</p>
                
                <!-- Customize Actions inside Card -->
                <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px; border-top:1px dashed var(--bd); padding-top:6px;">
                  <button class="btn gy xs font-bold" onclick="event.stopPropagation(); window.crmApp.editEmailTemplate('${tpl.id}')" style="font-size:9.5px; padding:2px 6px; display:inline-flex; align-items:center; gap:2px;"><i class="fa-solid fa-pen"></i> Chỉnh sửa</button>
                  <button class="btn rd xs icon-only" onclick="event.stopPropagation(); window.crmApp.deleteEmailTemplate('${tpl.id}')" title="Xóa mẫu thư" style="padding:2px 6px; font-size:9.5px;"><i class="fa-solid fa-trash-can"></i></button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Preview Panel -->
      <div class="panel" style="display:flex; flex-direction:column; gap:12px;">
        <h3 style="font-family: var(--fd); font-size: 14px; font-weight: 700; color: var(--indigo-950); border-bottom:1px solid var(--bd); padding-bottom:8px;">
          <i class="fa-solid fa-envelope-open text-indigo-500"></i> Trình Khớp Biến Số Email Thực Tế Theo Thương Vụ
        </h3>

        <!-- Match with direct real Deal database link -->
        <div class="fg" style="margin-bottom:8px;">
          <label style="font-weight:700; display:block; margin-bottom:4px; font-size:11px; color:var(--n700);"><i class="fa-solid fa-handshake"></i> Chọn một Thương vụ hoặc Khách hàng cụ thể dồi dào:</label>
          <select id="email-deal-selector" class="tmono font-bold text-slate-800" onchange="window.crmApp.selectEmailMatchedDeal(this.value)" style="padding: 8px; border-radius:var(--rs); border:1px solid var(--bd); width:100%; font-size:12px;">
            ${dealsDb.map(d => {
              const val = d.value || d.amount || 0;
              return `<option value="${d.id}" ${d.id === selectedDealId ? 'selected' : ''}>[${d.dealType === 'b2c' ? 'B2C Lẻ' : 'B2B Corp'}] ${esc(d.name)} &middot; Khách: ${esc(d.contactName)} (${fmtVND(val)})</option>`;
            }).join('')}
          </select>
        </div>

        <div style="background-color: var(--n50); border:1px solid var(--bd); border-radius:var(--rs); padding:16px;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; border-bottom:1px solid var(--bd); padding-bottom:6px; font-size:12px; align-items:center;">
              <span style="color:var(--n500); width:100px; font-weight:700;">CHỦ ĐỀ CHUẨN:</span>
              <input type="text" id="email-resolved-subject-box" value="${esc(resolvedSubject)}" style="background:white; font-weight:700; color:var(--indigo-800); border:1px solid var(--bd); padding:4px 8px; border-radius:4px; flex:1; font-size:12px;" />
            </div>
            
            <div style="margin-top:6px;">
              <span style="color:var(--n500); font-weight:700; font-size:11px; display:block; margin-bottom:4px;">NỘI DUNG THƯ (Người dùng có thể trực tiếp tinh chỉnh tự do tại đây trước khi copy hoặc gửi):</span>
              <textarea id="email-resolved-body-box" rows="11" style="width:100%; padding:10px; border:1px solid var(--bd); border-radius:4px; font-family:var(--fm); font-size:12px; line-height:1.6; color:var(--n850); background:white; font-weight: normal;">${esc(resolvedBody)}</textarea>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px; flex-wrap:wrap; gap:8px;">
          <div style="font-size:10px; color:var(--n500); line-height:1.4;">
            Các biến tự động khả dụng: <code>{{KHÁCH_HÀNG}}</code>, <code>{{TÊN_DOANH_NGHIỆP}}</code>, <code>{{TÊN_DEAL}}</code>, <code>{{GIÁ_TRỊ_DEAL}}</code>, <code>{{TÊN_SALES}}</code>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn bl font-bold animate-pulse" id="email-mock-send-btn" onclick="window.crmApp.mockSendEmail()" style="border-color:var(--green); color:var(--green); font-size:11px; padding:6px 12px;"><i class="fa-solid fa-paper-plane"></i> Gửi Thử (Mock Send)</button>
            <button class="btn pr font-bold" id="email-copy-btn" onclick="window.crmApp.copyEmailToClipboard()" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-copy"></i> Sao chép Email</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

const PREMEETING_QUIZ_QUESTIONS = [
  {
    q: "Trước khi bắt đầu cuộc họp, bước quan trọng nhất để thu thập lợi thế đàm판 là?",
    o: [
      "Chỉ cần nắm tên và ngành nghề là đủ",
      "Nghiên cứu kỹ Pain Point, lịch sử trao đổi và sản phẩm cốt lõi của họ",
      "Không cần chuẩn bị, dựa vào tài hùng biện tại chỗ",
      "Chuẩn bị sẵn slide giới thiệu dịch vụ chung mà không thay đổi bất kỳ trường hợp nào"
    ],
    ans: 1,
    exp: "Nghiên cứu trước Pain Points và lịch sử giúp định vị Aura một cách hoàn hảo, bộc lộ lợi thế thâm căn đàm phán."
  },
  {
    q: "Khi khách hàng lập tức chê chi phí Aura đắt đỏ ngay từ phút đầu, nòng cốt phản xạ là gì?",
    o: [
      "Ngay lập tức hứa hẹn giảm trừ 50% để giữ chân bằng mọi giá",
      "Lập tức tranh luận nảy lửa thách đố hoặc thanh minh chính sách",
      "Trụ vững, liên tục quay lại Pain Points và chứng tỏ ROI Aura tiết kiệm đống tiền ra sao để bù đắp trị giá",
      "Đột ngột im lặng chuyển giao sếp giải cứu"
    ],
    ans: 2,
    exp: "Tránh lạm dụng chiết khấu sớm; chứng tỏ ROI tài khóa Aura CRM mới là liều thuốc thăng tiến dứt trị điểm nghẽn của vị doanh chủ."
  },
  {
    q: "Để bảo vệ tính minh bạch kịch bản, làm gì khi khách hỏi một tính năng sâu mà bạn chưa dám chắc?",
    o: [
      "U úơ nói đại là có hoàn hảo để chốt kèo trước rồi đổ thừa IT sau",
      "Dìm tính năng đó bảo không thiết thực",
      "Nói trung thực là sẽ xác minh chi tiết kèm IT giải đáp bằng văn bản trong vòng 2 giờ",
      "Từ chối thẳng thừng làm cụt hứng dòng thương thảo"
    ],
    ans: 2,
    exp: "Cam kết phản hồi nhanh (SLA) bộc lộ sự đáng tin cậy cao của văn hóa doanh nghiệp Aura."
  },
  {
    q: "Nhiệm vụ tối thượng hàng đầu của cuộc gặp mặt sơ bộ giới thiệu (Intro Meeting)?",
    o: [
      "Ép khách hàng thanh toán tiền mặt 100% tươi ngay lập tức",
      "Chốt lịch hẹn thực chứng sâu hơn (Deep Demo) hoặc tiến trình kích hoạt dùng thử có mục tiêu rõ rệt",
      "Nói chuyện phiếm ngẫu nhiên không có hành động cụ thể",
      "Mời khách hàng đi cà phê liên hoan hữu nghị"
    ],
    ans: 1,
    exp: "Thương vụ bước đi từng nấc thang; do đó, chốt chặn bước chuyển giao thực chứng (Sáp nhập Demo/Dùng thử) là thành quả cốt lõi của buổi gặp đầu."
  },
  {
    q: "Mức chiết khấu tối đa mà bạn có thẩm quyền phê duyệt nốt cho một deal khẩn cấp là?",
    o: [
      "Bao nhiêu phần trăm cũng được, tự sướng chốt rồi tính",
      "Tuyệt đối tuân thủ chính sách cam kết sớm tối đa 10% theo quy chuẩn sếp ký",
      "Cam kết ảo 40% rồi bùng lụi",
      "Không áp dụng bất cứ chính sách nào để tỏ vẻ kiêu kỳ"
    ],
    ans: 1,
    exp: "Kỷ cương chiết khấu chặn đứng cơn lỗ sâu dòng tiền, minh chứng chuẩn mực đạo đức kinh doanh."
  }
];

function renderSubTabQuiz() {
  if (!window.QUIZ_ACTIVE_ANSWERS) {
    window.QUIZ_ACTIVE_ANSWERS = Array(5).fill(null);
  }
  
  const answers = window.QUIZ_ACTIVE_ANSWERS;
  const answeredCount = answers.filter(a => a !== null).length;
  const isEvaluated = window.QUIZ_IS_EVALUATED || false;
  const quizScore = window.QUIZ_SCORE || 0;

  let feedbackHtml = '';
  if (isEvaluated) {
    let feedbackLevel = 'Cơ bản (Rookie)';
    let badgeClass = 'chip gy';
    let feedbackDesc = 'Hãy đọc kỹ lại bộ kịch bản Aura Playbook, học sâu cách làm rõ ROI tài khóa để thuyết phục đại doanh của đối tác.';
    
    if (quizScore === 100) {
      feedbackLevel = 'Chuyên Gia Thực Chiến (Elite Negotiator) 🏆';
      badgeClass = 'chip gr';
      feedbackDesc = 'Tuyệt vời vô song! Bạn hoàn toàn sẵn sàng bước vào sàn đàm phán chốt hợp đồng Aura CRM.';
    } else if (quizScore >= 80) {
      feedbackLevel = 'Nhân Sự Bản Lĩnh (Pro Negotiator) ⭐';
      badgeClass = 'chip bl';
      feedbackDesc = 'Rất đáng khen! Bạn nắm vững phong thái chắp nối ROI đàm phán, chỉ cần mài giũa chút tính phản xạ.';
    }

    feedbackHtml = `
      <div class="panel text-slate-800 animate-fadeIn" style="margin-top: 16px; background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--rs); padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #86efac; padding-bottom:8px; margin-bottom:12px;">
          <h3 style="font-family: var(--fd); font-size:15px; font-weight:800; color:#14532d;"><i class="fa-solid fa-circle-check"></i> ĐÁNH GIÁ SỰ SẴN SÀNG ĐÀM PHÁN</h3>
          <button class="btn bl sm" onclick="window.crmApp.resetQuizState()" style="border-color:#86efac; color:#15803d; font-weight:700;"><i class="fa-solid fa-rotate-left"></i> Làm lại bài kiểm tra</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; align-items:center;">
          <div style="text-align:center; padding: 16px; background:white; border-radius:var(--rs); border:1px solid #86efac; display:flex; flex-direction:column; justify-content:center; align-items:center; box-shadow: 0 4px 6px rgba(0,0,0,0.02)">
            <p style="font-size:10px; color:#475569; font-weight: bold; text-transform:uppercase; margin-bottom:4px;">Tổng Điểm Chuẩn Bị</p>
            <strong style="font-size:36px; font-weight:900; color:${quizScore >= 80 ? '#16a34a' : '#d97706'}; font-family:var(--fd);" class="tmono">${quizScore} / 100</strong>
            <span class="${badgeClass} uppercase font-bold" style="font-size:10px; display:inline-block; margin-top:6px; padding: 4px 8px;">${feedbackLevel}</span>
          </div>

          <div>
            <p style="font-size:12.5px; line-height:1.6; color:#1e293b; margin:0;"><strong>Lời khuyên từ CEO Aura CRM:</strong> ${feedbackDesc}</p>
            <p style="font-size:11px; color:#475569; margin-top:6px; line-height:1.4;"><i class="fa-solid fa-circle-info text-blue-500"></i> Bài kiểm tra gồm 5 tình huống đàm phán then chốt giúp loại bỏ 25% rủi ro đàm phán vụng về cho sales mới.</p>
          </div>
        </div>
      </div>
    `;
  }

  return `
    <div style="margin-top: 16px;">
      ${feedbackHtml}

      <div class="panel">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--bd); padding-bottom:12px;">
          <div>
            <h3 style="font-family: var(--fd); font-size: 15px; font-weight: 700; color: var(--n800);">
              <i class="fa-solid fa-graduation-cap text-indigo-500"></i> Sales Pre-Meeting Preparedness Quiz (Trắc nghiệm chuẩn bị trước cuộc họp)
            </h3>
            <p style="font-size: 11.5px; color: var(--n500); margin-top: 2px;">Vượt qua 5 câu trắc nghiệm bắt buộc để củng cố tư duy đàm phán xuất chúng của Aura.</p>
          </div>
          <span class="chip font-bold text-slate-700 font-mono" id="quiz-answered-chip" style="background:var(--n100); font-size:11px;">Hoàn thành: ${answeredCount}/5</span>
        </div>

        <div style="display: flex; flex-direction: column; gap:16px;">
          ${PREMEETING_QUIZ_QUESTIONS.map((q, qIdx) => {
            const chosenValue = answers[qIdx];
            return `
              <div style="background: var(--n50); padding: 12px; border-radius: var(--rs); border: 1px solid ${chosenValue !== null ? 'var(--b200)' : 'var(--bd)'};">
                <p style="font-weight: 700; font-size: 12.5px; color: var(--n900); margin-bottom: 8px;">
                  <strong class="text-indigo-600">Câu ${qIdx + 1}:</strong> ${esc(q.q)}
                </p>
                <div style="font-size: 11.5px; display:flex; flex-direction:column; gap:6px;">
                  ${q.o.map((option, oIdx) => {
                    const isChecked = chosenValue === oIdx;
                    return `
                      <label style="display:flex; align-items:center; gap:8px; padding:6px 10px; background: white; border: 1px solid ${isChecked ? 'var(--b600)' : 'var(--bd)'}; border-radius:var(--rs); cursor:pointer; font-weight: ${isChecked ? '700' : 'normal'}; transition: all 0.15s ease; margin:0;">
                        <input type="radio" name="qz-q-${qIdx}" class="quiz-radio-btn" data-q-idx="${qIdx}" data-o-idx="${oIdx}" ${isChecked ? 'checked' : ''} style="width: auto; cursor:pointer; margin:0;" />
                        <span>${esc(option)}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
                ${isEvaluated ? `
                  <div style="margin-top:10px; font-size:11px; padding:8px; border-radius:var(--rs); background-color:${chosenValue === q.ans ? '#f0fdf4; border: 1px solid #bbf7d0; color: #16a34a;' : '#fff1f2; border: 1px solid #fecdd3; color: #e11d48;'}">
                    <span>${chosenValue === q.ans ? '✓ Thực tế chứng minh chính xác!' : `✗ Nhận thức lệch. Đúng chuẩn là: <strong>${esc(q.o[q.ans])}</strong>`}</span>
                    <p style="color:var(--n600); margin-top:4px; line-height:1.4;">Phân tích bổ trợ: ${esc(q.exp)}</p>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 24px; display:flex; justify-content:center;">
          <button class="btn pr font-bold" id="quiz-submit-btn" style="padding: 10px 30px; font-size:13.5px;"><i class="fa-solid fa-graduation-cap"></i> Gửi Đáp Án Chấm Điểm</button>
        </div>
      </div>
    </div>
  `;
}

export function renderMcnaFunnelPage(activeSimTab = 't1') {
  const b2bLeads = LEADS_DB.filter(l => l.leadType === 'b2b');
  const b2cLeads = LEADS_DB.filter(l => l.leadType === 'b2c');
  const totalDeals = DEALS_DB.length;
  const closedWon = DEALS_DB.filter(d => d.stage === 'closed_won').length;
  const conversionRate = totalDeals > 0 ? Math.round((closedWon / totalDeals) * 100) : 0;
  
  // Calculate some anomalies for Tier 5 live radar
  const hasSpikeAnomaly = conversionRate > 65;
  const activeAlerts = [];
  if (hasSpikeAnomaly) {
    activeAlerts.push({
      id: 'al-1',
      title: 'ĐỘT BIẾN TỶ LỆ CHUYỂN ĐỔI (CONVERSION SPIKE)',
      detail: `Tỉ lệ chốt deal (Closed Won / Total Deals) đạt ngưỡng bất thường ${conversionRate}% (Ngưỡng an toàn < 55%)`
    });
  }
  
  const rapidEditsCount = AUDIT_LOG_DB.filter(l => l.action.toLowerCase().includes('cập nhật')).length;
  if (rapidEditsCount > 12) {
    activeAlerts.push({
      id: 'al-2',
      title: 'TẦN SUẤT THAY ĐỔI TRẠNG THÁI CAO (ANOMALY DETECTED)',
      detail: 'Hệ thống quét thấy nhiều hành vi ghi chú và thay đổi giai đoạn liên tục trong thời gian ngắn (Cảnh báo nguy cơ Spam/Tampering)'
    });
  }

  return `
    <div class="page-container animate-fadeIn">
      <!-- Top Overview Jumbotron -->
      <div class="panel" style="background: linear-gradient(135deg, #4c1d95, #1e3a8a); color: white; border: none; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-family: var(--fd); font-size: 20px; font-weight: 800; margin: 0; color: white;"><i class="fa-solid fa-network-wired text-purple-300"></i> HỆ THỐNG PHỄU KINH DOANH MCNA 5 TẦNG & LIVE SIMULATOR</h2>
          <p style="font-size: 13px; color: rgba(255,255,255,0.85); margin-top: 4px;">Quy chuẩn hóa hành trình khách hàng từ Awareness (Tím), Lead (Xanh dương), Sales (Xanh ngọc), tới Payment (Xanh lá) dựa trên lớp giám sát an ninh dữ liệu Control Layer (Đỏ).</p>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: var(--rs); text-align: center; border: 1px solid rgba(255,255,255,0.15);">
            <div style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Leads B2B/B2C</div>
            <div style="font-size: 16px; font-weight: 800; font-family: var(--fm);" class="text-purple-200">${b2bLeads.length} / ${b2cLeads.length}</div>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 8px 12px; border-radius: var(--rs); text-align: center; border: 1px solid rgba(255,255,255,0.15);">
            <div style="font-size: 10px; text-transform: uppercase; color: rgba(255,255,255,0.7); font-weight: 700;">Tỉ lệ quy đổi</div>
            <div style="font-size: 16px; font-weight: 800; font-family: var(--fm);" class="text-amber-300">${conversionRate}%</div>
          </div>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 16px; margin-top: 16px; align-items: start;">
        
        <!-- Left Side: Interactive SVG Funnel Diagram -->
        <div class="panel" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-family: var(--fd); font-size: 14px; font-weight: 800; margin: 0; color: var(--n800);"><i class="fa-solid fa-diagram-project text-indigo-500"></i> Bản đồ Quy Trình Vận Hành 5 Layer</h3>
            <span class="chip font-bold" style="background: rgba(16,185,129,0.1); color: #059669; font-size: 10.5px;"><i class="fa-solid fa-circle-check"></i> Trạng thái: Live & Sync</span>
          </div>

          <!-- Dynamic Funnel SVG -->
          <div style="background: var(--n50); padding: 12px; border-radius: var(--rs); border: 1px solid var(--bd); text-align: center; position: relative;">
            <svg viewBox="0 0 400 370" width="100%" style="max-height: 350px;">
              <!-- Tier 1: Awareness Purple -->
              <polygon points="40,20 360,20 320,80 80,80" fill="#a78bfa" stroke="#6d28d9" stroke-width="2" style="cursor: pointer;" onclick="window.crmApp.switchSimTab('t1')"/>
              <text x="200" y="44" fill="#4c1d95" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" pointer-events="none">TẦNG 1: AWARENESS (TIẾP CẬN MARKETING)</text>
              <text x="200" y="62" fill="#5c21b6" font-family="sans-serif" font-size="9" text-anchor="middle" pointer-events="none">Form Capture (Tên, SĐT, Email, Nhu cầu, Nguồn) &middot; ADS / EVENT</text>

              <!-- Tier 2: Lead Blue -->
              <polygon points="84,85 316,85 280,145 120,145" fill="#93c5fd" stroke="#1d4ed8" stroke-width="2" style="cursor: pointer;" onclick="window.crmApp.switchSimTab('t2')"/>
              <text x="200" y="108" fill="#1e3a8a" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" pointer-events="none">TẦNG 2: LEADS (SÀNG LỌC & PHÂN BỔ)</text>
              <text x="200" y="126" fill="#172554" font-family="sans-serif" font-size="9" text-anchor="middle" pointer-events="none">Auto Lead Scoring (Hot/Warm/Cold) &middot; Auto-routing cho Sales</text>

              <!-- Tier 3: Sales Teal -->
              <polygon points="124,150 276,150 240,210 160,210" fill="#99f6e4" stroke="#0f766e" stroke-width="2" style="cursor: pointer;" onclick="window.crmApp.switchSimTab('t3')"/>
              <text x="200" y="174" fill="#115e59" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" pointer-events="none">TẦNG 3: SALES (TÁC NGHIỆP & QUYẾT ĐỊNH)</text>
              <text x="200" y="192" fill="#134e4a" font-family="sans-serif" font-size="9" text-anchor="middle" pointer-events="none">Ghi Log gọi thoại/gặp mặt &middot; Amber Decision (Nếu từ chối -> Nurture)</text>

              <!-- Tier 4: Payment Green -->
              <polygon points="164,215 236,215 210,275 190,275" fill="#a7f3d0" stroke="#047857" stroke-width="2" style="cursor: pointer;" onclick="window.crmApp.switchSimTab('t4')"/>
              <text x="200" y="240" fill="#065f46" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" pointer-events="none">TẦNG 4: PAYMENT (HỢP ĐỒNG & THANH TOÁN)</text>
              <text x="200" y="258" fill="#022c22" font-family="sans-serif" font-size="9" text-anchor="middle" pointer-events="none">Khởi tạo Contract/Billing &middot; API Webhook Realtime</text>

              <!-- Tier 5: Control Layer Red frame around everything or base -->
              <rect x="15" y="295" width="370" height="60" rx="6" fill="#fecdd3" stroke="#b91c1c" stroke-width="2" stroke-dasharray="4,4"/>
              <text x="200" y="318" fill="#991b1b" font-family="sans-serif" font-size="13" font-weight="black" text-anchor="middle">LỚP KIỂM SOÁT AN NINH DỮ LIỆU CONTROL LAYER (TẦNG 5)</text>
              <text x="200" y="336" fill="#7f1d1d" font-family="sans-serif" font-size="9.5" text-anchor="middle">Chặn Mandatory Fields &middot; Ghi sườn Audit Log &middot; Phân quyền RBAC &middot; Radar cảnh báo biến động</text>
            </svg>
            <div style="font-size: 10px; color: var(--n500); margin-top: 6px; font-style: italic;">(Nhấp chuột trực tiếp vào từng tầng trong biểu đồ hình phễu trên để nhảy tới Sandbox điều khiển mô phỏng)</div>
          </div>

          <!-- Descriptive Explainer Notes for each layer -->
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 12px; font-size: 11.5px; line-height: 1.45;">
            <div style="border-left: 3.5px solid #8b5cf6; padding-left: 8px;">
              <strong style="color: #6d28d9;">T1 - Awareness:</strong> Marketer thu hút leads qua quảng cáo/sự kiện. Lead mới điền form capture là điểm đầu tiên đổ về CRM.
            </div>
            <div style="border-left: 3.5px solid #1d4ed8; padding-left: 8px;">
              <strong style="color: #1e3a8a;">T2 - Lead Scoring:</strong> Máy chấm điểm hành vi để xác định Hot/Warm/Cold, tự động gán Sales rep phù hợp khu vực/sản phẩm, loại bỏ tranh giành khách.
            </div>
            <div style="border-left: 3.5px solid #0d9488; padding-left: 8px;">
              <strong style="color: #115e59;">T3 - Sales operations:</strong> Hai luồng tác tác song song của sales (Call/Meet vs Báo giá/Demo). Khách hàng đưa ra quyết định Amber (Nếu từ chối -> Luồng Nuôi dưỡng lại).
            </div>
            <div style="border-left: 3.5px solid #059669; padding-left: 8px;">
              <strong style="color: #065f46;">T4 - Payment:</strong> Pháp lý điện tử & Link thanh toán. Cổng ngân hàng bắn API Webhook realtime đồng bộ Deal sang Closed Won và thông báo tức thì Sales, PM, Kế Toán.
            </div>
          </div>
        </div>

        <!-- Right Side: Sandbox Simulators -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          
          <!-- Tab selector for Simulator of each stage -->
          <div class="panel" style="padding: 12px;">
            <h4 style="font-family: var(--fd); font-size: 12.5px; font-weight: 800; margin-bottom: 10px; color: var(--n700); text-transform: uppercase;"><i class="fa-solid fa-laptop-code text-indigo-500"></i> Phòng Thí Nghiệm Mô Phỏng Hành Trình</h4>
            
            <!-- Dynamic Connecting Progress Stepper -->
            <div style="background:var(--n50); border:1px solid var(--bd); border-radius: var(--rs); padding: 10px; margin-bottom: 12px; font-size: 11px;">
              <div style="font-weight:800; color:var(--n700); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                <span>🎯 TIẾN TRÌNH LIÊN HOÀN (5-STEP WORKFLOW):</span>
                <span class="text-indigo-600 font-bold" style="font-family:var(--fmo);">Bước ${activeSimTab === 't1' ? '1/4' : activeSimTab === 't2' ? '2/4' : activeSimTab === 't3' ? '3/4' : '4/4'}</span>
              </div>
              
              <!-- Simple Progress line & dots -->
              <div style="display:flex; justify-content:space-between; align-items:center; position:relative; margin: 12px 10px 18px 10px;">
                <div style="position:absolute; top:50%; left:0; right:0; height:3px; background:#e2e8f0; z-index:1; transform:translateY(-50%);"></div>
                <div style="position:absolute; top:50%; left:0; width:${activeSimTab === 't1' ? '0%' : activeSimTab === 't2' ? '33%' : activeSimTab === 't3' ? '66%' : '100%'}; height:3px; background:linear-gradient(90deg, #8b5cf6, #10b981); z-index:2; transform:translateY(-50%); transition: width 0.4s ease;"></div>
                
                <!-- Dot 1 -->
                <div style="z-index:3; position:relative; text-align:center; cursor:pointer;" onclick="window.crmApp.switchSimTab('t1')">
                  <div style="width:20px; height:20px; border-radius:50%; background:${activeSimTab === 't1' ? 'var(--p600)' : '#10b981'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; margin:0 auto; border:2px solid white; box-shadow:0 0 0 2px ${activeSimTab === 't1' ? 'var(--p200)' : 'rgba(16,185,129,0.2)'};">1</div>
                  <span style="font-size:9px; position:absolute; top:24px; left:50%; transform:translateX(-50%); white-space:nowrap; font-weight:${activeSimTab === 't1' ? 'bold' : 'normal'}; color:${activeSimTab === 't1' ? 'var(--p600)' : 'var(--n600)'};">T1: Marketing</span>
                </div>
                <!-- Dot 2 -->
                <div style="z-index:3; position:relative; text-align:center; cursor:pointer;" onclick="window.crmApp.switchSimTab('t2')">
                  <div style="width:20px; height:20px; border-radius:50%; background:${activeSimTab === 't2' ? 'var(--b600)' : (activeSimTab === 't3' || activeSimTab === 't4') ? '#10b981' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; margin:0 auto; border:2px solid white; box-shadow:0 0 0 2px ${activeSimTab === 't2' ? 'var(--b200)' : 'transparent'};">2</div>
                  <span style="font-size:9px; position:absolute; top:24px; left:50%; transform:translateX(-50%); white-space:nowrap; font-weight:${activeSimTab === 't2' ? 'bold' : 'normal'}; color:${activeSimTab === 't2' ? 'var(--b600)' : 'var(--n600)'};">T2: Routing</span>
                </div>
                <!-- Dot 3 -->
                <div style="z-index:3; position:relative; text-align:center; cursor:pointer;" onclick="window.crmApp.switchSimTab('t3')">
                  <div style="width:20px; height:20px; border-radius:50%; background:${activeSimTab === 't3' ? '#0f766e' : (activeSimTab === 't4') ? '#10b981' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; margin:0 auto; border:2px solid white; box-shadow:0 0 0 2px ${activeSimTab === 't3' ? 'rgba(15,118,110,0.2)' : 'transparent'};">3</div>
                  <span style="font-size:9px; position:absolute; top:24px; left:50%; transform:translateX(-50%); white-space:nowrap; font-weight:${activeSimTab === 't3' ? 'bold' : 'normal'}; color:${activeSimTab === 't3' ? '#0f766e' : 'var(--n600)'};">T3: Sales Deal</span>
                </div>
                <!-- Dot 4 -->
                <div style="z-index:3; position:relative; text-align:center; cursor:pointer;" onclick="window.crmApp.switchSimTab('t4')">
                  <div style="width:20px; height:20px; border-radius:50%; background:${activeSimTab === 't4' ? '#10b981' : '#cbd5e1'}; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; margin:0 auto; border:2px solid white; box-shadow:0 0 0 2px ${activeSimTab === 't4' ? 'rgba(16,185,129,0.2)' : 'transparent'};">4</div>
                  <span style="font-size:9px; position:absolute; top:24px; left:50%; transform:translateX(-50%); white-space:nowrap; font-weight:${activeSimTab === 't4' ? 'bold' : 'normal'}; color:${activeSimTab === 't4' ? '#10b981' : 'var(--n600)'};">T4: Payment</span>
                </div>
              </div>
              
              <!-- Quick automatic continuous simulation runner -->
              <div style="margin-top: 24px; padding-top:10px; border-top:1px dashed var(--bd); display:flex; justify-content:space-between; align-items:center; gap: 8px;">
                <span style="font-size:10px; color:var(--n500);"><i class="fa-solid fa-code-merge text-indigo-400"></i> Hỗ trợ chạy liên kết toàn bộ:</span>
                <button class="btn pr xs" style="background: linear-gradient(135deg, #7c3aed, #2563eb); border:none; font-weight:bold; font-size:9.5px; padding:4px 8px;" onclick="window.crmApp.simRunEndToEndFlow()">
                  <i class="fa-solid fa-play animate-pulse"></i> ⚡ Chạy Mô Phỏng Liên Hoàn Tự Động (T1 → T4)
                </button>
              </div>
            </div>
            
            <div style="display: flex; gap: 4px; background: var(--n100); padding: 4px; border-radius: var(--rs);">
              <button class="btn ${activeSimTab==='t1'?'pr':'bl'} xs" style="flex:1; font-weight:700; font-size:10.5px; padding:6px 2px;" onclick="window.crmApp.switchSimTab('t1')">T1: Marketing</button>
              <button class="btn ${activeSimTab==='t2'?'pr':'bl'} xs" style="flex:1; font-weight:700; font-size:10.5px; padding:6px 2px;" onclick="window.crmApp.switchSimTab('t2')">T2: Routing</button>
              <button class="btn ${activeSimTab==='t3'?'pr':'bl'} xs" style="flex:1; font-weight:700; font-size:10.5px; padding:6px 2px;" onclick="window.crmApp.switchSimTab('t3')">T3: Sales Deal</button>
              <button class="btn ${activeSimTab==='t4'?'pr':'bl'} xs" style="flex:1; font-weight:700; font-size:10.5px; padding:6px 2px;" onclick="window.crmApp.switchSimTab('t4')">T4: Payment</button>
            </div>

            <!-- Tab Contents Dynamic -->
            <div style="margin-top: 12px; min-height: 290px;">
              ${activeSimTab === 't1' ? `
                <!-- T1 Content: Marketing Capture Form -->
                <div class="animate-fadeIn">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-size:11.5px; font-weight:900; color:#6d28d9;"><i class="fa-solid fa-rectangle-ad"></i> T1: FORM ĐĂNG KÝ TIẾP CẬN KHÁCH HÀNG</span>
                    <span style="background:#f5f3ff; color:#7c3aed; font-size:9.5px; padding:2px 6px; border-radius:10px; font-weight:700;">Awareness Purple</span>
                  </div>
                  <p style="font-size:11px; color:var(--n500); margin-bottom:10px; line-height:1.4;">Marketer chạy chiến dịch kéo khách hàng. Điền Form sau để đổ dữ liệu vào hệ thống. Thiếu trường bắt buộc sẽ bị T5 chặn đứng!</p>
                  
                  <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Họ tên khách hàng *</label>
                        <input type="text" id="sim-t1-name" placeholder="Nguyễn Khắc Triệu" style="padding:6px; font-size:11.5px;" />
                      </div>
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Số điện thoại di động *</label>
                        <input type="tel" id="sim-t1-phone" placeholder="0984992113" style="padding:6px; font-size:11.5px;" />
                      </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:8px;">
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Địa chỉ Email *</label>
                        <input type="email" id="sim-t1-email" placeholder="trieu.nguyen@mcna.vn" style="padding:6px; font-size:11.5px;" />
                      </div>
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Nguồn tiếp cận *</label>
                        <select id="sim-t1-source" style="padding:6px; font-size:11.5px; width:100%;">
                          <option value="Facebook Ads">Facebook Ads (Quảng cáo)</option>
                          <option value="Google Search Form">Google Search Landing Page</option>
                          <option value="Warm Event">Hội Thảo Offline Khách Hàng</option>
                          <option value="Cold Calling Campaign">Bốc Máy Gọi Điện Lạnh (Outbound)</option>
                        </select>
                      </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Nhu cầu tư vấn tuyển sinh *</label>
                        <select id="sim-t1-need" style="padding:6px; font-size:11.5px; width:100%;">
                          <option value="SaaS ERP Enterprise Suite">SaaS ERP Enterprise Suite - Gói tùy biến rộng</option>
                          <option value="Aura CRM Core Pack">Aura CRM Core Pack - Toàn diện bán hàng</option>
                          <option value="Aura CS Helpdesk Hub">Aura CS SLA System - Chăm sóc khách hàng</option>
                          <option value="Standard Cloud App">Standard Cloud App - Phù hợp startup</option>
                        </select>
                      </div>
                      <div class="fg" style="margin:0;">
                        <label style="font-size:10.5px; font-weight:700;">Khu vực địa lý địa phương *</label>
                        <select id="sim-t1-region" style="padding:6px; font-size:11.5px; width:100%;">
                          <option value="Kinh doanh miền Bắc">Miền Bắc (Trực Hà Nội)</option>
                          <option value="Kinh doanh miền Nam">Miền Nam (Trực TP HCM)</option>
                        </select>
                      </div>
                    </div>
                    <div class="fg" style="margin:0;">
                      <label style="font-size:10.5px; font-weight:700;">Trị giá gói dự kiến đề xuất (VND) *</label>
                      <input type="number" id="sim-t1-val" value="120000000" style="padding:6px; font-size:11.5px;" />
                    </div>

                    <button class="btn pr" style="background:#7c3aed; font-weight:700; font-size:12px; margin-top:4px; padding:8px 12px; border:none;" onclick="window.crmApp.simSubmitCaptureForm()">
                      <i class="fa-solid fa-bullhorn"></i> Gửi Đơn Đăng Ký (Run Capture Webhook)
                    </button>
                    
                    <div style="background: #f5f3ff; border: 1px dashed #c084fc; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; color: #5b21b6; line-height: 1.4;">
                      <strong>💡 LIÊN KẾT LUỒNG (T1 → T2):</strong> Khi nhấn nút Gửi đơn đăng ký, phễu thô nhận diện lead mới đồng bộ lặp tức. Hệ thống sẽ tự động nhảy tab sang <strong>T2: Routing Rules</strong> để tính điểm hành vi & phân bổ sales tư vấn.
                    </div>
                  </div>
                </div>
              ` : activeSimTab === 't2' ? `
                <!-- T2 Content: Automatic Scoring & Routing Rules -->
                <div class="animate-fadeIn" style="display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:11.5px; font-weight:900; color:#1e3a8a;"><i class="fa-solid fa-calculator"></i> T2: CHẤM ĐIỂM LEAD SCORING & GIAO SALES TỰ ĐỘNG</span>
                    <span style="background:#eff6ff; color:#1d4ed8; font-size:9.5px; padding:2px 6px; border-radius:10px; font-weight:700;">Auto-Route Blue</span>
                  </div>
                  
                  <!-- Display newly captured lead for simulation, or the last one in LEADS_DB -->
                  ${(() => {
                    const latest = LEADS_DB[0];
                    if (!latest) {
                      return `<p style="font-size:11px; color:var(--n500); text-align:center; padding:30px 0;">Hãy tạo/gửi Form Capture ở bước T1 trước để chạy mô phỏng!</p>`;
                    }
                    
                    // Simulate points
                    let points = 2; // base
                    if (latest.email && latest.email.includes('@')) points += 3;
                    if (latest.value >= 100000000) points += 3;
                    if (latest.phone && latest.phone.length > 9) points += 2;
                    if (latest.source === 'Facebook Ads' || latest.source.includes('Landing')) points += 1;
                    
                    const scoreClass = latest.priority === 'hot' ? 'chip rd' : latest.priority === 'warm' ? 'chip am' : 'chip gy';
                    const assignedRep = USERS_DB.find(u => u.id === latest.ownerId) || { name: 'Chưa rõ' };

                    return `
                      <div style="background:white; border:1px solid #bfdbfe; border-radius:var(--rs); padding:10px; font-size:11.2px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                          <span>Hồ sơ Lead vừa đổ về: <strong>${esc(latest.name)}</strong></span>
                          <span style="font-family:var(--fmo); color:var(--n500);">${latest.id}</span>
                        </div>
                        <div style="margin-bottom:6px;">SĐT: <span class="tmono">${latest.phone}</span> &middot; Email: <span class="tmono">${esc(latest.email)}</span></div>
                        <div style="margin-bottom:6px; color:var(--n600);">Trị giá dự tính: <strong style="color:var(--b700);">${fmtVND(latest.value)}</strong></div>
                        
                        <!-- Scoring Breakdown -->
                        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:4px; padding:6px; margin:8px 0; font-size:10.5px;">
                          <div style="display:flex; justify-content:space-between; font-weight:700; color:#0369a1; margin-bottom:4px;">
                            <span>Bảng tính điểm hành vi (Lead Score)</span>
                            <span>${points} Điểm</span>
                          </div>
                          <div style="display:flex; flex-direction:column; gap:2px; color:#0c4a6e; font-size:10px;">
                            <div>&middot; Email hợp lệ định vị liên thông: +3 điểm ${latest.email ? '✓' : '✗'}</div>
                            <div>&middot; Giao trị dự thảo lớn (&ge; 100M VND) nâng hạn: +3 điểm ${latest.value >= 100000000 ? '✓' : '✗'}</div>
                            <div>&middot; Số điện thoại liên hệ đầy đủ số: +2 điểm ${latest.phone ? '✓' : '✗'}</div>
                          </div>
                        </div>

                        <div style="display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:8px;">
                          <div>Xếp hạng tự động: <span class="${scoreClass}">${latest.priority?.toUpperCase()} LEAD</span></div>
                          <div>Sales phụ trách: <span class="chip bl font-bold">${esc(assignedRep.name)}</span></div>
                        </div>
                      </div>
                      
                      <div style="display:flex; gap:8px; margin-top:6px;">
                        <button class="btn pr" style="flex:1.4; font-size:11px; background:#10b981; border:none; font-weight:bold;" onclick="window.crmApp.simAutoScoringRoute()"><i class="fa-solid fa-check-double"></i> ⚡ Duyệt Phân Bổ & Khởi Tạo Deal (Tới T3)</button>
                        <button class="btn bl" style="flex:0.8; font-size:11px;" onclick="window.crmApp.switchSimTab('t3')">Chuyển Tab T3 <i class="fa-solid fa-arrow-right"></i></button>
                      </div>

                      <div style="background: #eff6ff; border: 1px dashed #60a5fa; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; color: #1e40af; line-height: 1.4;">
                        <strong>💡 LIÊN KẾT LUỒNG (T2 → T3):</strong> Khi bấm <strong>⚡ Duyệt Phân Bổ & Khởi Tạo Deal</strong>, hệ thống tự động thăng cấp Lead thô thành Deal thương thảo chính thức, định rõ Đại diện phụ trách & chuyển tab hoạt cảnh tới <strong>T3: Sales Deal</strong>.
                      </div>
                    `;
                  })()}
                </div>
              ` : activeSimTab === 't3' ? `
                <!-- T3 Content: Sales Negotiation & Amber Decisions -->
                <div class="animate-fadeIn" style="display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:11.5px; font-weight:900; color:#0f766e;"><i class="fa-solid fa-comments"></i> T3: SALES TÁC NGHIỆP & PHÁN QUYẾT HỔ PHÁCH (AMBER DECISIONS)</span>
                    <span style="background:#ccfbf1; color:#0f766e; font-size:9.5px; padding:2px 6px; border-radius:10px; font-weight:700;">Negotiation Hổ phách</span>
                  </div>
                  <p style="font-size:11px; color:var(--n500); line-height:1.45; margin-bottom:4px;">Sales tư vấn gọi điện, gửi báo giá và demo. Ngay sau đó, khách hàng đưa ra quyết định Amber. Nếu "Từ chối", hệ thống tự động đưa vào <b>"Luồng Nurture"</b> để nuôi dưỡng lại.</p>

                  ${(() => {
                    // Find a deal that represents active negotiation, or create a quick simulator one
                    let targetDeal = DEALS_DB.find(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost' && d.stage !== 'nurtured');
                    if (!targetDeal) {
                      // Fallback: reset a deal for simulation
                      targetDeal = DEALS_DB[0];
                      if (targetDeal) {
                        targetDeal.stage = 'negotiation';
                      }
                    }

                    if (!targetDeal) {
                      return `<p style="font-size:11px; color:var(--n500); text-align:center; padding:30px 0;">Không có deal nào sẵn sàng trong hệ thống!</p>`;
                    }

                    return `
                      <div style="background:white; border:1px solid #99f6e4; border-radius:var(--rs); padding:10px; font-size:11px;">
                        <div style="font-weight:700; color:var(--n800); margin-bottom:4px;"><i class="fa-solid fa-file-contract"></i> ${esc(targetDeal.name)}</div>
                        <div style="color:var(--n500); margin-bottom:4px;">Khách hàng doanh nghiệp: <b>${esc(targetDeal.companyName)}</b></div>
                        <div style="margin-bottom:6px;">Trị giá Deal: <b class="text-teal-700">${fmtVND(targetDeal.value)}</b> &middot; Tới hạn chốt: <span class="tmono">${targetDeal.expectedClose}</span></div>
                        
                        <!-- Perform Call/Meet logs -->
                        <div style="display:flex; gap:6px; margin-bottom:10px; border-top:1px solid var(--n100); padding-top:6px;">
                          <button class="btn bl xs" style="font-size:9.5px; padding:4px 8px;" onclick="window.crmApp.simSalesActionLog('${targetDeal.id}', 'call')"><i class="fa-solid fa-phone"></i> Log Cuộc Gọi</button>
                          <button class="btn bl xs" style="font-size:9.5px; padding:4px 8px;" onclick="window.crmApp.simSalesActionLog('${targetDeal.id}', 'meeting')"><i class="fa-solid fa-handshake"></i> Log Gặp Mặt</button>
                          <button class="btn bl xs" style="font-size:9.5px; padding:4px 8px;" onclick="window.crmApp.simSalesActionLog('${targetDeal.id}', 'quote')"><i class="fa-solid fa-file-pdf"></i> Gửi Báo Giá</button>
                        </div>

                        <!-- Huge prominent amber buttons of "Khách hàng phán quyết" -->
                        <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:var(--rs); padding:8px;">
                          <div style="font-size:10.5px; font-weight:800; color:#b45309; text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between;">
                            <span>⚡ NÚT QUYẾT ĐỊNH HỔ PHÁCH (AMBER DECISIONS)</span>
                            <span>Trạng thái: ${targetDeal.stage.toUpperCase()}</span>
                          </div>
                          
                          <div style="display:flex; gap:4px;">
                            <button class="btn xs" style="flex:1; background:#10b981; color:white; border:none; font-weight:900; font-size:10px; padding:6px 0;" onclick="window.crmApp.simAmberDecision('${targetDeal.id}', 'accept')">
                              <i class="fa-solid fa-check"></i> ĐỒNG Ý CHỐT
                            </button>
                            <button class="btn xs" style="flex:1; background:#f59e0b; color:white; border:none; font-weight:900; font-size:10px; padding:6px 0;" onclick="window.crmApp.simAmberDecision('${targetDeal.id}', 'delay')">
                              <i class="fa-solid fa-clock"></i> CÂN NHẮC THÊM
                            </button>
                            <button class="btn xs" style="flex:1; background:#ef4444; color:white; border:none; font-weight:900; font-size:10px; padding:6px 0;" onclick="window.crmApp.simAmberDecision('${targetDeal.id}', 'reject')">
                              <i class="fa-solid fa-xmark"></i> TỪ CHỐI (NURTURE)
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style="background: #e6fffa; border: 1px dashed #2dd4bf; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; color: #0f766e; line-height: 1.4;">
                        <strong>💡 LIÊN KẾT LUỒNG (T3 → T4):</strong> Bạn bắt buộc phải nhấn log tương tác cuộc gọi tối thiểu một lần, sau đó bấm <strong>ĐỒNG Ý CHỐT</strong>. Lúc này, hệ thống sẽ tự động chuyển sang <strong>T4: Payment</strong> kèm hợp đồng & link thanh toán nợ trực tuyến.
                      </div>
                    `;
                  })()}
                </div>
              ` : `
                <!-- T4 Content: Payments and Webhook simulators -->
                <div class="animate-fadeIn" style="display:flex; flex-direction:column; gap:8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-size:11.5px; font-weight:900; color:#047857;"><i class="fa-solid fa-vault"></i> T4: VẬN ĐƠN THANH TOÁN & WEBHOOK REALTIME</span>
                    <span style="background:#e6f4ea; color:#047857; font-size:9.5px; padding:2px 6px; border-radius:10px; font-weight:700;">Gateway Green</span>
                  </div>
                  <p style="font-size:11px; color:var(--n500); line-height:1.4; margin-bottom:6px;">Hợp đồng được ký điện tử và link thanh toán được sinh ra. Mô phỏng Webhook realtime từ ngân hàng báo về CRM để cập nhật và thông báo.</p>

                  ${(() => {
                    // Find a deal at closed_won or created specifically for payment
                    let payDeal = DEALS_DB.find(d => d.stage === 'closed_won' || d.tags?.includes('Awaiting-Payment'));
                    if (!payDeal) {
                      // Fallback, prepare a deal in Awaiting-Payment stage
                      payDeal = DEALS_DB.find(d => d.stage === 'proposal' || d.stage === 'negotiation');
                      if (payDeal) {
                        payDeal.tags = "Awaiting-Payment";
                      }
                    }

                    if (!payDeal) {
                      return `<p style="font-size:11px; color:var(--n500); text-align:center; padding:30px 0;">Không có hợp đồng thanh toán khả dụng nào!</p>`;
                    }

                    const isPaid = payDeal.stage === 'closed_won';

                    return `
                      <div style="background:white; border:1px solid #a7f3d0; border-radius:var(--rs); padding:10px; font-size:11px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                          <strong>Số HĐ: HD-${payDeal.id.toUpperCase()}</strong>
                          <span class="chip ${isPaid ? 'gn' : 'am'}" style="font-size:9px; padding:1px 5px;">${isPaid ? 'ĐÃ ĐỐI CHIẾU THÀNH CÔNG' : 'ĐANG CHỜ THANH TOÁN'}</span>
                        </div>
                        <p style="color:var(--n700); margin:0 0 4px 0;">Deal liên đới: <b>${esc(payDeal.name)}</b></p>
                        <p style="color:var(--n500); margin:0 0 6px 0;">Công ty: ${esc(payDeal.companyName)}</p>
                        <div style="font-size:11px; background:var(--n50); padding:6px; border-radius:4px; margin-bottom:8px;">
                          Link thanh toán: <a href="#" style="text-decoration:underline; color:var(--p600); font-family:var(--fmo);" onclick="event.preventDefault(); toast('Đây là link thanh toán điện tử của khách hàng!', 'info')">https://pay.mcna-crm.vn/billing/${payDeal.id}</a>
                        </div>

                        ${isPaid ? `
                          <div style="background:#e6f4ea; color:#065f46; border:1px solid #a7f3d0; padding:6px; border-radius:4px; font-size:10.5px; font-style:italic; display:flex; align-items:center; gap:6px;">
                            <i class="fa-solid fa-circle-check text-emerald-600"></i>
                            <span>Bắn Webhook khớp tiền thành công! Hệ thống đã thông báo tự động tới Sales Rep, PM và đội ngũ Kế Toán.</span>
                          </div>
                        ` : `
                          <button class="btn pr" style="width:100%; font-weight:800; font-size:11.5px; background:#059669; border:none; padding:8px 0;" onclick="window.crmApp.simBankWebhookCallback('${payDeal.id}')">
                            <i class="fa-solid fa-cloud-bolt"></i> CHẠY SIMULATED BANK WEBHOOK REALTIME (Realtime Link-API)
                          </button>
                        `}
                      </div>

                      <div style="background: #f0fdf4; border: 1px dashed #34d399; padding: 10px; border-radius: 6px; margin-top: 10px; font-size: 11px; color: #166534; line-height: 1.4;">
                        <strong>💡 LIÊN KẾT LUỒNG (T4 → T5):</strong> Thực thi Webhook từ ngân hàng sẽ trả khớp tiền hoàn hảo, đánh dấu deal thành công "Closed Won", đóng nợ hóa đơn và đồng thời lưu vết vĩnh viễn trên sổ cái tuân thủ tại <strong>T5: Control Layer</strong>.
                      </div>
                    `;
                  })()}
                </div>
              `}
            </div>
          </div>

          <!-- Live Mobile/Desktop Simulated Banner Broadcast Receiver -->
          <div id="sim-webhook-notif-toast-area" style="display:none; background:#ecfdf5; border:1.5px solid #10b981; border-radius:var(--rs); padding:10px; font-size:11.5px; color:#065f46; box-shadow:0 3px 10px rgba(16,185,129,0.15);" class="animate-fadeIn">
            <!-- Dynamic webhook notification outputs appear here! -->
          </div>

          <!-- Tier 5: Control Layer Center -->
          <div class="panel" style="padding: 12px; border-top: 4px solid #ef4444; background: #fffcfc;">
            <h4 style="font-family: var(--fd); font-size: 12.5px; font-weight: 800; margin-bottom: 8px; color: #b91c1c; text-transform: uppercase;">
              <i class="fa-solid fa-shield-halved text-rose-600 animate-pulse"></i> Tầng 5 Control Layer - Bảng Giám Sát Tuân Thủ
            </h4>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:10.5px; margin-bottom:10px;">
              <div style="background:white; border:1px solid #fecdd3; padding:6px; border-radius:var(--rs);">
                <div style="font-weight:700; color:#991b1b;"><i class="fa-solid fa-lock"></i> Bản Đồ Permissions (RBAC)</div>
                <div style="color:var(--n600); margin-top:2px;">User: <b>${esc(SESSION.name)}</b> (${esc(SESSION.role.toUpperCase())})</div>
                <div style="color:var(--n500); font-style:italic; margin-top:2px; font-size:9.5px;">
                  ${SESSION.role === 'sales'
                    ? '🛡️ Active: Chỉ hiển thị leads tự phân bổ của riêng bạn.'
                    : '🌐 Active: Bạn giữ vai trò quản trị viên - xem toàn quyền leads.'}
                </div>
              </div>
              <div style="background:white; border:1px solid #fecdd3; padding:6px; border-radius:var(--rs);">
                <div style="font-weight:700; color:#991b1b;"><i class="fa-solid fa-brain"></i> Dynamic Anomaly Detection</div>
                <div style="color:var(--n600); margin-top:2px;">Tỉ lệ Deal Win: <b>${conversionRate}%</b></div>
                <div style="color:#b91c1c; font-weight:700; font-size:9.5px; margin-top:2px;">
                  ${hasSpikeAnomaly ? '⚠️ Đỏ: Cảnh báo đột biến tỉ lệ chốt!' : '✓ Bình thường: Không phát hiện bất thường.'}
                </div>
              </div>
            </div>

            <!-- Threat alert notifications stream -->
            ${activeAlerts.length > 0 ? `
              <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px;">
                ${activeAlerts.map(al => `
                  <div style="background:#fef2f2; border:1px solid #fee2e2; border-radius:4px; padding:6px 10px; font-size:10.5px; color:#991b1b;" class="animate-pulse">
                    <strong style="color:#b91c1c; font-size:10px;"><i class="fa-solid fa-circle-exclamation"></i> ${esc(al.title)}</strong>
                    <p style="margin:2px 0 0 0; line-height:1.3; color:#7f1d1d; font-size:9.5px;">${esc(al.detail)}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- Realtime Audit log terminal display -->
            <div style="background:#1e293b; border-radius:var(--rs); padding:8px; font-family:var(--fmo);">
              <div style="color:#94a3b8; font-size:10px; font-weight:700; text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                <span>📜 THỜI GIAN THỰC NHẬT KÝ KIỂM TRA (AUDIT TRAIL)</span>
                <span style="color:#cbd5e1; font-size:9px;">Trạng thái: Active</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:4px; max-height:110px; overflow-y:auto; font-size:9.5px; line-height:1.3;">
                ${AUDIT_LOG_DB.slice(0, 4).map(log => `
                  <div style="color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:3px;">
                    <span style="color:#22c55e;">[OK]</span> <span style="color:#38bdf8;">${esc(log.timestamp.split(' ')[1])}</span> &middot; 
                    <strong style="color:#a78bfa;">${esc(log.user)}</strong> đã: ${esc(log.action)} <strong>${esc(log.resource)}</strong> 
                    <span style="color:#94a3b8; font-family:var(--fmo);">(${log.ip})</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

// FULL-FEATURED NOTIFICATIONS HUB RENDERER IN CRAFT PRESENTATION AESTHETICS
export function renderNotificationsPage(notifications, currentUserId) {
  // Filter notifications belonging to this user
  const myNotifications = notifications.filter(n => !n.userId || n.userId === currentUserId || n.userId === 'all');
  const unreadCount = myNotifications.filter(n => n.unread).length;

  return `
    <div class="page-container animate-fadeIn">
      ${renderUnifiedPipelineHeader('notifications')}
      
      <div class="filter-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background: white; padding: 12px 18px; border-radius: 8px; border-left: 4px solid var(--p500); box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div>
          <h2 style="font-family:var(--fd); font-size:17px; font-weight:800; color:var(--n800); display:flex; align-items:center; gap:8px; margin: 0;"><i class="fa-solid fa-bell text-indigo-500"></i> Hộp Thư Thông Báo Toàn Diện</h2>
          <p style="font-size:11px; color:var(--n500); margin:4px 0 0 0;">Bạn có <strong class="text-indigo-600">${unreadCount}</strong> thông báo hành động khẩn cấp chưa xử lý.</p>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn bl" onclick="window.crmApp.markAllNotificationsAsRead()" style="padding: 6px 12px; font-size: 11.5px; font-weight:700;"><i class="fa-solid fa-envelope-open"></i> Đọc tất cả</button>
          <button class="btn rd" onclick="window.crmApp.clearAllNotifications()" style="padding: 6px 12px; font-size: 11.5px; font-weight:700;"><i class="fa-solid fa-trash-can"></i> Xóa tất cả</button>
        </div>
      </div>

      <div class="panel" style="padding: 0; background: transparent; border: none; box-shadow: none;">
        ${myNotifications.length === 0 ? `
          <div class="empty" style="background:white; border:1px solid var(--n150); border-radius:var(--rs); padding:40px; text-align:center;">
            <div class="empty-ico" style="color:var(--n300); font-size:40px;"><i class="fa-solid fa-envelope-circle-check"></i></div>
            <p class="empty-msg" style="font-weight:700; color:var(--n600); margin-top:10px;">Hộp thư sạch sẽ! Chưa có thông báo mới nào.</p>
            <p style="font-size:11.5px; color:var(--n400);">Khi marketers phân phối leads hoặc có giao dịch mới, thông báo tức thời sẽ gửi tại đây.</p>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${myNotifications.map(n => {
              const bg = n.unread ? 'background: #f5f3ff; border-left: 5px solid var(--p500);' : 'background: white; border-left: 5px solid #d1d5db;';
              const dot = n.unread ? '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--p500); margin-right:6px;"></span>' : '';
              return `
                <div class="panel list-item-notif" style="padding: 16px; border-radius: var(--rs); ${bg} display:flex; justify-content:space-between; align-items:center; transition: all 0.2s; box-shadow:0 1px 3px rgba(0,0,0,0.02);" id="notif-card-${n.id}">
                  <div style="display:flex; gap:12px; align-items: flex-start;">
                    <div style="background: ${n.unread ? '#ddd6fe' : '#f1f5f9'}; color: ${n.unread ? '#4f46e5' : '#475569'}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink:0;">
                      <i class="fa-solid ${n.title.includes('BÁO GIÁ') ? 'fa-file-invoice-dollar' : n.title.includes('LEAD') ? 'fa-filter' : n.title.includes('ALERT') ? 'fa-triangle-exclamation' : 'fa-bell'}"></i>
                    </div>
                    <div>
                      <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
                        ${dot}
                        <strong style="font-size: 13px; color: var(--n800);">${esc(n.title)}</strong>
                        <span class="chip gy" style="font-size:9.5px; padding:1px 5px; font-weight:700;">${esc(n.user || 'M.C.N.A Robot')}</span>
                      </div>
                      <p style="font-size: 12.5px; color: var(--n600); margin: 6px 0 0 0; line-height: 1.45; font-weight:500;">${esc(n.content)}</p>
                      <span style="font-size: 10px; color: var(--n400); display: block; margin-top: 6px;"><i class="fa-regular fa-clock"></i> ${n.time}</span>
                    </div>
                  </div>
                  <div style="display:flex; gap:6px; align-items:center;">
                    ${n.unread ? `<button class="btn sm" style="background:#e0e7ff; color:#4338ca; border:1px solid #c7d2fe; font-size:11px; font-weight:700; padding:4px 10px;" onclick="window.crmApp.markNotifAsRead('${n.id}')"><i class="fa-solid fa-check"></i> Đọc</button>` : ''}
                    <button class="btn rd sm icon-only" onclick="window.crmApp.deleteNotif('${n.id}')" title="Xóa thông báo này"><i class="fa-solid fa-trash-can"></i></button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}


