// Enterprise CRM Pro - Core Application Orchestrator
'use strict';

import { 
  USERS_DB, COMPANIES_DB, CONTACTS_DB, LEADS_DB, DEALS_DB, TASKS_DB, 
  ACTIVITIES_DB, QUOTES_DB, PRODUCTS_DB, TICKETS_DB, INVOICES_DB, REVENUE_DATA, NOTIFICATIONS_DB, initDB 
} from './crm-database.js';

import { svgBarChart, svgLineChart, svgDonut, svgFunnel, svgSparkline } from './crm-charts.js';

import { 
  drawLoginScreen, drawRegisterScreen, drawForgotScreen, 
  buildSidebar, buildTopbar, 
  renderSuperAdminDashboard, renderManagerDashboard, renderSalesRepDashboard, renderSupportDashboard,
  drawLeadsPage, renderPipelineKanban, renderTasksPage, renderQuotationsPage, drawQuoteBuilderInner,
  renderCustomersPage, renderProductsPage, renderTicketsPage, drawTicketMessageThread, renderUsersPermissionsPage, renderSystemSettingsPage,
  renderReportsPage, renderInvoicesPage, esc, fmtVND
} from './crm-templates.js';

// === GLOBAL STATE ===
let SESSION = null;
let CUR_PAGE = 'login';
let IS_SIDEBAR_COLLAPSED = false;
let ACTIVE_TAB_STATE = 'all';
let CUSTOMER_TAB_STATE = 'b2b'; // Add dynamic subtab for unified B2B/B2C
let DEALS_TAB_STATE = 'kanban'; // Add dynamic subtab for unified Kanban/Deals List
let FILTER_STATE = { search: '', source: 'all', priority: 'all' };
let SELECTED_TICKET_ID = null;
let REPORT_FILTER_STATE = { range: '12', repId: 'all', growthExpect: 15 };

const PERMISSIONS = {
  superadmin: ['dashboard-superadmin', 'reports', 'leads', 'deals', 'pipeline', 'contacts', 'companies', 'products', 'quotes', 'invoices', 'tasks', 'activities', 'tickets', 'users', 'settings', 'profile', 'notifications'],
  manager: ['dashboard-manager', 'reports', 'leads', 'deals', 'pipeline', 'contacts', 'companies', 'quotes', 'invoices', 'tasks', 'activities', 'profile', 'notifications'],
  sales: ['dashboard-salesrep', 'leads', 'deals', 'pipeline', 'contacts', 'tasks', 'activities', 'quotes', 'products', 'tickets', 'profile', 'notifications'],
  support: ['dashboard-support', 'tickets', 'contacts', 'profile', 'notifications']
};

const PAGE_TITLES = {
  'dashboard-superadmin': 'Bảng Điều Khiển Quản Trị Hệ Thống',
  'dashboard-manager': 'Bảng Giám Sát Kinh Doanh',
  'dashboard-salesrep': 'Bàn Làm Việc Cá Nhân',
  'dashboard-support': 'Trạm Phục Vụ Hỗ Trợ SLA',
  'reports': 'Báo Cáo & Phân Tích Doanh Số',
  'leads': 'Quản Lý Leads Tiếp Cận',
  'deals': 'Cơ Hội Giao Thương & Thương Lượng',
  'pipeline': 'Phễu Pipeline Kanban',
  'contacts': 'Mạng Lưới Khách Hàng (Contacts)',
  'companies': 'Hồ Sơ Doanh Nghiệp (Companies)',
  'products': 'Danh Mục Giải Pháp & Sản Phẩm',
  'quotes': 'Bảng Báo Giá Khách Hàng',
  'invoices': 'Sổ Sách Hóa Đơn & Nợ Phải Thu',
  'tasks': 'Sổ Tay Nhiệm Vụ Hoạt Động',
  'activities': 'Nhật Ký Tác Nghiệp Kinh Doanh',
  'tickets': 'Trực Sự Cố Support Tickets',
  'users': 'Người Dùng & Bản Đồ RBAC',
  'settings': 'Cấu Hình Hệ Thống Chung',
  'profile': 'Hồ Sơ Tài Khoản Cá Nhân',
  'notifications': 'Hộp Thư Thông Báo Mới'
};

/* ==========================================================================
   1. CORE RUNTIME ROUTING & PERMISSION GUARDS
   ========================================================================== */

function canAccess(role, pageId) {
  if (!role || !PERMISSIONS[role]) return false;
  return PERMISSIONS[role].includes(pageId);
}

export function go(pageId) {
  if (!SESSION) {
    CUR_PAGE = 'login';
    renderEntryScreen();
    return;
  }

  // Permission Guard Check
  if (!canAccess(SESSION.role, pageId)) {
    toast('Bạn không có quyền truy cập tính năng của phân hệ này!', 'error');
    return;
  }

  CUR_PAGE = pageId;
  const root = document.getElementById('app-root');
  
  // Build and mount shell container if not exists
  if (!document.getElementById('shell-main-area')) {
    root.innerHTML = `
      <div class="app" id="shell-main-area">
        <div id="sidebar-mount-point"></div>
        <main class="main">
          <header class="topbar" id="topbar-mount-point"></header>
          <div class="content" id="content-mount-point"></div>
        </main>
      </div>
    `;
  }

  // Update dynamic layouts
  renderSidebar();
  renderTopbar();
  renderPageContent(pageId);
}

function renderEntryScreen() {
  const root = document.getElementById('app-root');
  
  if (CUR_PAGE === 'login') {
    root.innerHTML = drawLoginScreen();
    setupLoginEventHandlers();
  } else if (CUR_PAGE === 'register') {
    root.innerHTML = drawRegisterScreen(1);
    setupRegisterEventHandlers(1);
  } else if (CUR_PAGE === 'forgot') {
    root.innerHTML = drawForgotScreen();
    setupForgotEventHandlers();
  }
  document.getElementById('demo-role-switcher').style.display = 'block';
}

function renderSidebar() {
  const mount = document.getElementById('sidebar-mount-point');
  if (mount) {
    mount.innerHTML = buildSidebar(SESSION, CUR_PAGE, IS_SIDEBAR_COLLAPSED);
    setupSidebarEventDelegation();
  }
}

function renderTopbar() {
  const mount = document.getElementById('topbar-mount-point');
  if (mount) {
    const unreadCount = NOTIFICATIONS_DB.filter(n => n.unread).length;
    mount.innerHTML = buildTopbar(PAGE_TITLES[CUR_PAGE] || 'Aura System', unreadCount, SESSION);
    setupTopbarEventHandlers();
  }
}

function renderPageContent(pageId) {
  const mount = document.getElementById('content-mount-point');
  if (!mount) return;

  // Render specific layout snapshots based on page context
  if (pageId === 'dashboard-superadmin') {
    mount.innerHTML = renderSuperAdminDashboard();
    
    // Draw SVGs after mounted in the real DOM to resolve parent dimensions
    setTimeout(() => {
      // Monthly revenue bar chart format mapping
      const chartBarData = REVENUE_DATA.map(d => ({ label: d.month, value: d.revenue }));
      svgBarChart(chartBarData, 'sa-bar-chart-container');

      // Bezier leads converted line trends
      const chartLineData = REVENUE_DATA.slice(6).map(d => ({ label: d.month, value: d.wonDeals }));
      svgLineChart(chartLineData, 'sa-line-chart-container');

      // Stage Distribution donut segments
      const donutData = [
        { label: 'Thương lượng', value: DEALS_DB.filter(d=>d.stage==='negotiation').length, color: 'var(--b400)' },
        { label: 'Proposals', value: DEALS_DB.filter(d=>d.stage==='proposal').length, color: 'var(--p500)' },
        { label: 'Đủ điều kiện', value: DEALS_DB.filter(d=>d.stage==='qualified').length, color: 'var(--amber)' },
        { label: 'Won', value: DEALS_DB.filter(d=>d.stage==='closed_won').length, color: 'var(--green)' }
      ];
      svgDonut(donutData, 'sa-donut-chart-container');

      // Mini sparks trends
      USERS_DB.filter(u=>u.role==='sales').forEach(u => {
        svgSparkline([u.dealsWon, u.dealsWon + 2, u.dealsWon * 1.5, u.dealsWon - 1, u.dealsWon + 3], `spark-rep-${u.id}`);
      });
      
      setupSuperAdminEvents();
    }, 50);
  } 
  else if (pageId === 'dashboard-manager') {
    mount.innerHTML = renderManagerDashboard();
    setTimeout(() => {
      const funnelData = [
        { label: 'Leads phễu (1)', value: LEADS_DB.length },
        { label: 'Qualify sâu (2)', value: LEADS_DB.filter(l=>l.status!=='new').length },
        { label: 'Đề Xuất Hợp Đồng (3)', value: DEALS_DB.filter(d=>d.stage==='proposal').length },
        { label: 'Đàm Phán Chốt (4)', value: DEALS_DB.filter(d=>d.stage==='negotiation').length },
        { label: 'Won Chắc chắn (5)', value: DEALS_DB.filter(d=>d.stage==='closed_won').length }
      ];
      svgFunnel(funnelData, 'm-funnel-container');
    }, 50);
  } 
  else if (pageId === 'dashboard-salesrep') {
    mount.innerHTML = renderSalesRepDashboard();
    setupSalesRepEvents();
  } 
  else if (pageId === 'dashboard-support') {
    mount.innerHTML = renderSupportDashboard();
  } 
  else if (pageId === 'leads') {
    // Render Leads list with dynamic filter subsets
    let data = LEADS_DB;
    if (FILTER_STATE.source !== 'all') {
      data = data.filter(l => l.source === FILTER_STATE.source);
    }
    if (FILTER_STATE.priority !== 'all') {
      data = data.filter(l => l.priority === FILTER_STATE.priority);
    }
    if (FILTER_STATE.search) {
      const q = FILTER_STATE.search.toLowerCase();
      data = data.filter(l => l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q));
    }
    
    mount.innerHTML = drawLeadsPage(data, ACTIVE_TAB_STATE, FILTER_STATE);
    setupLeadsEventHandlers();
  } 
  else if (pageId === 'deals' || pageId === 'pipeline') {
    mount.innerHTML = renderPipelineKanban(DEALS_DB, DEALS_TAB_STATE);
    setupKanbanEventHandlers();
  } 
  else if (pageId === 'tasks') {
    mount.innerHTML = renderTasksPage(TASKS_DB, ACTIVE_TAB_STATE);
    setupTasksEventHandlers();
  } 
  else if (pageId === 'quotes') {
    mount.innerHTML = renderQuotationsPage(QUOTES_DB);
    setupQuotationsEventHandlers();
  } 
  else if (pageId === 'invoices') {
    mount.innerHTML = renderInvoicesPage(INVOICES_DB);
    setupInvoicesEventHandlers();
  } 
  else if (pageId === 'contacts') {
    mount.innerHTML = renderCustomersPage(CUSTOMER_TAB_STATE);
    setupCustomersEvents();
  } 
  else if (pageId === 'products') {
    mount.innerHTML = renderProductsPage(PRODUCTS_DB);
    setupProductsEventHandlers();
  } 
  else if (pageId === 'tickets') {
    mount.innerHTML = renderTicketsPage(TICKETS_DB);
    setupTicketsPageEvents();
  } 
  else if (pageId === 'reports') {
    mount.innerHTML = renderReportsPage(REPORT_FILTER_STATE);
    // Draw SVGs after mounted in the real DOM to resolve parent dimensions
    setTimeout(() => {
      const rangeLimit = parseInt(REPORT_FILTER_STATE.range) || 12;
      const filteredData = REVENUE_DATA.slice(-rangeLimit);
      const chartBarData = filteredData.map(d => ({ label: d.month, value: d.revenue }));
      svgBarChart(chartBarData, 'rpt-bar-chart-container');
      setupReportsEventHandlers();
    }, 50);
  }
  else if (pageId === 'users') {
    mount.innerHTML = renderUsersPermissionsPage();
  } 
  else if (pageId === 'settings') {
    mount.innerHTML = renderSystemSettingsPage();
  } 
  else if (pageId === 'profile') {
    // Draw simple personal parameters profile editor
    mount.innerHTML = `
      <div class="page-container animate-fadeIn">
        <div class="panel">
          <h3 style="font-family:var(--fd); font-size:15px; font-weight:700; margin-bottom:12px;"><i class="fa-solid fa-circle-user text-indigo-500"></i> Cập Nhật Thông Tin Cá Nhân</h3>
          <div class="fr2">
            <div class="fg">
              <label>Họ và tên của bạn</label>
              <input type="text" id="pf-name-input" value="${esc(SESSION.name)}" />
            </div>
            <div class="fg">
              <label>Điện thoại nội bộ</label>
              <input type="tel" id="pf-phone-input" value="${esc(SESSION.phone)}" />
            </div>
          </div>
          <div class="fg">
            <label>Phòng ban / Vai trò đăng ký</label>
            <input type="text" disabled value="${esc(SESSION.dept)} (${SESSION.role?.toUpperCase()})" style="background-color:var(--n50);" />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
            <button class="btn pr" id="pf-save-credentials-btn"><i class="fa-solid fa-save"></i> Cập nhật thông tin</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('pf-save-credentials-btn')?.addEventListener('click', () => {
      const newN = document.getElementById('pf-name-input').value;
      if (newN) {
        SESSION.name = newN;
        toast('Đã cập nhật thông tin thành công!', 'success');
        renderSidebar();
        renderTopbar();
      }
    });
  }
}

/* ==========================================================================
   2. AUTHENTICATION SERVICE IMPLEMENTATION
   ========================================================================== */

function setupLoginEventHandlers() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pw = document.getElementById('login-pw').value;
      
      const user = USERS_DB.find(u => u.email === email && u.pw === pw);
      if (user) {
        if (user.status !== 'active') {
          toast('Tài khoản này đã bị Super Admin tạm khóa, liên hệ hỗ trợ!', 'error');
          return;
        }
        SESSION = user;
        toast(`Đăng nhập thành công! Chào đón ${user.name}`, 'success');
        
        // Dynamic routing default layout
        const homeMap = {
          superadmin: 'dashboard-superadmin',
          manager: 'dashboard-manager',
          sales: 'dashboard-salesrep',
          support: 'dashboard-support'
        };
        go(homeMap[user.role] || 'profile');
      } else {
        toast('Tên mật khẩu hoặc email không khớp trên hệ thống!', 'error');
      }
    });
  }

  document.getElementById('toggle-pw-btn')?.addEventListener('click', () => {
    const input = document.getElementById('login-pw');
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  });

  document.getElementById('go-register-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    CUR_PAGE = 'register';
    renderEntryScreen();
  });

  document.getElementById('go-forgot-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    CUR_PAGE = 'forgot';
    renderEntryScreen();
  });

  // Support click demo profiles fast login select
  document.querySelectorAll('.demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-email').value = btn.getAttribute('data-email');
      document.getElementById('login-pw').value = btn.getAttribute('data-pw');
      toast('Đã nạp mẫu đăng nhập nhanh, nhấn nút đăng nhập!', 'info');
    });
  });
}

function setupRegisterEventHandlers(step) {
  const form = document.getElementById('register-step-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (step < 3) {
        const nextStep = step + 1;
        document.getElementById('app-root').innerHTML = drawRegisterScreen(nextStep);
        setupRegisterEventHandlers(nextStep);
      } else {
        toast('Đăng ký tài khoản doanh nghiệp thành công, đã tự động chuyển đổi vai trò!', 'success');
        SESSION = USERS_DB[2]; // Default login onto sales Representative Triều
        go('dashboard-salesrep');
      }
    });
  }

  document.getElementById('reg-back-btn')?.addEventListener('click', () => {
    const prev = step - 1;
    document.getElementById('app-root').innerHTML = drawRegisterScreen(prev);
    setupRegisterEventHandlers(prev);
  });

  document.getElementById('go-login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    CUR_PAGE = 'login';
    renderEntryScreen();
  });

  if (step === 2) {
    const pwInput = document.getElementById('reg-pw');
    pwInput?.addEventListener('input', () => {
      const val = pwInput.value;
      let score = 0;
      if (val.length >= 8) { score++; document.getElementById('pwc-8').classList.add('ok'); } else document.getElementById('pwc-8').classList.remove('ok');
      if (/[A-Z]/.test(val)) { score++; document.getElementById('pwc-up').classList.add('ok'); } else document.getElementById('pwc-up').classList.remove('ok');
      if (/[0-9]/.test(val)) { score++; document.getElementById('pwc-num').classList.add('ok'); } else document.getElementById('pwc-num').classList.remove('ok');
      if (/[!@#$%^&*]/.test(val)) { score++; document.getElementById('pwc-sp').classList.add('ok'); } else document.getElementById('pwc-sp').classList.remove('ok');

      const bar1 = document.getElementById('psb-1');
      const bar2 = document.getElementById('psb-2');
      const bar3 = document.getElementById('psb-3');
      const bar4 = document.getElementById('psb-4');
      const msg = document.getElementById('reg-pw-strength-msg');

      bar1.style.backgroundColor = bar2.style.backgroundColor = bar3.style.backgroundColor = bar4.style.backgroundColor = 'var(--n200)';

      if (score === 1) { bar1.style.backgroundColor = 'var(--red)'; msg.innerText = 'Mật khẩu Yếu ❌'; }
      else if (score === 2) { bar1.style.backgroundColor = 'var(--amber)'; bar2.style.backgroundColor = 'var(--amber)'; msg.innerText = 'Mật khẩu Tạm ổn ⚡'; }
      else if (score === 3) { bar1.style.backgroundColor = 'var(--b500)'; bar2.style.backgroundColor = 'var(--b500)'; bar3.style.backgroundColor = 'var(--b500)'; msg.innerText = 'Mật khẩu Mạnh tốt ✨'; }
      else if (score === 4) { bar1.style.backgroundColor = 'var(--green)'; bar2.style.backgroundColor = 'var(--green)'; bar3.style.backgroundColor = 'var(--green)'; bar4.style.backgroundColor = 'var(--green)'; msg.innerText = 'Độ mật an toàn tối mật cao ✓'; }
    });
  }
}

function setupForgotEventHandlers() {
  document.getElementById('forgot-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const mail = document.getElementById('forgot-email').value;
    toast(`Mã khôi phục OTP đã gửi thành công đến hòm thư ${mail}`, 'success');
    CUR_PAGE = 'login';
    renderEntryScreen();
  });

  document.getElementById('go-login-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    CUR_PAGE = 'login';
    renderEntryScreen();
  });
}

/* ==========================================================================
   3. INTERNAL CORE PAGE ACTIONS & LOGIC
   ========================================================================== */

function setupSidebarEventDelegation() {
  document.querySelectorAll('.ni').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-page');
      if (target) {
        // Switch tab state reset
        ACTIVE_TAB_STATE = 'all';
        go(target);
      }
    });
  });

  document.getElementById('logout-sidebar-btn')?.addEventListener('click', () => {
    SESSION = null;
    CUR_PAGE = 'login';
    renderEntryScreen();
    toast('Đã đăng xuất khỏi tài khoản của bạn!', 'info');
  });

  // Toggle Collapse layout trigger
  document.getElementById('sidebar-toggle-trigger')?.addEventListener('click', () => {
    IS_SIDEBAR_COLLAPSED = !IS_SIDEBAR_COLLAPSED;
    renderSidebar();
  });
}

function setupTopbarEventHandlers() {
  // Handle toggles profile dropdown or notification popups
  const prTrigger = document.getElementById('profile-tb-dropdown-trigger');
  prTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('profile-tb-dropdown-menu').classList.toggle('open');
  });

  document.getElementById('go-profile-sc-btn')?.addEventListener('click', () => go('profile'));
  document.getElementById('go-profile-sec-btn')?.addEventListener('click', () => go('profile'));
  document.getElementById('qa-add-lead-btn')?.addEventListener('click', () => openNewLeadModalForm());
  document.getElementById('qa-add-deal-btn')?.addEventListener('click', () => openNewDealModal());
  
  document.getElementById('logout-tb-bttn')?.addEventListener('click', () => {
    SESSION = null;
    CUR_PAGE = 'login';
    renderEntryScreen();
  });

  const nfTrigger = document.getElementById('notif-toggle-shortcut');
  nfTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notif-sc-menu').classList.toggle('open');
    renderScNotificationsInDropdown();
  });

  const qaTrigger = document.getElementById('topbar-quickaction-trigger');
  qaTrigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('topbar-quickaction-menu').classList.toggle('open');
  });

  // Global document click to close dropdown menus safely
  document.addEventListener('click', () => {
    document.getElementById('profile-tb-dropdown-menu')?.classList.remove('open');
    document.getElementById('notif-sc-menu')?.classList.remove('open');
    document.getElementById('topbar-quickaction-menu')?.classList.remove('open');
    document.getElementById('global-search-dropdown-menu')?.classList.remove('open');
  });

  // Search logic handler
  const gSearch = document.getElementById('global-search-input');
  gSearch?.addEventListener('input', debounce(() => {
    const val = gSearch.value.trim().toLowerCase();
    const dropdown = document.getElementById('global-search-dropdown-menu');
    
    if (!val) {
      dropdown.classList.remove('open');
      return;
    }

    let resultsHtml = '';
    
    // Search leads and deals and contacts matching titles
    const matchedLeads = LEADS_DB.filter(l => l.name.toLowerCase().includes(val) || l.company.toLowerCase().includes(val)).slice(0, 3);
    const matchedDeals = DEALS_DB.filter(d => d.name.toLowerCase().includes(val) || d.companyName.toLowerCase().includes(val)).slice(0, 3);
    const matchedContacts = CONTACTS_DB.filter(c => c.fullName.toLowerCase().includes(val)).slice(0, 4);

    if (matchedLeads.length > 0) {
      resultsHtml += `<p class="sr-group-title">🎯 Leads tiếp cận</p>`;
      matchedLeads.forEach(l => {
        resultsHtml += `
          <div class="sr-item" onclick="window.crmApp.openLeadDetail('${l.id}')">
            <div class="sr-ico leads"><i class="fa-solid fa-filter"></i></div>
            <div class="sr-info">
              <span class="sr-name">${esc(l.name)}</span>
              <span class="sr-desc">${esc(l.company)}</span>
            </div>
          </div>
        `;
      });
    }

    if (matchedDeals.length > 0) {
      resultsHtml += `<p class="sr-group-title">💰 Cơ hội Deals</p>`;
      matchedDeals.forEach(d => {
        resultsHtml += `
          <div class="sr-item" onclick="window.crmApp.openDealDetailModal('${d.id}')">
            <div class="sr-ico deals"><i class="fa-solid fa-comments-dollar"></i></div>
            <div class="sr-info">
              <span class="sr-name">${esc(d.name)}</span>
              <span class="sr-desc">${fmtVND(d.value)}</span>
            </div>
          </div>
        `;
      });
    }

    if (resultsHtml === '') {
      resultsHtml = `
        <div style="padding:16px; text-align:center; color:var(--n400); font-size:12px;">
          <i class="fa-solid fa-ghost" style="font-size:24px; margin-bottom:8px;"></i> Không tìm thấy kết quả phù hợp
        </div>
      `;
    }

    dropdown.innerHTML = resultsHtml;
    dropdown.classList.add('open');
  }, 300));
}

function renderScNotificationsInDropdown() {
  const mount = document.getElementById('notif-list-sc-inject');
  if (!mount) return;

  const unreads = NOTIFICATIONS_DB.slice(0, 5);
  mount.innerHTML = unreads.map(n => `
    <div style="display:flex; gap:10px; padding:6px; border-radius:6px; background-color:${n.unread ? 'var(--b50)' : 'transparent'}; font-size:11.5px;">
      <div style="width:24px; height:24px; border-radius:50%; background-color:var(--b100); display:flex; align-items:center; justify-content:center; color:var(--b600); font-size:10px;">
        <i class="fa-solid fa-bell"></i>
      </div>
      <div>
        <strong style="color:var(--n800);">${esc(n.title)}</strong>
        <p style="color:var(--n500); margin-top:2px;">${esc(n.body)}</p>
        <span style="font-size:9.5px; opacity:0.6; font-family:var(--fm);">${n.time}</span>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   4. MODALS & FORMS HANDLERS
   ========================================================================== */

function openModalElement(title, contentHtml, footerButtonsHtml) {
  // Create container overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-bg animate-fadeIn';
  overlay.id = 'active-modal-overlay';
  overlay.innerHTML = `
    <div class="modal md" id="active-modal-box">
      <div class="mh">
        <h3>${esc(title)}</h3>
        <button class="modal-close" onclick="window.crmApp.closeActiveModal()"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="mc">
        ${contentHtml}
      </div>
      <div class="mb">
        ${footerButtonsHtml}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Close when clicking outside box boundary
  overlay.addEventListener('click', (e) => {
    if (e.target.id === 'active-modal-overlay') {
      closeActiveModal();
    }
  });
}

export function closeActiveModal() {
  const modal = document.getElementById('active-modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Leads creation popup modal
function openNewLeadModalForm() {
  const formHtml = `
    <div class="auth-body">
      <div class="fr2">
        <div class="fg">
          <label>Tên đại diện liên hệ *</label>
          <input type="text" id="m-lead-name" required placeholder="Nguyễn Văn An" />
        </div>
        <div class="fg">
          <label>Tên công ty doanh nghiệp *</label>
          <input type="text" id="m-lead-company" required placeholder="Hòa Phát Group" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Điện thoại liên hệ *</label>
          <input type="tel" id="m-lead-phone" required placeholder="0911222333" />
        </div>
        <div class="fg">
          <label>Địa chỉ Email</label>
          <input type="email" id="m-lead-email" placeholder="contact@company.vn" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Nguồn tiếp cận tuyển sinh</label>
          <select id="m-lead-source">
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Search Form">Google Search Form</option>
            <option value="Referral Partner">Referral Partner</option>
            <option value="Cold Calling Campaign">Cuộc gọi lạnh</option>
          </select>
        </div>
        <div class="fg">
          <label>Độ nóng khẩn cấp (Priority)</label>
          <select id="m-lead-priority">
            <option value="hot">🔥 HOT (Chốt ngay)</option>
            <option value="warm">⚡ WARM (Cần bàn bạc)</option>
            <option value="cold">❄️ COLD (Tương lai)</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Giá trị gói giải pháp dự kiến (VND)</label>
        <input type="number" id="m-lead-val" value="50000000" />
      </div>
    </div>
  `;

  const footerBtns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-save-lead-btn-action">Lưu trữ Lead mới</button>
  `;

  openModalElement('THÊM MỚI SƠ ĐỒ LEAD TIẾP CẬN', formHtml, footerBtns);

  document.getElementById('m-save-lead-btn-action')?.addEventListener('click', () => {
    const name = document.getElementById('m-lead-name').value;
    const comp = document.getElementById('m-lead-company').value;
    const phone = document.getElementById('m-lead-phone').value;
    const val = Number(document.getElementById('m-lead-val').value) || 0;

    if (!name || !comp || !phone) {
      toast('Vui lòng hoàn thiện các trường dữ liệu bắt buộc!', 'error');
      return;
    }

    const newLeadObj = {
      id: `led-${LEADS_DB.length + 1}`,
      name,
      company: comp,
      phone,
      email: document.getElementById('m-lead-email').value || 'email@custom.vn',
      source: document.getElementById('m-lead-source').value,
      status: 'new',
      value: val,
      ownerId: SESSION.id,
      createdAt: '23/05/2026',
      deadline: '30/05/2026',
      priority: document.getElementById('m-lead-priority').value,
      notes: 'Khởi tạo thủ công nhanh từ Topbar'
    };

    LEADS_DB.unshift(newLeadObj);
    toast('Đã khởi tạo sơ đồ quản lý Lead mới!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'leads') {
      renderPageContent('leads');
    }
  });
}

function openNewDealModal() {
  const formHtml = `
    <div class="auth-body">
      <div class="fg">
        <label>Tên Deal thương thảo *</label>
        <input type="text" id="m-deal-title" required placeholder="Hợp đồng tích hợp CRM Aura ERP" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Nhà kinh doanh đại diện</label>
          <select id="m-deal-contact">
            ${CONTACTS_DB.map(c => `<option value="${c.id}">${c.fullName} (${c.companyName})</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Trị giá giao thương ước lượng (₫ VND) *</label>
          <input type="number" id="m-deal-value" value="120000000" />
        </div>
      </div>
    </div>
  `;

  const footerBtns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-save-deal-action-trigger">Bàn giao phễu</button>
  `;

  openModalElement('KHỞI TẠO DEAL THƯƠNG THẢO PHỄU KANBAN', formHtml, footerBtns);

  document.getElementById('m-save-deal-action-trigger')?.addEventListener('click', () => {
    const title = document.getElementById('m-deal-title').value;
    const value = Number(document.getElementById('m-deal-value').value) || 0;
    const contactId = document.getElementById('m-deal-contact').value;
    const selectedContact = CONTACTS_DB.find(c => c.id === contactId);

    if (!title || value <= 0) {
      toast('Vui lòng hoàn thành các trường dữ liệu!', 'error');
      return;
    }

    const newDealObj = {
      id: `dea-${DEALS_DB.length + 1}`,
      name: title,
      contactId: selectedContact.id,
      contactName: selectedContact.fullName,
      companyId: selectedContact.companyId,
      companyName: selectedContact.companyName,
      value,
      stage: 'prospecting',
      probability: 20,
      ownerId: SESSION.id,
      expectedClose: '30/05/2026',
      createdAt: '23/05/2026',
      lastActivity: '23/05/2026'
    };

    DEALS_DB.unshift(newDealObj);
    toast('Đã khởi tạo deal mới trên Kanban Pipeline!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'deals' || CUR_PAGE === 'pipeline') {
      renderPageContent(CUR_PAGE);
    }
  });
}

/* ==========================================================================
   5. DETAILED ENTITY MODALS (Large Modals)
   ========================================================================== */

export function openDealDetailModal(dealId) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  const contact = CONTACTS_DB.find(c => c.id === deal.contactId);
  if (!deal) return;

  const contentHtml = `
    <div style="display:grid; grid-template-cols: 1.5fr 1fr; gap:16px;">
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="panel" style="background-color:var(--n50); padding:12px;">
          <h4 style="font-size:13.5px; font-weight:700; color:var(--b600);"><i class="fa-solid fa-file-contract"></i> ${esc(deal.name)}</h4>
          <p class="mt-12" style="font-size:12px; color:var(--n600);">Bên thụ hưởng: <strong>${esc(deal.companyName)}</strong> (Họ tên: ${esc(deal.contactName)})</p>
          <p style="font-size:12px; font-weight:700; color:var(--n900); margin-top:2px;">Trị giá hợp đồng gói: <span class="tmono">${fmtVND(deal.value)}</span></p>
        </div>

        <!-- Inline Logger activities directly -->
        <div class="panel">
          <h4 style="font-size:11.5px; font-weight:800; color:var(--n400); text-transform:uppercase; margin-bottom:8px;">Nhật ký cuộc gọi thoại và hoạt động liên lạc</h4>
          <div style="display:flex; gap:8px; margin-bottom:12px;">
            <select id="m-activity-type" class="filter-select" style="padding:6px; font-size:11px;">
              <option value="call">📞 Cuộc gọi</option>
              <option value="meeting">📅 Gặp mặt</option>
              <option value="email">📧 Thư tay Follow</option>
            </select>
            <input type="text" id="m-activity-text" placeholder="Nhập tóm tắt biên bản trao đổi ngắn..." style="flex:1; padding:6px; border-radius:var(--rs); border:1px solid var(--bd); font-size:11px;" />
            <button class="btn pr" style="padding:4px 12px; font-size:11px;" onclick="window.crmApp.logDealActivity('${deal.id}')">Ghi lại</button>
          </div>
          
          <div class="activity-tl" id="deal-tl-inject-list">
            <!-- Dynamic activities filtered by dealId -->
          </div>
        </div>
      </div>

      <!-- Right column details -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="panel" style="font-size:12px;">
          <h4 style="font-size:11px; font-weight:800; color:var(--n400); text-transform:uppercase; margin-bottom:8px;">Hồ sơ Đối tác</h4>
          <p>Họ tên: <strong>${esc(contact?.fullName)}</strong></p>
          <p style="margin-top:4px;">Chức vụ: <span class="chip bl">${esc(contact?.title)}</span></p>
          <p style="margin-top:4px;">Điện thoại: <span class="tmono">${contact?.phone}</span></p>
          <p style="margin-top:4px;">Email: <span class="tmono">${esc(contact?.email)}</span></p>
        </div>

        <div class="panel" style="font-size:12px;">
          <h4 style="font-size:11px; font-weight:800; color:var(--n400); text-transform:uppercase; margin-bottom:8px;">Thay đổi thời kỳ phân phối</h4>
          <div class="fg">
            <select id="m-deal-stage-modifier" onchange="window.crmApp.updateDealStageDirectly('${deal.id}', this.value)">
              <option value="prospecting" ${deal.stage==='prospecting'?'selected':''}>Tiếp cận khách hàng</option>
              <option value="qualified" ${deal.stage==='qualified'?'selected':''}>Đánh giá đủ điều kiện</option>
              <option value="proposal" ${deal.stage==='proposal'?'selected':''}>Đề xuất sản phẩm</option>
              <option value="negotiation" ${deal.stage==='negotiation'?'selected':''}>Đàm phán thương vụ</option>
              <option value="closed_won" ${deal.stage==='closed_won'?'selected':''}>Won (Hợp Đồng Thành Công)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  `;

  openModalElement('QUẢN LÝ TIẾN ĐỘ THƯƠNG THẢO DEAL', contentHtml, `<button class="btn pr" onclick="window.crmApp.closeActiveModal()">Hoàn tất</button>`);
  renderDealTimelineListInModal(dealId);
}

function renderDealTimelineListInModal(dealId) {
  const mount = document.getElementById('deal-tl-inject-list');
  if (!mount) return;

  const logs = ACTIVITIES_DB.filter(a => a.dealId === dealId);
  if (logs.length === 0) {
    mount.innerHTML = `<p style="font-size:11px; color:var(--n400); text-align:center;">Chưa lưu giữ hoạt động tác nghiệm nào.</p>`;
    return;
  }

  mount.innerHTML = logs.map(l => `
    <div class="tl-item">
      <div class="tl-ic ${l.type === 'call' ? 'call' : l.type === 'meeting' ? 'meeting' : 'note'}"></div>
      <div class="tl-body">
        <span class="tl-title">${esc(l.title)}</span>
        <span class="tl-desc">${esc(l.notes)}</span>
        <span class="tl-meta">${l.datetime} &middot; Ghi nhận: ${esc(l.outcome)}</span>
      </div>
    </div>
  `).join('');
}

export function logDealActivity(dealId) {
  const type = document.getElementById('m-activity-type').value;
  const text = document.getElementById('m-activity-text').value;

  if (!text) {
    toast('Vui lòng nhập tóm tắt trao đổi!', 'error');
    return;
  }

  const dealObj = DEALS_DB.find(d => d.id === dealId);

  const newActObj = {
    id: `act-${ACTIVITIES_DB.length + 1}`,
    type,
    title: `${type === 'call' ? 'Cuộc gọi thoại' : type === 'meeting' ? 'Buổi gặp mặt' : 'Email trao đổi'}`,
    contactId: dealObj.contactId,
    dealId,
    ownerId: SESSION.id,
    datetime: '23/05/2026 08:30',
    duration: '15 phút',
    outcome: 'Đã hoàn tất',
    notes: text,
    direction: 'outbound'
  };

  ACTIVITIES_DB.unshift(newActObj);
  toast('Đã lưu chép hoạt động trao đổi thành công!', 'success');
  document.getElementById('m-activity-text').value = '';
  renderDealTimelineListInModal(dealId);
}

export function updateDealStageDirectly(dealId, newSt) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  if (deal) {
    deal.stage = newSt;
    toast(`Đã cập nhật Deal ${deal.name} sang phân kỳ mới thành công!`, 'success');
    if (CUR_PAGE === 'deals' || CUR_PAGE === 'pipeline') {
      renderPageContent(CUR_PAGE);
    }
  }
}

/* ==========================================================================
   6. FUNCTIONAL QUOTE BUILDER WIDGET
   ========================================================================== */

function setupQuotationsEventHandlers() {
  document.getElementById('quotations-open-builder-trigger-btn')?.addEventListener('click', () => {
    openQuotationsCalculatorDialog();
  });
}

function openQuotationsCalculatorDialog() {
  const content = drawQuoteBuilderInner();
  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="qb-save-grand-quote-action-btn"><i class="fa-solid fa-save"></i> Phát hành báo giá</button>
  `;

  openModalElement('BỘ CÔNG CỤ TÍNH VÀ KHỞI TẠO BÁO GIÁ SẢN PHẨM', content, btns);
  
  // Attach Row calculation events directly
  document.getElementById('qb-append-item-row-btn')?.addEventListener('click', () => appendCalculatorRow());
  document.getElementById('qb-vat-toggle')?.addEventListener('change', () => calculateGrandTotals());

  // Append first default row
  appendCalculatorRow();

  document.getElementById('qb-save-grand-quote-action-btn')?.addEventListener('click', () => {
    const contactId = document.getElementById('qb-customer-contact').value;
    const contact = CONTACTS_DB.find(c => c.id === contactId);
    
    // Read structured rows
    const rows = document.querySelectorAll('.qb-prod-calc-row');
    const invoiceItems = [];
    rows.forEach(r => {
      const pId = r.querySelector('.row-p-select').value;
      const qty = Number(r.querySelector('.row-p-qty').value) || 0;
      const product = PRODUCTS_DB.find(p => p.id === pId);
      if (product && qty > 0) {
        invoiceItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          qty,
          desc: product.description
        });
      }
    });

    if (invoiceItems.length === 0) {
      toast('Vui lòng thêm tối thiểu 1 hạng mục sản phẩm để tính giá!', 'error');
      return;
    }

    // Auto-math sub, tax and grand
    let subtotal = invoiceItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    let vat = Math.round(subtotal * 0.1);
    let total = subtotal + (document.getElementById('qb-vat-toggle').checked ? vat : 0);

    const newQuoteObj = {
      id: `qte-${QUOTES_DB.length + 1}`,
      number: `BG-2026-${(QUOTES_DB.length + 1).toString().padStart(4, "0")}`,
      contactId: contact.id,
      contactName: contact.fullName,
      dealId: 'dea-1',
      items: invoiceItems,
      subtotal,
      vat,
      total,
      status: 'xhapt',
      createdAt: '23/05/2026',
      validUntil: document.getElementById('qb-valid-until').value,
      ownerId: SESSION.id,
      terms: document.getElementById('qb-terms-conditions').value,
      notes: 'Bản báo giá được phát hành tự động qua máy tính phễu'
    };

    QUOTES_DB.unshift(newQuoteObj);
    toast('Đã khởi tạo và phát hành phiếu báo giá mới thành công!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'quotes') {
      renderPageContent('quotes');
    }
  });
}

function appendCalculatorRow() {
  const tbody = document.getElementById('qb-items-body-rows');
  if (!tbody) return;

  const trId = `tr-calc-${Date.now()}`;
  const tr = document.createElement('tr');
  tr.id = trId;
  tr.className = 'qb-prod-calc-row';
  
  tr.innerHTML = `
    <td>
      <select class="row-p-select filter-select" style="width:100%;">
        ${PRODUCTS_DB.map(p=>`<option value="${p.id}" data-price="${p.price}">${esc(p.name)} (${p.price} ₫)</option>`).join('')}
      </select>
    </td>
    <td class="tmono row-p-unit-price" style="font-size:12px; font-weight:700;">${PRODUCTS_DB[0].price} ₫</td>
    <td>
      <input type="number" class="row-p-qty" min="1" value="1" style="width:60px; padding:4px;" />
    </td>
    <td class="tmono row-p-line-sum" style="font-size:12px; font-weight:700; text-align:right;">${PRODUCTS_DB[0].price} ₫</td>
    <td style="text-align:center;">
      <button type="button" class="btn rd icon-only" style="width:24px; height:24px;" onclick="window.crmApp.removeCalculatorRow('${trId}')"><i class="fa-solid fa-trash-can" style="font-size:10px;"></i></button>
    </td>
  `;

  tbody.appendChild(tr);

  // Attach dynamic event change listener
  const select = tr.querySelector('.row-p-select');
  const qty = tr.querySelector('.row-p-qty');

  select.addEventListener('change', () => calculateRowSum(tr));
  qty.addEventListener('input', () => calculateRowSum(tr));

  calculateGrandTotals();
}

export function removeCalculatorRow(trId) {
  const row = document.getElementById(trId);
  if (row) {
    row.remove();
    calculateGrandTotals();
  }
}

function calculateRowSum(tr) {
  const select = tr.querySelector('.row-p-select');
  const qtyInput = tr.querySelector('.row-p-qty');
  const priceLabel = tr.querySelector('.row-p-unit-price');
  const sumLabel = tr.querySelector('.row-p-line-sum');

  const opt = select.options[select.selectedIndex];
  const price = Number(opt.getAttribute('data-price')) || 0;
  const qty = Number(qtyInput.value) || 0;

  const total = price * qty;
  priceLabel.innerText = price.toLocaleString('vi-VN') + ' ₫';
  sumLabel.innerText = total.toLocaleString('vi-VN') + ' ₫';

  calculateGrandTotals();
}

function calculateGrandTotals() {
  const rows = document.querySelectorAll('.qb-prod-calc-row');
  let subtotal = 0;

  rows.forEach(r => {
    const select = r.querySelector('.row-p-select');
    const qtyInput = r.querySelector('.row-p-qty');
    const opt = select.options[select.selectedIndex];
    const price = Number(opt.getAttribute('data-price')) || 0;
    const qty = Number(qtyInput.value) || 0;
    subtotal += price * qty;
  });

  const vatChecked = document.getElementById('qb-vat-toggle')?.checked;
  const vat = vatChecked ? Math.round(subtotal * 0.1) : 0;
  const grand = subtotal + vat;

  const subInject = document.getElementById('qb-subtotal-inject');
  const taxInject = document.getElementById('qb-tax-inject');
  const totalInject = document.getElementById('qb-total-inject');

  if (subInject) subInject.innerText = subtotal.toLocaleString('vi-VN') + ' ₫';
  if (taxInject) taxInject.innerText = vat.toLocaleString('vi-VN') + ' ₫';
  if (totalInject) totalInject.innerText = grand.toLocaleString('vi-VN') + ' ₫';
}

export function printQuotation(quoteId) {
  const quote = QUOTES_DB.find(q => q.id === quoteId);
  if (!quote) return;

  // Render minimal styling printable invoice view
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>In Báo Giá ${quote.number}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
          .details { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background-color: #f1f5f9; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #cbd5e1; }
          .totals { display: flex; flex-direction: column; align-items: flex-end; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">AURA TECHNOLOGY CRM PORTAL</div>
            <p>Giải pháp Chuyển đổi số doanh nghiệp chuẩn B2B</p>
          </div>
          <div style="text-align: right;">
            <h2>PHIẾU BÁO GIÁ CHÍNH THỨC</h2>
            <p>Mã HS: <strong>${quote.number}</strong></p>
            <p>Ngày lập: ${quote.createdAt}</p>
          </div>
        </div>
        
        <div class="details">
          <div>
            <h3>BÊN CUNG CẤP DỊCH VỤ:</h3>
            <strong>CÔNG TY CỔ PHẦN CÔNG NGHỆ AURA</strong>
            <p>Địa chỉ Trụ sở: Nguyễn Huệ, Quận 1, Tp. Hồ Chí Minh</p>
          </div>
          <div>
            <h3>ĐẠI DIỆN THỤ HƯỞNG TIỀN:</h3>
            <strong>Khách hàng: ${quote.contactName}</strong>
            <p>Thời hạn biểu giá hiệu lực: ${quote.validUntil}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sản phẩm / Giải pháp triển khai</th>
              <th>Đơn giá công bảng</th>
              <th>Số lượng mua</th>
              <th style="text-align: right;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${quote.items.map(it => `
              <tr>
                <td><strong>${it.name}</strong><br/><small>${it.desc || ''}</small></td>
                <td>${it.price.toLocaleString('vi-VN')} ₫</td>
                <td>${it.qty}</td>
                <td style="text-align: right;">${(it.price * it.qty).toLocaleString('vi-VN')} ₫</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <p>Cộng khoản (Subtotal): ${quote.subtotal.toLocaleString('vi-VN')} ₫</p>
          <p>Thuế giá trị giá tăng VAT (10%): ${quote.vat.toLocaleString('vi-VN')} ₫</p>
          <p style="color:#2563eb; font-size:18px; margin-top:10px;">TỔNG THANH TOÁN: ${quote.total.toLocaleString('vi-VN')} ₫</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

/* ==========================================================================
   7. LIVE SUPPORT TICKETS REPLICA THREAD ACTIONS
   ========================================================================= */

function setupTicketsPageEvents() {
  document.getElementById('support-tickets-new-creator-trigger')?.addEventListener('click', () => {
    openTicketCreatorForm();
  });
}

function setupReportsEventHandlers() {
  const rangeSelect = document.getElementById('rpt-filter-range');
  const repSelect = document.getElementById('rpt-filter-rep');
  const growthInput = document.getElementById('rpt-growth-expect');
  const submitBtn = document.getElementById('rpt-submit-filter-btn');
  const refreshBtn = document.getElementById('rpt-refresh-btn');
  const exportBtn = document.getElementById('rpt-export-excel-btn');

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      REPORT_FILTER_STATE.range = rangeSelect.value;
      REPORT_FILTER_STATE.repId = repSelect.value;
      REPORT_FILTER_STATE.growthExpect = parseInt(growthInput.value) || 15;
      toast('Đã lọc và cập nhật phân tích dòng tiền!', 'success');
      renderPageContent('reports');
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      toast('Đã đồng bộ hóa dữ liệu phân tích mới nhất từ ERP!', 'info');
      renderPageContent('reports');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      toast('Đang tạo báo cáo thống kê chu kỳ tài chính ERP...', 'info');
      setTimeout(() => {
        toast('Xuất báo cáo Aura_Sales_Report_' + REPORT_FILTER_STATE.range + 'M.xlsx thành công!', 'success');
      }, 800);
    });
  }
}

function openTicketCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Chủ đề sự cố kỹ thuật *</label>
        <input type="text" id="m-tk-subject" required placeholder="Lỗi không thể truy xuất API Token" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Khách hàng đại diện</label>
          <select id="m-tk-contact">
            ${CONTACTS_DB.map(c => `<option value="${c.id}">${c.fullName} (${c.companyName})</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Cấp độ khẩn cấp (Priority)</label>
          <select id="m-tk-priority">
            <option value="Critical">🚨 Critical (Mức cao nhất)</option>
            <option value="High">🔴 High (Cần trực khẩn)</option>
            <option value="Medium">🟠 Medium (Bình thường)</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Cách thức tiếp nhận thông báo</label>
        <select id="m-tk-channel">
          <option value="Email">Email công sở</option>
          <option value="Chat">Mục Chatbox Website</option>
          <option value="Phone">Tổng đài nóng</option>
        </select>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-save-ticket-bttn-action">Ghim Ticket</button>
  `;

  openModalElement('KHỞI TẠO TICKET SỰ CỐ KỸ THUẬT', content, btns);

  document.getElementById('m-save-ticket-bttn-action')?.addEventListener('click', () => {
    const sub = document.getElementById('m-tk-subject').value;
    const contactId = document.getElementById('m-tk-contact').value;
    const contact = CONTACTS_DB.find(c => c.id === contactId);

    if (!sub) {
      toast('Vui lòng điền chủ đề ticket!', 'error');
      return;
    }

    const newTicket = {
      id: `tk-${TICKETS_DB.length + 1}`,
      number: `TK-${(TICKETS_DB.length + 1).toString().padStart(4, "0")}`,
      subject: `${sub} [${contact.companyName}]`,
      contactId: contact.id,
      contactName: contact.fullName,
      channel: document.getElementById('m-tk-channel').value,
      priority: document.getElementById('m-tk-priority').value,
      status: 'open',
      agentId: SESSION.id,
      createdAt: '23/05/2026 08:30',
      lastReply: '23/05/2026 08:30',
      slaHours: 4,
      tags: 'Lỗi',
      messages: [{ sender: 'customer', text: 'Cần hỗ trợ gấp, vui lòng kiểm tra', time: '08:30' }]
    };

    TICKETS_DB.unshift(newTicket);
    toast('Đã khởi tạo vé sự cố mới thành công!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'tickets') {
      renderPageContent('tickets');
    }
  });
}

export function openTicketDetail(ticketId) {
  const tk = TICKETS_DB.find(t => t.id === ticketId);
  if (!tk) return;

  const content = drawTicketMessageThread(tk);
  openModalElement(`HỘI THOẠI HỖ TRỢ TICKET ${tk.number}`, content, `
    <button class="btn gr" onclick="window.crmApp.markTicketResolved('${tk.id}')"><i class="fa-solid fa-circle-check"></i> Đánh giá Đã giải quyết (Resolved)</button>
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
  `);

  // Scroll down to messaging bottoms
  setTimeout(() => {
    const sc = document.getElementById('live-ticket-scroller-box');
    if (sc) sc.scrollTop = sc.scrollHeight;
  }, 50);
}

export function applyCannedResponseToBox() {
  const select = document.getElementById('support-sc-canned-selector');
  const txt = document.getElementById('support-reply-textarea-editor');
  if (select && txt && select.value) {
    txt.value = select.value;
  }
}

export function submitAgentResponseToTicket(ticketId) {
  const txt = document.getElementById('support-reply-textarea-editor');
  if (!txt || !txt.value.trim()) {
    toast('Vui lòng nhập nội dung câu phản hồi!', 'error');
    return;
  }

  const tk = TICKETS_DB.find(t => t.id === ticketId);
  if (tk) {
    tk.messages.push({
      sender: 'agent',
      text: txt.value.trim(),
      time: '08:45'
    });
    tk.lastReply = '23/05/2026 08:45';
    
    toast('Gửi phản hồi thành công!', 'success');
    txt.value = '';
    
    // Refresh modal body directly by reloading message elements
    const modalBody = document.getElementById('active-modal-box')?.querySelector('.mc');
    if (modalBody) {
      modalBody.innerHTML = drawTicketMessageThread(tk);
      // Auto scroll
      setTimeout(() => {
        const sc = document.getElementById('live-ticket-scroller-box');
        if (sc) sc.scrollTop = sc.scrollHeight;
      }, 50);
    }
  }
}

export function markTicketResolved(ticketId) {
  const tk = TICKETS_DB.find(t => t.id === ticketId);
  if (tk) {
    tk.status = 'resolved';
    toast(`Ticket ${tk.number} đã kết hóa giải quyết!`, 'success');
    closeActiveModal();
    if (CUR_PAGE === 'tickets' || CUR_PAGE === 'dashboard-support') {
      renderPageContent(CUR_PAGE);
    }
  }
}

/* ==========================================================================
   8. CLIENTS - CONTACTS ACTIONS
   ========================================================================== */

function setupCustomersEvents() {
  document.getElementById('cust-tab-b2b-btn')?.addEventListener('click', () => {
    CUSTOMER_TAB_STATE = 'b2b';
    renderPageContent('contacts');
  });

  document.getElementById('cust-tab-b2c-btn')?.addEventListener('click', () => {
    CUSTOMER_TAB_STATE = 'b2c';
    renderPageContent('contacts');
  });

  document.getElementById('contacts-toggle-creator-trigger-btn')?.addEventListener('click', () => {
    openContactCreatorForm();
  });

  document.getElementById('companies-toggle-creator-trigger-btn')?.addEventListener('click', () => {
    openCompanyCreatorForm();
  });
}

function openCompanyCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Tên Doanh Nghiệp B2B *</label>
        <input type="text" id="m-comp-name" required placeholder="Tập đoàn Aura Việt Nam" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Nhóm ngành / Lĩnh vực *</label>
          <input type="text" id="m-comp-ind" required placeholder="Khách sạn & Du lịch" />
        </div>
        <div class="fg">
          <label>Quy mô nhân lực *</label>
          <select id="m-comp-size">
            <option value="1-50 nhân sự">Quy mô Nhỏ (1-50)</option>
            <option value="50-200 nhân sự">Quy mô Vừa (50-200)</option>
            <option value="200-1000 nhân sự">Quy mô Lớn (200-1000)</option>
            <option value="1000+ nhân sự">Đại Doanh Nghiệp (1000+)</option>
          </select>
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Số điện thoại đối tác *</label>
          <input type="tel" id="m-comp-phone" required placeholder="0243123456" />
        </div>
        <div class="fg">
          <label>Trang Web chính thức *</label>
          <input type="url" id="m-comp-web" required placeholder="https://auracorp.vn" />
        </div>
      </div>
      <div class="fg">
        <label>Ước tính Doanh Thu đóng góp (VND/Năm)</label>
        <input type="number" id="m-comp-rev" placeholder="500000000" />
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-comp-save-btn">Lưu Doanh Nghiệp</button>
  `;

  openModalElement('KHỞI TẠO PHÁP NHÂN DOANH NGHIỆP B2B MỚI', content, btns);

  document.getElementById('m-comp-save-btn')?.addEventListener('click', () => {
    const name = document.getElementById('m-comp-name').value;
    const industry = document.getElementById('m-comp-ind').value;
    const size = document.getElementById('m-comp-size').value;
    const phone = document.getElementById('m-comp-phone').value;
    const website = document.getElementById('m-comp-web').value;
    const rev = parseInt(document.getElementById('m-comp-rev').value) || 0;

    if (!name || !industry || !phone || !website) {
      toast('Vui lòng hoàn thành mọi thông tin bắt buộc!', 'error');
      return;
    }

    const nComp = {
      id: `comp-${COMPANIES_DB.length + 1}`,
      name,
      industry,
      size,
      phone,
      website,
      revenue: rev
    };

    COMPANIES_DB.unshift(nComp);
    toast('Đã khởi tạo thành công doanh nghiệp B2B mới!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'contacts') {
      renderPageContent('contacts');
    }
  });
}

function openContactCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fr2">
        <div class="fg">
          <label>Họ Khách hàng *</label>
          <input type="text" id="m-con-ln" required placeholder="Phạm" />
        </div>
        <div class="fg">
          <label>Tên Khách hàng *</label>
          <input type="text" id="m-con-fn" required placeholder="Chinh" />
        </div>
      </div>
      <div class="fg">
        <label>Chức vụ doanh nghiệp *</label>
        <input type="text" id="m-con-title" required placeholder="Trưởng phòng HCNS" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Nhà doanh nghiệp liên kết</label>
          <select id="m-con-comp">
            ${COMPANIES_DB.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Số điện thoại *</label>
          <input type="tel" id="m-con-phone" required placeholder="0901234567" />
        </div>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-con-save-bttn-fire">Thêm liên hệ</button>
  `;

  openModalElement('THÊM LIÊN HỆ ĐA KÊNH MỚI', content, btns);

  document.getElementById('m-con-save-bttn-fire')?.addEventListener('click', () => {
    const fn = document.getElementById('m-con-fn').value;
    const ln = document.getElementById('m-con-ln').value;
    const title = document.getElementById('m-con-title').value;
    const phone = document.getElementById('m-con-phone').value;
    const cId = document.getElementById('m-con-comp').value;
    const company = COMPANIES_DB.find(c => c.id === cId);

    if (!fn || !ln || !title || !phone) {
      toast('Vui lòng cung cấp toàn bộ thông tin bắt buộc!', 'error');
      return;
    }

    const nObj = {
      id: `con-${CONTACTS_DB.length + 1}`,
      firstName: fn,
      lastName: ln,
      fullName: `${ln} ${fn}`,
      title,
      companyId: company.id,
      companyName: company.name,
      phone,
      email: `${fn.toLowerCase()}@custom.vn`,
      source: 'Direct Web',
      ownerId: SESSION.id,
      tags: 'Khách mới',
      dealsCount: 1,
      lastActivity: '23/05/2026',
      notes: 'Lịch sử chép tay trực tiếp'
    };

    CONTACTS_DB.unshift(nObj);
    toast('Đã thêm thành công hồ sơ liên hệ mới!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'contacts') {
      renderPageContent('contacts');
    }
  });
}

export function deleteContact(conId) {
  const idx = CONTACTS_DB.findIndex(c => c.id === conId);
  if (idx !== -1) {
    CONTACTS_DB.splice(idx, 1);
    toast('Đã khóa và gỡ bỏ hồ sơ liên hệ!', 'warn');
    renderPageContent(CUR_PAGE);
  }
}

/* ==========================================================================
   9. CORE SUBPAGE RENDERS & MISCELLANEOUS
   ========================================================================== */

function setupLeadsEventHandlers() {
  document.getElementById('lead-add-modal-trigger')?.addEventListener('click', () => {
    openNewLeadModalForm();
  });

  // Category tab clicking filters
  document.querySelectorAll('.tabbar .tab').forEach(t => {
    t.addEventListener('click', () => {
      ACTIVE_TAB_STATE = t.getAttribute('data-tab');
      renderPageContent('leads');
    });
  });

  // Select Filters inputs triggers
  document.getElementById('leads-source-filter')?.addEventListener('change', (e) => {
    FILTER_STATE.source = e.target.value;
    renderPageContent('leads');
  });
  document.getElementById('leads-priority-filter')?.addEventListener('change', (e) => {
    FILTER_STATE.priority = e.target.value;
    renderPageContent('leads');
  });

  // Search input typing box debounced
  document.getElementById('leads-search-input')?.addEventListener('input', debounce((e) => {
    FILTER_STATE.search = e.target.value;
    renderPageContent('leads');
  }, 250));
}

function setupKanbanEventHandlers() {
  document.getElementById('deals-tab-kanban-btn')?.addEventListener('click', () => {
    DEALS_TAB_STATE = 'kanban';
    renderPageContent('deals');
  });

  document.getElementById('deals-tab-list-btn')?.addEventListener('click', () => {
    DEALS_TAB_STATE = 'list';
    renderPageContent('deals');
  });

  document.getElementById('pipeline-quick-add-deal-btn')?.addEventListener('click', () => {
    openNewDealModal();
  });
}

function setupTasksEventHandlers() {
  document.getElementById('tasks-open-creator-modal-trigger')?.addEventListener('click', () => {
    openTaskCreatorForm();
  });
  document.getElementById('activities-toggle-creator-trigger-btn')?.addEventListener('click', () => {
    openActivityCreatorForm();
  });
}

function openActivityCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Tiêu đề Nhật ký tác nghiệp *</label>
        <input type="text" id="m-act-title" required placeholder="Gọi điện đàm phán hợp đồng cung cấp Aura CRM" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Hình thức liên lạc *</label>
          <select id="m-act-type">
            <option value="call">📞 Cuộc gọi thoại Outbound/Inbound</option>
            <option value="email">📧 Gửi Thư Điện Tử (Email)</option>
            <option value="meeting">📅 Khởi tạo Lịch hẹn Gặp mặt</option>
            <option value="note">📝 Ghi chú nhật sự kiện khác</option>
          </select>
        </div>
        <div class="fg">
          <label>Thời lượng (Phút) *</label>
          <input type="text" id="m-act-duration" required placeholder="15 phút" value="15 phút" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Thời gian ghi nhận *</label>
          <input type="text" id="m-act-datetime" required value="23/05/2026 14:30" />
        </div>
        <div class="fg">
          <label>Hướng tác vụ</label>
          <select id="m-act-dir">
            <option value="outbound">outbound (Gọi đi / Gửi đi)</option>
            <option value="inbound">inbound (Nhận cuộc gọi / Thư phản hồi)</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Kết luận rút ra / Thành quả đạt được *</label>
        <input type="text" id="m-act-outcome" required placeholder="Khách hàng đồng ý nhận biểu giá qua Email và book họp demo" />
      </div>
      <div class="fg">
        <label>Lưu bút ghi chú bổ sung</label>
        <textarea id="m-act-notes" rows="2" placeholder="Ghi chú các điểm quan ngại hoặc dặn dò đặc biệt..."></textarea>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-act-save-btn">Lưu Nhật ký Tác nghiệp</button>
  `;

  openModalElement('GHI NHẬN HÀNH TRÌNH TÁC NGHIỆP', content, btns);

  document.getElementById('m-act-save-btn')?.addEventListener('click', () => {
    const title = document.getElementById('m-act-title').value;
    const type = document.getElementById('m-act-type').value;
    const duration = document.getElementById('m-act-duration').value;
    const datetime = document.getElementById('m-act-datetime').value;
    const direction = document.getElementById('m-act-dir').value;
    const outcome = document.getElementById('m-act-outcome').value;
    const notes = document.getElementById('m-act-notes').value || 'Không có ghi chú thêm.';

    if (!title || !duration || !outcome) {
      toast('Vui lòng cung cấp toàn bộ thông tin bắt buộc!', 'error');
      return;
    }

    const nAct = {
      id: `act-${ACTIVITIES_DB.length + 1}`,
      title,
      type,
      datetime,
      duration,
      direction,
      outcome,
      notes
    };

    ACTIVITIES_DB.unshift(nAct);
    toast('Đã lưu dữ liệu tác nghiệp mới!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'tasks') {
      renderPageContent('tasks');
    }
  });
}

function setupProductsEventHandlers() {
  document.getElementById('products-toggle-creator-trigger-btn')?.addEventListener('click', () => {
    openProductCreatorForm();
  });
}

function setupInvoicesEventHandlers() {
  document.getElementById('invoices-quick-issue-btn')?.addEventListener('click', () => {
    openInvoiceCreatorForm();
  });
}

function openInvoiceCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Mã Hóa Đơn Mới *</label>
        <input type="text" id="m-inv-num" value="HD-2026-${(INVOICES_DB.length + 1).toString().padStart(4, '0')}" required />
      </div>
      <div class="fg">
        <label>Chọn Đơn Báo Giá liên đới *</label>
        <select id="m-inv-quote-select">
          ${QUOTES_DB.map(q => `<option value="${q.id}" data-total="${q.total}" data-cname="${q.contactName}" data-cid="${q.contactId}">${q.number} - ${esc(q.contactName)} (${fmtVND(q.total)})</option>`).join('')}
        </select>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Hạn thanh toán hóa đơn *</label>
          <input type="text" id="m-inv-duedate" value="30/06/2026" required />
        </div>
        <div class="fg">
          <label>Trạng thái khởi tạo *</label>
          <select id="m-inv-status">
            <option value="partial">Đặt cọc thanh toán trước 50%</option>
            <option value="overdue">Chờ thanh toán (Ghi Nợ)</option>
            <option value="paid">Đã thanh toán đủ (100% Paid)</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Ghi chú sổ sách hóa đơn / VAT</label>
        <textarea id="m-inv-notes" rows="2" placeholder="Xuất hóa đơn điện tử cho doanh nghiệp hoặc cá nhân..."></textarea>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-inv-save-btn">Phát hành Hóa đơn</button>
  `;

  openModalElement('XUẤT BẢN HÓA ĐƠN ĐỎ (VAT INVOICE)', content, btns);

  document.getElementById('m-inv-save-btn')?.addEventListener('click', () => {
    const num = document.getElementById('m-inv-num').value;
    const qSelect = document.getElementById('m-inv-quote-select');
    const qOpt = qSelect.options[qSelect.selectedIndex];
    
    if (!qOpt) {
      toast('Vui lòng chọn một đơn báo giá để phát hành hóa đơn!', 'error');
      return;
    }

    const quoteId = qSelect.value;
    const total = parseInt(qOpt.getAttribute('data-total')) || 0;
    const contactName = qOpt.getAttribute('data-cname');
    const contactId = qOpt.getAttribute('data-cid');
    const dueDate = document.getElementById('m-inv-duedate').value;
    const status = document.getElementById('m-inv-status').value;
    const notes = document.getElementById('m-inv-notes').value || 'Không có ghi chú thêm.';

    if (!num || !dueDate) {
      toast('Vui lòng cung cấp toàn bộ thông tin bắt buộc!', 'error');
      return;
    }

    const nInv = {
      id: `inv-${INVOICES_DB.length + 1}`,
      number: num,
      quoteId,
      contactId,
      contactName,
      items: [],
      total,
      status,
      dueDate,
      paidAt: status === 'paid' ? '23/05/2026' : '',
      notes
    };

    INVOICES_DB.unshift(nInv);
    toast('Đã phát hành hóa đơn tài chính mới thành công!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'invoices') {
      renderPageContent('invoices');
    }
  });
}

function openProductCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Tên Sản phẩm / Giải pháp mới *</label>
        <input type="text" id="m-prod-name" required placeholder="Aura AI CRM - Enterprise Edition" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Mã sản phẩm (SKU) *</label>
          <input type="text" id="m-prod-code" required placeholder="AURA-AI-ENT" />
        </div>
        <div class="fg">
          <label>Nhóm danh mục *</label>
          <select id="m-prod-cat">
            <option value="Software">Bản quyền Phần mềm (SaaS)</option>
            <option value="Hardware">Thiết bị phần cứng</option>
            <option value="Service">Dịch vụ tích hợp</option>
            <option value="Consult">Tư vấn / Đào tạo</option>
          </select>
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Đơn giá tiêu chuẩn *</label>
          <input type="number" id="m-prod-price" required placeholder="120000000" />
        </div>
        <div class="fg">
          <label>Số lượng kho ban đầu *</label>
          <input type="number" id="m-prod-stock" required placeholder="99" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Đơn vị tính *</label>
          <input type="text" id="m-prod-unit" required placeholder="Gói/Năm" />
        </div>
        <div class="fg">
          <label>Biểu tượng Emoji đại diện *</label>
          <input type="text" id="m-prod-emoji" required placeholder="☁️" />
        </div>
      </div>
      <div class="fg">
        <label>Mô tả chi tiết giải pháp *</label>
        <textarea id="m-prod-desc" rows="3" required placeholder="Hệ thống điều phối dữ liệu khách hàng đa kênh tích hợp máy trí tuệ nhân tạo dự đoán xu hướng chốt thương vụ sales..."></textarea>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-prod-save-btn">Đăng bán Sản phẩm</button>
  `;

  openModalElement('KHỞI TẠO SẢN PHẨM MỚI TRÊN KỆ HỆ SINH THÁI', content, btns);

  document.getElementById('m-prod-save-btn')?.addEventListener('click', () => {
    const name = document.getElementById('m-prod-name').value;
    const code = document.getElementById('m-prod-code').value;
    const category = document.getElementById('m-prod-cat').value;
    const price = parseInt(document.getElementById('m-prod-price').value) || 0;
    const stock = parseInt(document.getElementById('m-prod-stock').value) || 0;
    const unit = document.getElementById('m-prod-unit').value;
    const emoji = document.getElementById('m-prod-emoji').value;
    const description = document.getElementById('m-prod-desc').value;

    if (!name || !code || !price || !description) {
      toast('Vui lòng nhập đầy đủ thông tin giải pháp!', 'error');
      return;
    }

    const nProd = {
      id: `prod-${PRODUCTS_DB.length + 1}`,
      name,
      code,
      category,
      price,
      stock,
      unit,
      emoji,
      description,
      status: 'active'
    };

    PRODUCTS_DB.unshift(nProd);
    toast('Đã niêm yết sản phẩm mới thành công!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'products') {
      renderPageContent('products');
    }
  });
}

function openTaskCreatorForm() {
  const content = `
    <div class="auth-body">
      <div class="fg">
        <label>Tiêu đề việc cần làm *</label>
        <input type="text" id="m-task-title" required placeholder="Gặp mặt thương thảo nốt tỷ trọng" />
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Kỳ hạn hoàn công *</label>
          <input type="date" id="m-task-date" required value="2026-05-23" />
        </div>
        <div class="fg">
          <label>Cấp độ ưu tiên</label>
          <select id="m-task-prio">
            <option value="high">🚨 Đỏ (Cao cấp khẩn)</option>
            <option value="medium">⚡ Vàng</option>
            <option value="low">❄️ Xám</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Mô tả chi tiết</label>
        <textarea id="m-task-desc" rows="2" placeholder="Cần hoàn thiện slide trước giờ hẹn..."></textarea>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-task-save-action-trigger">Thêm nhiệm vụ</button>
  `;

  openModalElement('KHỞI TẠO TÁC VỤ CHECKLIST MỚI', content, btns);

  document.getElementById('m-task-save-action-trigger')?.addEventListener('click', () => {
    const title = document.getElementById('m-task-title').value;
    const date = document.getElementById('m-task-date').value;

    if (!title) {
      toast('Vui lòng nhập tiêu đề!', 'error');
      return;
    }

    const nTsk = {
      id: `tsk-${TASKS_DB.length + 1}`,
      title,
      type: 'Follow-up',
      description: document.getElementById('m-task-desc').value || 'Không có mô tả bổ sung.',
      relatedTo: 'None',
      relatedId: '',
      ownerId: SESSION.id,
      dueDate: date,
      priority: document.getElementById('m-task-prio').value,
      status: 'not_started',
      completed: false,
      subtasks: []
    };

    TASKS_DB.unshift(nTsk);
    toast('Đã ghi nhận nhiệm vụ cần làm mới!', 'success');
    closeActiveModal();
    if (CUR_PAGE === 'tasks' || CUR_PAGE === 'dashboard-salesrep') {
      renderPageContent(CUR_PAGE);
    }
  });
}

export function switchTaskView(tag) {
  ACTIVE_TAB_STATE = tag;
  renderPageContent('tasks');
}

export function toggleTaskCompletion(taskId) {
  const tk = TASKS_DB.find(t => t.id === taskId);
  if (tk) {
    tk.completed = !tk.completed;
    tk.status = tk.completed ? 'completed' : 'in_progress';
    toast(tk.completed ? 'Đã ghim hoàn tất tác vụ (Strikethrough complete)!' : 'Đã khôi phục tác vụ về hàng chờ.', 'success');
    renderPageContent(CUR_PAGE);
  }
}

export function deleteTask(taskId) {
  const idx = TASKS_DB.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    TASKS_DB.splice(idx, 1);
    toast('Đã gỡ bỏ tác vụ khỏi sổ tay!', 'warn');
    renderPageContent(CUR_PAGE);
  }
}

export function deleteLead(leadId) {
  const idx = LEADS_DB.findIndex(l => l.id === leadId);
  if (idx !== -1) {
    LEADS_DB.splice(idx, 1);
    toast('Đã gỡ bỏ bản ghi Lead tiếp cận!', 'warn');
    renderPageContent('leads');
  }
}

export function convertLeadToDeal(leadId) {
  const lead = LEADS_DB.find(l => l.id === leadId);
  if (lead) {
    const newDeal = {
      id: `dea-${DEALS_DB.length + 1}`,
      name: `Hợp đồng cung cấp cho ${lead.company}`,
      contactId: 'con-1',
      contactName: lead.name,
      companyId: 'cmp-1',
      companyName: lead.company,
      value: lead.value,
      stage: 'prospecting',
      probability: 20,
      ownerId: SESSION.id,
      expectedClose: '30/05/2026',
      createdAt: '23/05/2026',
      lastActivity: '23/05/2026'
    };

    DEALS_DB.unshift(newDeal);
    const idx = LEADS_DB.findIndex(l => l.id === leadId);
    if (idx !== -1) LEADS_DB.splice(idx, 1);

    toast('Đã chuyển đối Lead thành công thành cơ hội đàm phán thương thuyết!', 'success');
    go('deals');
  }
}

export function moveDealNextStage(dealId) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  if (!deal) return;

  const steps = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed_won'];
  const curIdx = steps.indexOf(deal.stage);
  if (curIdx < steps.length - 1) {
    deal.stage = steps[curIdx + 1];
    deal.probability = (curIdx + 2) * 20;
    toast(`Đã luân chuyển Deal ${deal.name} sang bước ${deal.stage} thành công!`, 'success');
    renderPageContent(CUR_PAGE);
  } else {
    toast('Hợp đồng đã ở bước hoàn công thắng cao nhất (Closed WON)!', 'info');
  }
}

export function toggleUserStatus(usrId) {
  const usr = USERS_DB.find(u => u.id === usrId);
  if (usr) {
    usr.status = usr.status === 'active' ? 'lock' : 'active';
    toast(`Đã thay đổi trạng thái tác nghiệp của tài khoản ${usr.name}!`, 'success');
    renderPageContent('users');
  }
}

/* ==========================================================================
   10. SYSTEM UTILITY TOOLINGS
   ========================================================================== */

export function toast(message, type = 'success', duration = 3000) {
  const wrapper = document.getElementById('toast-wrapper');
  if (!wrapper) return;

  const t = document.createElement('div');
  t.className = `toast ${type}`;
  
  let icon = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-circle-xmark text-rose-500"></i>';
  else if (type === 'info') icon = '<i class="fa-solid fa-circle-info text-blue-500"></i>';
  else if (type === 'warn') icon = '<i class="fa-solid fa-circle-exclamation text-amber-500"></i>';

  t.innerHTML = `
    ${icon}
    <span style="font-size:12.5px; font-weight:700; color:var(--n800);">${esc(message)}</span>
  `;

  wrapper.appendChild(t);

  setTimeout(() => {
    t.style.transform = 'translateX(0)';
  }, 10);

  setTimeout(() => {
    t.style.transform = 'translateX(120%)';
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, duration);
}

function debounce(fn, ms) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Global quick floating switch event hookups
function setupFloatingRoleSwitcher() {
  document.querySelectorAll('.switcher-grid .sw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetRole = btn.getAttribute('data-role');
      const mockAccounts = {
        superadmin: USERS_DB[0],
        manager: USERS_DB[1],
        sales: USERS_DB[2],
        support: USERS_DB[3]
      };
      
      SESSION = mockAccounts[targetRole];
      toast(`Mô phỏng: Đóng vai tài lựu ${SESSION.name}`, 'info');
      
      const homeMap = {
        superadmin: 'dashboard-superadmin',
        manager: 'dashboard-manager',
        sales: 'dashboard-salesrep',
        support: 'dashboard-support'
      };
      go(homeMap[targetRole]);
    });
  });
}

function setupSuperAdminEvents() {
  document.getElementById('sa-export-sc-data')?.addEventListener('click', () => {
    toast('Đang nén kết xuất dữ liệu nợ và quan hệ...', 'info');
    setTimeout(() => {
      toast('Trích xuất thành công tập tin DB backup (Enterprise_CRM_Backup.json)!', 'success');
    }, 1400);
  });
}

function setupSalesRepEvents() {
  // Bind simple checklist events directly inside rep container area
  const checklist = document.getElementById('salesrep-task-checklist-inject');
  checklist?.querySelectorAll('.chk-input').forEach(box => {
    box.addEventListener('change', (e) => {
      const taskId = e.target.closest('.chk-item').getAttribute('data-task-id');
      toggleTaskCompletion(taskId);
    });
  });
}

/* ==========================================================================
   11. APPLICATION BOOTSTRUT BOOTER
   ========================================================================== */

function setupEventDelegation() {
  // Catch simple global actions
}

// Expose public methods to window so inline onclicks can evaluate safely
// (Perfect fit for requested Vanilla JS architectural layout models)
window.crmApp = {
  closeActiveModal,
  convertLeadToDeal,
  openLeadDetail: (id) => {
    const l = LEADS_DB.find(led => led.id === id);
    if (l) {
      toast(`Họ tên: ${l.name} - ĐT: ${l.phone}`, 'info');
    }
  },
  deleteLead,
  openDealDetailModal,
  moveDealNextStage,
  logDealActivity,
  updateDealStageDirectly,
  removeCalculatorRow,
  printQuotation,
  deleteQuote: (id) => {
    const idx = QUOTES_DB.findIndex(q => q.id === id);
    if (idx !== -1) {
      QUOTES_DB.splice(idx, 1);
      toast('Báo giá đã bị hủy bỏ!', 'warn');
      renderPageContent('quotes');
    }
  },
  openContactEdit: (id) => {
    const con = CONTACTS_DB.find(c => c.id === id);
    if (con) {
      toast(`Mở duyệt hồ sơ: ${con.fullName} thuộc doanh nghiệp ${con.companyName}`, 'info');
    }
  },
  deleteContact,
  openCompanyDetailModal: (id) => {
    const c = COMPANIES_DB.find(cmp => cmp.id === id);
    if (c) {
      toast(`Công ty B2B: ${c.name} - Ngành: ${c.industry} - SĐT: ${c.phone}`, 'info');
    }
  },
  deleteCompanyDirect: (id) => {
    const idx = COMPANIES_DB.findIndex(c => c.id === id);
    if (idx !== -1) {
      COMPANIES_DB.splice(idx, 1);
      toast('Doanh nghiệp đối tác đã gỡ khỏi hệ thống CRM B2B!', 'warn');
      renderPageContent('contacts');
    }
  },
  deleteActivityDirect: (id) => {
    const idx = ACTIVITIES_DB.findIndex(a => a.id === id);
    if (idx !== -1) {
      ACTIVITIES_DB.splice(idx, 1);
      toast('Đã gỡ bỏ nhật ký hoạt động này!', 'warn');
      renderPageContent('tasks');
    }
  },
  openProductDetailModal: (id) => {
    const p = PRODUCTS_DB.find(prd => prd.id === id);
    if (p) {
      toast(`Sản phẩm: ${p.name} - SKU: ${p.code} - Giá: ${p.price.toLocaleString('vi-VN')} ₫`, 'info');
    }
  },
  deleteProductDirect: (id) => {
    const idx = PRODUCTS_DB.findIndex(p => p.id === id);
    if (idx !== -1) {
      PRODUCTS_DB.splice(idx, 1);
      toast('Đã rút sản phẩm khỏi kệ chào bán!', 'warn');
      renderPageContent('products');
    }
  },
  recordInvoicePayment: (id) => {
    const inv = INVOICES_DB.find(i => i.id === id);
    if (inv) {
      inv.status = 'paid';
      inv.paidAt = '23/05/2026';
      toast(`Ghi nhận thanh toán thành công hóa đơn ${inv.number} số tiền ${inv.total.toLocaleString()} ₫!`, 'success');
      renderPageContent('invoices');
    }
  },
  printInvoice: (id) => {
    const inv = INVOICES_DB.find(i => i.id === id);
    if (inv) {
      const modalContent = `
        <div style="font-family: var(--fm); background-color: var(--n50); padding: 24px; border: 1px solid var(--bd); border-radius: var(--rs); line-height: 1.6;">
          <div style="display:flex; justify-content:space-between; border-bottom:2px solid var(--n800); padding-bottom:12px; margin-bottom:12px;">
            <div>
              <h1 style="font-family:var(--fd); font-size:20px; font-weight:800;">AURA CLOUD SOLUTIONS</h1>
              <p style="font-size:11px; color:var(--n500);">33 Phố Duy Tân, Cầu Giấy, Hà Nội</p>
            </div>
            <div style="text-align:right;">
              <h2 style="font-size:16px; font-weight:700; color:var(--b600);">HÓA ĐƠN ĐỎ (VAT INVOICE)</h2>
              <p style="font-weight:700;">SỐ: ${inv.number}</p>
              <p style="font-size:11px; color:var(--n500);">Báo giá tham khảo: ${inv.quoteId}</p>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <p><strong>Khách hàng đối tác:</strong> ${esc(inv.contactName)}</p>
            <p><strong>Hạn thanh toán:</strong> ${inv.dueDate}</p>
            <p><strong>Ngày thanh toán dòng tiền:</strong> ${inv.paidAt || 'Chờ thu nợ'}</p>
            <p><strong>Trình trạng:</strong> ${inv.status === 'paid' ? 'ĐÃ ĐÓNG KÝ 100%' : inv.status === 'partial' ? 'THANH TOÁN 1 PHẦN (CỌC 50%)' : 'CHƯA THANH TOÁN'}</p>
          </div>
          <table style="width:100%; border-collapse:collapse; margin-bottom:12px;">
            <thead>
              <tr style="border-bottom:1px solid var(--n300); text-align:left; font-weight:700;">
                <th style="padding:6px 0;">Mục hàng hóa / giải pháp</th>
                <th style="text-align:right; padding:6px 0;">Thành tiền (₫)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 0;">Hệ sinh thái dịch vụ/sản phẩm liên kết ${inv.quoteId}</td>
                <td style="text-align:right; padding:6px 0;">${inv.total.toLocaleString()} ₫</td>
              </tr>
              <tr style="border-top:1px solid var(--n800); font-weight:700;">
                <td style="padding:6px 0;">TỔNG THANH TOÁN (ĐÃ GỒM VAT 10%)</td>
                <td style="text-align:right; padding:6px 0; color:var(--green);">${inv.total.toLocaleString()} ₫</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size:11px; color:var(--n500); font-style:italic; border-top:1px dashed var(--bd); padding-top:8px;">Ghi chú: ${esc(inv.notes)}</p>
        </div>
      `;
      openModalElement(`HỒ SƠ HÓA ĐƠN - ${inv.number}`, modalContent, `<button class="btn pr" onclick="window.print()">In Hóa Đơn (PDF)</button><button class="btn bl" onclick="window.crmApp.closeActiveModal()">Đóng</button>`);
    }
  },
  deleteInvoice: (id) => {
    const idx = INVOICES_DB.findIndex(i => i.id === id);
    if (idx !== -1) {
      INVOICES_DB.splice(idx, 1);
      toast('Đã gỡ bỏ hóa đơn tài chính này ra khỏi sổ sách!', 'warn');
      renderPageContent('invoices');
    }
  },
  openTicketDetail,
  applyCannedResponseToBox,
  submitAgentResponseToTicket,
  markTicketResolved,
  toggleTaskCompletion,
  deleteTask,
  toggleUserStatus,
  switchTaskView,
};

function init() {
  initDB();
  
  // Starting page: login screen directly
  CUR_PAGE = 'login';
  renderEntryScreen();
  
  setupFloatingRoleSwitcher();
  setupEventDelegation();
}

// Run Application Init
init();
