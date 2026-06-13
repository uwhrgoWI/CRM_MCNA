// Enterprise CRM Pro - Core Application Orchestrator
'use strict';

import {
  USERS_DB, COMPANIES_DB, CONTACTS_DB, LEADS_DB, DEALS_DB, TASKS_DB,
  ACTIVITIES_DB, QUOTES_DB, PRODUCTS_DB, TICKETS_DB, INVOICES_DB, REVENUE_DATA, NOTIFICATIONS_DB, AUDIT_LOG_DB,
  CALL_LOGS_DB, EMAIL_OUTBOX_DB, initDB
} from './crm-database.js';

import { bootLoadFromCloud, isCloudEnabled, syncNow } from './crm-supabase.js';

import { svgBarChart, svgLineChart, svgDonut, svgFunnel, svgSparkline } from './crm-charts.js';

import {
  drawLoginScreen, drawRegisterScreen, drawForgotScreen,
  buildSidebar, buildTopbar,
  renderSuperAdminDashboard, renderManagerDashboard, renderSalesRepDashboard, renderSupportDashboard,
  drawLeadsPage, renderPipelineKanban, renderTasksPage, renderQuotationsPage, drawQuoteBuilderInner,
  renderCustomersPage, renderProductsPage, renderTicketsPage, drawTicketMessageThread, renderUsersPermissionsPage, renderSystemSettingsPage,
  renderReportsPage, renderInvoicesPage, renderSalesToolkitPage, renderMcnaFunnelPage, renderNotificationsPage, esc, fmtVND,
  maskPhone, maskEmail
} from './crm-templates.js';

// Collision-proof record id generator. Length-based ids (`led-${arr.length+1}`)
// overwrote existing rows once records were deleted or ids overlapped the seeds.
function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// === GLOBAL STATE ===
let SESSION = null;
let CUR_PAGE = 'login';
let ACTIVE_SIM_TAB = 't1';
let IS_SIDEBAR_COLLAPSED = false;
let ACTIVE_TAB_STATE = 'all';
let CUSTOMER_TAB_STATE = 'b2c'; // Add dynamic subtab for unified B2B/B2C
let DEALS_TAB_STATE = 'kanban'; // Add dynamic subtab for unified Kanban/Deals List
let TOOLKIT_TAB_STATE = 'planner'; // Add active subtab for Sales Toolkit
let FILTER_STATE = { search: '', source: 'all', priority: 'all', leadType: 'b2c' };
let SELECTED_TICKET_ID = null;
let REPORT_FILTER_STATE = { range: '12', repId: 'all', growthExpect: 15 };

// Sales Toolkit persistent states
let PLANNER_DB = [
  { id: 'p1', title: 'Gọi điện cho anh Triệu Techcombank đàm phán hợp đồng ERP', completed: false, isMIT: true, time: '09:00' },
  { id: 'p2', title: 'Demo thực chiến giải pháp Aura CRM Core cho đối tác Vingroup', completed: false, isMIT: true, time: '14:30' },
  { id: 'p3', title: 'Soạn email báo giá tùy biến gửi cho chị Hương Thế Giới Di Động', completed: true, isMIT: false, time: '10:15' },
  { id: 'p4', title: 'Rà soát hồ sơ chẩn đoán Pain Points của đại diện FPT Software', completed: false, isMIT: false, time: '16:00' }
];

let DIAGNOSIS_ANSWERS = Array(10).fill(null); // stores index of chosen options [0..3]
let ROI_INPUTS = {
  revenue: 5000000000,
  salesStaff: 5,
  wasteHours: 2.5,
  salary: 15000000,
  closeRate: 15,
  dealValue: 20000000,
  crmCost: 120000000
};

let PREMEETING_QUIZ_COMPLETED = {}; // { activityId: { score, answers } }

let EMAIL_TEMPLATES = [
  {
    id: 'e1',
    category: 'intro',
    dealType: 'b2b',
    name: 'Mẫu Giới thiệu Giải pháp Aura CRM (B2B)',
    subject: 'Đề xuất Số hóa Quy trình Bán hàng Doanh nghiệp - Aura CRM',
    body: `Kính gửi Anh/Chị {{KHÁCH_HÀNG}},\n\nTôi là {{TÊN_SALES}} từ Aura CRM Pro. Qua tìm hiểu, tôi được biết Doanh nghiệp {{TÊN_DOANH_NGHIỆP}} đang quan tâm đến việc tối ưu năng suất Sales và tự động hóa phễu khách hàng tiềm năng.\n\nAura CRM cung cấp hệ sinh thái tích hợp giúp:\n- Định vị điểm nghẽn bán hàng và CSKH doanh nghiệp B2B\n- Quản lý dòng tiền hóa đơn và đối chiếu nợ nần đại lý\n- Sơ đồ Kanban đàm phán thương vụ cực kỳ trực quan\n\nTôi xin gửi kèm tài liệu năng lực và đề xuất một cuộc hẹn Demo ngắn hướng tới hợp tác chiến lược giữa hai đơn vị.\n\nTrân trọng,\n{{TÊN_SALES}}`
  },
  {
    id: 'e2',
    category: 'quote',
    dealType: 'b2b',
    name: 'Gửi Báo Giá Chi Tiết & Khóa Điều Khoản (B2B)',
    subject: 'Báo Giá Giải pháp Aura CRM Pro - Thương vụ doanh nghiệp: {{TÊN_DEAL}}',
    body: `Chào Anh/Chị {{KHÁCH_HÀNG}},\n\nTôi gửi tới {{TÊN_DOANH_NGHIỆP}} chi tiết dự thảo báo giá thương mại cho đại dự án của đơn vị "{{TÊN_DEAL}}".\n\n- Tổng giá trị cam kết doanh nghiệp: {{GIÁ_TRỊ_DEAL}}\n- Khung thời gian triển khai: 15-30 ngày làm việc\n- Bao gồm: Đầy đủ module B2B Leads, Pipeline quản lý, Báo cáo & Phân Tích Thực tế\n- Mức độ phản hồi CSKH: Cam kết SLA dưới 4 tiếng đồng hồ cho đối tác VIP\n\nKính mong quý anh chị Ban giám đốc xem xét phê duyệt đàm phán chốt hợp đồng trước ngày {{HẠN_CHỐT}}.\n\nTrân trọng,\n{{TÊN_SALES}}`
  },
  {
    id: 'e3',
    category: 'invoice',
    dealType: 'b2b',
    name: 'Hối Thúc Thanh Toán & Đối Chiếu Dư Nợ (B2B)',
    subject: 'Yêu cầu quyết toán Hóa đơn đỏ VAT - {{TÊN_DOANH_NGHIỆP}} - MÃ SỐ: {{SỐ_HÓA_ĐƠN}}',
    body: `Kính gửi Quý Đối tác {{KHÁCH_HÀNG}} tại {{TÊN_DOANH_NGHIỆP}},\n\nPhòng kế toán Aura CRM xin trân trọng thông báo chúng tôi đã phát hành hóa đơn tài chính số {{SỐ_HÓA_ĐƠN}} cho hạng mục {{TÊN_DEAL}}.\n\n- Giá trị thanh toán: {{GIÁ_TRỊ_DEAL}}\n- Hạn chót hoạch toán kế toán: {{HẠN_THANH_TOÁN}}\n- Trạng thái: Công nợ nợ nần đang lưu chuyển chờ thanh toán thanh khoản\n\nKính mong Anh/Chị chuyển thông tin này tới phòng tài vụ/kế toán trưởng xử lý sớm để không gián đoạn dịch vụ hệ thống.\n\nTrân trọng,\n{{TÊN_SALES}}`
  },
  {
    id: 'e4',
    category: 'care',
    dealType: 'b2b',
    name: 'Khảo Sát Đánh Giá CSAT Sau Bán (B2B)',
    subject: 'Ý kiến phản hồi & Đánh giá chất lượng tích hợp Aura CRM - {{TÊN_DOANH_NGHIỆP}}',
    body: `Kính gửi Anh/Chị {{KHÁCH_HÀNG}},\n\nTôi là {{TÊN_SALES}} từ phòng Customer Success. Chúc mừng Doanh nghiệp {{TÊN_DOANH_NGHIỆP}} đã chuyển đổi số quy trình kinh doanh thành công.\n\nBên cạnh báo cáo tổng hợp, nếu quý anh/chị có gặp bất cứ phiếu sự cố hay Ticket phát sinh nào phức tạp từ người sử dụng dịch vụ, xin đừng ngần ngại báo ngay để chúng tôi trực chỉ xử lý trong 4 giờ.\n\nKính mong Anh/Chị bớt chút thời gian cho điểm đánh giá CSAT về chất lượng sau vận hành.\n\nThân ái,\n{{TÊN_SALES}}`
  },
  {
    id: 'e5',
    category: 'intro',
    dealType: 'b2c',
    name: 'Chào Mừng Khách Hàng Tiêu Dùng Cá Nhân (B2C)',
    subject: 'Chào mừng Anh/Chị {{KHÁCH_HÀNG}} - Bí quyết cá nhân hóa nâng cao hiệu suất làm việc',
    body: `Kính gửi Anh/Chị {{KHÁCH_HÀNG}},\n\nTôi là {{TÊN_SALES}}, tư vấn viên độc lập từ Aura CRM.\n\nĐược biết Anh/Chị đang quan tâm đến giải pháp quản trị hoạt động cá nhân cũng như tối ưu hóa năng suất làm việc hàng ngày. Aura phiên bản Personal được thiết kế tinh gọn để giúp Anh/Chị:\n- Quản lý danh sách Daily Planner trực quan, tự lên độ ưu tiên rõ rệt\n- Nhận chỉ số cảnh báo nợ nần cá nhân\n- Theo dõi lịch trình nhắc việc tự động\n\nTôi rất vinh hạnh được hỗ trợ tư vấn trực tiếp 1-1 qua điện thoại để mở khóa trải nghiệm miễn phí cho Anh/Chị.\n\nChúc Anh/Chị ngày làm việc tràn đầy năng lượng!\n\nTrân trọng,\n{{TÊN_SALES}}`
  },
  {
    id: 'e6',
    category: 'care',
    dealType: 'b2c',
    name: 'Khảo Sát Hỗ Trợ Độc Lập Khách Lẻ (B2C)',
    subject: 'Cảm nhận sử dụng & Lời cảm ơn dành cho anh/chị {{KHÁCH_HÀNG}}',
    body: `Chào Anh/Chị {{KHÁCH_HÀNG}},\n\nTôi là {{TÊN_SALES}} từ Bộ phận Chăm sóc Khách hàng Độc lập Aura CRM.\n\nHôm nay, tôi viết thư này nhằm hỏi thăm trải nghiệm trực tiếp của Anh/Chị sau thời gian ngắn làm quen với hệ thống. Sự hài lòng của khách hàng lẻ mua sắm độc lập luôn là ưu tiên số một của chúng tôi.\n\nNếu có bất kỳ thắc mắc nào liên quan đến giao diện hay cách thiết lập mục tiêu cá nhân, xin vui lòng phản hồi email này để nhận hỗ trợ giải quyết ngay lập tức.\n\nNhân dịp này, chúng tôi gửi tặng Anh/Chị cẩm nang tối ưu quản trị thời gian trong file đính kèm.\n\nCảm ơn Anh/Chị đã lựa chọn đồng hành cùng Aura!\n\nTrân trọng,\n{{TÊN_SALES}}`
  }
];

const PERMISSIONS = {
  superadmin: ['dashboard-superadmin', 'reports', 'leads', 'deals', 'pipeline', 'contacts', 'companies', 'products', 'quotes', 'invoices', 'tasks', 'activities', 'tickets', 'users', 'settings', 'profile', 'notifications', 'sales-toolkit', 'mcna-funnel', 'kpi-calls'],
  // Marketers create leads but must not see quotes or the invoice ledger
  manager: ['dashboard-manager', 'reports', 'leads', 'deals', 'pipeline', 'contacts', 'companies', 'tasks', 'activities', 'tickets', 'profile', 'notifications', 'sales-toolkit', 'mcna-funnel', 'kpi-calls'],
  sales: ['dashboard-salesrep', 'leads', 'deals', 'pipeline', 'contacts', 'tasks', 'activities', 'quotes', 'products', 'invoices', 'tickets', 'profile', 'notifications', 'sales-toolkit', 'mcna-funnel', 'kpi-calls'],
  // Support is restricted to the SLA ticket desk only
  support: ['dashboard-support', 'tickets', 'profile', 'notifications']
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
  'notifications': 'Hộp Thư Thông Báo Mới',
  'sales-toolkit': 'Hộp Công Cụ Bổ Trợ Sales & Marketing (Sales Playbook Hub)',
  'mcna-funnel': 'Hệ Thống Phễu Kinh Doanh 5 Tầng MCNA',
  'kpi-calls': 'KPI Cuộc Gọi & Kiểm Soát Tác Nghiệp Sales'
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
    if (FILTER_STATE.leadType && FILTER_STATE.leadType !== 'all') {
      data = data.filter(l => l.leadType === FILTER_STATE.leadType);
    }
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
  else if (pageId === 'kpi-calls') {
    mount.innerHTML = renderKpiCallsPage();
  }
  else if (pageId === 'quotes') {
    mount.innerHTML = renderQuotationsPage(QUOTES_DB);
    setupQuotationsEventHandlers();
  } 
  else if (pageId === 'invoices') {
    mount.innerHTML = renderInvoicesPage(INVOICES_DB, SESSION?.role);
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
  else if (pageId === 'sales-toolkit') {
    mount.innerHTML = renderSalesToolkitPage(PLANNER_DB, DIAGNOSIS_ANSWERS, ROI_INPUTS, EMAIL_TEMPLATES, DEALS_DB);
    setupSalesToolkitEventHandlers();
  }
  else if (pageId === 'mcna-funnel') {
    mount.innerHTML = renderMcnaFunnelPage(ACTIVE_SIM_TAB);
    setupMcnaFunnelEvents();
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
  else if (pageId === 'notifications') {
    mount.innerHTML = renderNotificationsPage(NOTIFICATIONS_DB, SESSION.id);
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
          <label>Mô hình Tiếp Cận *</label>
          <select id="m-lead-type" onchange="window.crmApp.onNewLeadTypeChange(this.value)">
            <option value="b2c" selected>👤 B2C - Khách Cá Nhân</option>
            <option value="b2b">🏢 B2B - Khách Doanh Nghiệp</option>
          </select>
        </div>
        <div class="fg">
          <label>Tên đại diện liên hệ *</label>
          <input type="text" id="m-lead-name" required placeholder="Nguyễn Văn An" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Đơn vị / Doanh nghiệp *</label>
          <input type="text" id="m-lead-company" required placeholder="Khách hàng cá nhân" value="Khách hàng cá nhân" disabled style="background: #f1f5f9;" />
        </div>
        <div class="fg">
          <label>Điện thoại liên hệ *</label>
          <input type="tel" id="m-lead-phone" required placeholder="0911222333" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Địa chỉ Email</label>
          <input type="email" id="m-lead-email" placeholder="contact@company.vn" />
        </div>
        <div class="fg">
          <label>Nguồn tiếp cận tuyển sinh</label>
          <select id="m-lead-source">
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Search Form">Google Search Form</option>
            <option value="Referral Partner">Referral Partner</option>
            <option value="Cold Calling Campaign">Cuộc gọi lạnh</option>
          </select>
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Độ nóng khẩn cấp (Priority)</label>
          <select id="m-lead-priority">
            <option value="hot">🔥 HOT (Chốt ngay)</option>
            <option value="warm">⚡ WARM (Cần bàn bạc)</option>
            <option value="cold">❄️ COLD (Tương lai)</option>
          </select>
        </div>
        <div class="fg">
          <label>Giá trị gói giải pháp dự kiến (VND)</label>
          <input type="number" id="m-lead-val" value="50000000" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Nhân viên Sales phụ trách *</label>
          <select id="m-lead-owner">
            ${USERS_DB.filter(u => ['sales', 'manager', 'superadmin'].includes(u.role)).map(u => `
              <option value="${u.id}" ${u.id === SESSION.id ? 'selected' : ''}>${esc(u.name)} (${esc(u.role.toUpperCase())})</option>
            `).join('')}
          </select>
        </div>
        <div class="fg">
          <label>Ghi chú ban đầu (Notes)</label>
          <input type="text" id="m-lead-notes" placeholder="Ghi chú về nhu cầu, tiến độ tiếp cận..." />
        </div>
      </div>
    </div>
  `;

  const footerBtns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-save-lead-btn-action">Lưu trữ Lead mới</button>
  `;

  openModalElement('THÊM MỚI SƠ ĐỒ LEAD TIẾP CẬN', formHtml, footerBtns);

  document.getElementById('m-save-lead-btn-action')?.addEventListener('click', () => {
    const type = document.getElementById('m-lead-type').value;
    const name = document.getElementById('m-lead-name').value;
    const comp = document.getElementById('m-lead-company').value;
    const phone = document.getElementById('m-lead-phone').value;
    const val = Number(document.getElementById('m-lead-val').value) || 0;
    const ownerId = document.getElementById('m-lead-owner').value;
    const notesInput = document.getElementById('m-lead-notes').value.trim();
    const email = document.getElementById('m-lead-email').value || 'email@custom.vn';

    if (!name || !comp || !phone) {
      toast('🔴 CHẶN ĐỨNG: Hãy điền đầy đủ các trường thông tin bắt buộc!', 'error');
      return;
    }

    // A. STRICT FULL NAME VALIDATION
    const nameWords = name.trim().split(/\s+/).filter(w => w.length > 0);
    if (nameWords.length < 2) {
      toast('🔴 CHẶN ĐỨNG: Yêu cầu bắt buộc điền đầy đủ cả HỌ VÀ TÊN (Ví dụ: Nguyễn Sơn, Nguyễn Ngọc Sơn), không được nhập tên rút gọn vắn tắt!', 'error');
      return;
    }

    // B. STRICT SYSTEM-WIDE DE-DUPLICATION (PHONE AND EMAIL)
    const targetPhoneClean = phone.replace(/[\s\-\.]/g, '');
    const dupPhoneLead = LEADS_DB.find(l => l.phone.replace(/[\s\-\.]/g, '') === targetPhoneClean);
    const dupPhoneContact = CONTACTS_DB.find(c => c.phone.replace(/[\s\-\.]/g, '') === targetPhoneClean);

    const dupEmailLead = LEADS_DB.find(l => l.email && l.email.toLowerCase() === email.toLowerCase());
    const dupEmailContact = CONTACTS_DB.find(c => c.email && c.email.toLowerCase() === email.toLowerCase());

    if (dupPhoneLead || dupPhoneContact) {
      const matchedName = dupPhoneLead ? dupPhoneLead.name : dupPhoneContact.fullName;
      toast(`🔴 CHẶN TRÙNG LẶP HỆ THỐNG: Số điện thoại (${phone}) đã được đăng ký bởi "${matchedName}" trước đó! Hệ thống kiểm soát Aura-Control chặn trùng lặp!`, 'error');
      return;
    }

    if (dupEmailLead || dupEmailContact) {
      const matchedName = dupEmailLead ? dupEmailLead.name : dupEmailContact.fullName;
      toast(`🔴 CHẶN TRÙNG LẶP HỆ THỐNG: Địa chỉ Email (${email}) đã được sử dụng bởi "${matchedName}" trước đó!`, 'error');
      return;
    }

    const assignedRepId = ownerId || SESSION.id;

    const newLeadObj = {
      id: uid('led'),
      leadType: type,
      name,
      company: comp,
      phone,
      email,
      source: document.getElementById('m-lead-source').value,
      status: 'new',
      value: val,
      ownerId: assignedRepId,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      deadline: '30/05/2026',
      priority: document.getElementById('m-lead-priority').value,
      notes: notesInput || (type === 'b2c' ? 'Khởi tạo thủ công nhanh B2C' : 'Khởi tạo thủ công nhanh B2B')
    };

    LEADS_DB.unshift(newLeadObj);

    // Pipeline T1->T2 (BA doc): a new lead must also be recorded in the
    // B2B/B2C customer database, and the assigned rep gets a real email.
    ensureCustomerFromLead(newLeadObj);
    dispatchAssignmentEmail(newLeadObj);

    // TRIGGER IMMEDIATE NOTIFICATION TO THE DELEGATED SALESPERSON
    if (assignedRepId) {
      NOTIFICATIONS_DB.unshift({
        id: `notif-sales-${Date.now()}`,
        userId: assignedRepId,
        unread: true,
        title: '⚡ [Chỉ Định Thủ Công] BẠN ĐƯỢC GIAO LEAD MỚI!',
        content: `Marketer/Trưởng bộ phận vừa tạo & gán Lead mới "${name}" (SĐT: ${phone}) trực tiếp cho bạn chăm sóc. Vui lòng tác nghiệp ngay!`,
        time: 'Vừa xong',
        user: SESSION.name || 'Hệ thống tự động'
      });
    }

    closeActiveModal();

    if (val > 0) {
      // Trigger the majestic semi-agentic automatic flow!
      triggerAuraAgentPipeline(newLeadObj);
    } else {
      toast('Đã khởi tạo sơ đồ quản lý Lead mới & Gửi thông báo nhiệm vụ cho Sales!', 'success');
      if (CUR_PAGE === 'leads') {
        renderPageContent('leads');
      }
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
      id: uid('dea'),
      name: title,
      contactId: selectedContact.id,
      contactName: selectedContact.fullName,
      companyId: selectedContact.companyId,
      companyName: selectedContact.companyName,
      value,
      stage: 'prospecting',
      probability: 20,
      ownerId: SESSION.id,
      expectedClose: '30/06/2026',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastActivity: new Date().toLocaleDateString('vi-VN')
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

        <div class="panel" style="font-size:12px; background: #fffbeb; border: 1px solid #fef3c7;">
          <h4 style="font-size:11px; font-weight:800; color:#b45309; text-transform:uppercase; margin-bottom:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Bước kế tiếp tài chính</h4>
          <p style="color:#78350f; font-size:11px; margin-bottom:10px; line-height:1.35;">Convert sự thuyết phục thành Bản Đề Xuất Giải Pháp kỹ thuật và Biểu Giá phí dịch vụ chính thức.</p>
          <button class="btn pr" style="width:100%; font-weight:700; padding:8px; display:inline-flex; align-items:center; justify-content:center; gap:6px;" onclick="window.crmApp.closeActiveModal(); window.crmApp.go('quotes')">
            <i class="fa-solid fa-file-invoice-dollar"></i> Soạn Đơn Báo Giá (Q3)
          </button>
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

  // PREVENT DUPLICATE CALLING TO UNFORTUNATELY HARASS CLIENTS
  if (type === 'call') {
    const hasCall = ACTIVITIES_DB.some(act => act.dealId === dealId && act.type === 'call');
    if (hasCall) {
      toast('❌ BẢO VỆ CHỐNG GỌI CHỒNG LẤN: Khách hàng của Deal này đã nhận cuộc gọi liên lạc trước đó! Hệ thống chặn cuộc gọi trùng để tối ưu kiểm soát chiến dịch 100 cuộc gọi.', 'error');
      writeAuditLog('Phòng chống gọi trùng lặp (Duplicate-Call Protection)', `Deal ID: ${dealId}`, 'bi_chan');
      return;
    }
  }

  const newActObj = {
    id: uid('act'),
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
    // TC-011: Workflow enforcement - to transition to proposal, negotiation or closed_won, must have logged a call
    if (newSt === 'proposal' || newSt === 'negotiation' || newSt === 'closed_won') {
      const hasCall = ACTIVITIES_DB.some(act => act.dealId === dealId && act.type === 'call');
      if (!hasCall) {
        toast('🔒 Chặn đứng bởi Layer 5: Bạn phải tác nghiệp gọi điện trực tiếp [Tạo Log Cuộc Gọi] cho khách hàng trước khi đệ trình báo giáo, đề xuất hoặc chốt hợp đồng!', 'error');
        writeAuditLog('Kiểm duyệt T5 (Ngăn chặn): Chặn dịch chuyển Deal do thiếu Log gọi điện thoại', `Deal: ${deal.name}`, 'bi_chan');
        return;
      }
    }

    const prevSt = deal.stage;
    deal.stage = newSt;
    
    // TC-018: Detect rapidly succeeding deal closures
    if (newSt === 'closed_won') {
      trackAndReportVelocityAnomaly();
    }

    writeAuditLog(`Cập nhật trạng thái Deal [${prevSt} → ${newSt}]`, `Deal: ${deal.name}`);
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
      id: uid('qte'),
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
      downloadMultiSheetExcel();
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
      id: uid('tk'),
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
      id: uid('cmp'),
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
          <label>Họ Khách hàng B2C *</label>
          <input type="text" id="m-con-ln" required placeholder="Phạm" />
        </div>
        <div class="fg">
          <label>Tên Khách hàng B2C *</label>
          <input type="text" id="m-con-fn" required placeholder="Chinh" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Số điện thoại *</label>
          <input type="tel" id="m-con-phone" required placeholder="0901234567" />
        </div>
        <div class="fg">
          <label>Địa chỉ Email *</label>
          <input type="email" id="m-con-email" required placeholder="chinh.pham@gmail.com" />
        </div>
      </div>
      <div class="fr2">
        <div class="fg">
          <label>Kênh nguồn tiếp cận</label>
          <select id="m-con-source">
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="Google Search Form">Google Form tuyển sinh</option>
            <option value="Referral Partner">Đối tác giới thiệu lẻ</option>
            <option value="Direct Web">Đăng ký tự do Web</option>
          </select>
        </div>
        <div class="fg">
          <label>Phân loại khách lẻ</label>
          <select id="m-con-tags">
            <option value="Khách lẻ">👤 Khách lẻ tiêu dùng</option>
            <option value="VIP">💎 Khách hàng VIP</option>
            <option value="Thân thiết">⭐ Khách hàng Thân thiết</option>
          </select>
        </div>
      </div>
      <div class="fg">
        <label>Ghi chú tiêu dùng / Nhu cầu mua lẻ</label>
        <textarea id="m-con-notes" rows="2" placeholder="Ghi nhận mối lưu tâm đặc biệt, mặt hàng quan tâm..."></textarea>
      </div>
    </div>
  `;

  const btns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="m-con-save-bttn-fire">Tạo khách lẻ (B2C)</button>
  `;

  openModalElement('THÊM MỚI KHÁCH HÀNG CÁ NHÂN (B2C) ĐỘC LẬP', content, btns);

  document.getElementById('m-con-save-bttn-fire')?.addEventListener('click', () => {
    const fn = document.getElementById('m-con-fn').value;
    const ln = document.getElementById('m-con-ln').value;
    const phone = document.getElementById('m-con-phone').value;
    const email = document.getElementById('m-con-email').value;
    const source = document.getElementById('m-con-source').value;
    const tags = document.getElementById('m-con-tags').value;
    const notes = document.getElementById('m-con-notes').value || 'Khách lẻ tự do mua sắm';

    if (!fn || !ln || !phone || !email) {
      toast('Vui lòng cung cấp toàn bộ thông tin bắt buộc!', 'error');
      return;
    }

    const nObj = {
      id: uid('con'),
      firstName: fn,
      lastName: ln,
      fullName: `${ln} ${fn}`,
      title: "Khách lẻ tiêu dùng",
      companyId: null,
      companyName: "",
      phone,
      email,
      source,
      ownerId: SESSION.id,
      tags,
      dealsCount: 0,
      lastActivity: '23/05/2026',
      notes
    };

    CONTACTS_DB.unshift(nObj);
    toast('Đã thêm thành công hồ sơ Khách hàng B2C cá nhân!', 'success');
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

  document.getElementById('deals-tab-unified-btn')?.addEventListener('click', () => {
    DEALS_TAB_STATE = 'unified';
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
        <label>Chọn liên kết Khách Hàng (Bảo hộ chống gọi trùng) *</label>
        <select id="m-act-contact-select" required>
          ${CONTACTS_DB.map(c => `<option value="${c.id}">${esc(c.fullName)} (Điện thoại: ${esc(c.phone)})</option>`).join('')}
        </select>
      </div>
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
    const contactId = document.getElementById('m-act-contact-select').value;
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

    const selectedContact = CONTACTS_DB.find(c => c.id === contactId);

    // STRICT CHECK TO PREVENT SALES REPS CALLING MULTIPLE TIMES TO THE SAME CLIENT
    if (type === 'call') {
      const hasDuplicateCall = ACTIVITIES_DB.some(act => act.contactId === contactId && act.type === 'call');
      if (hasDuplicateCall) {
        toast(`❌ BẢO VỆ GỌI TRÙNG: Khách hàng "${selectedContact.fullName}" (${selectedContact.phone}) đã được gọi điện ghi nhận trước đó! Hệ thống khóa cuộc gọi lặp bảo vệ quyền riêng tư!`, 'error');
        writeAuditLog('Khóa cuộc gọi trùng lặp (Strict Contact Call Lock)', `Contact: ${selectedContact.fullName}`, 'bi_chan');
        return;
      }
    }

    const nAct = {
      id: uid('act'),
      title,
      type,
      contactId,
      datetime,
      duration,
      direction,
      outcome,
      notes
    };

    ACTIVITIES_DB.unshift(nAct);
    toast('Đã lưu dữ liệu tác nghiệp mới và rà soát chống gọi trùng lặp thành công!', 'success');
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
      id: uid('inv'),
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
      id: uid('prd'),
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
      id: uid('tsk'),
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
      id: uid('dea'),
      name: `Hợp đồng cung cấp cho ${lead.company}`,
      contactId: 'con-1',
      contactName: lead.name,
      companyId: 'cmp-1',
      companyName: lead.company,
      value: lead.value,
      stage: 'prospecting',
      probability: 20,
      ownerId: SESSION.id,
      expectedClose: '30/06/2026',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastActivity: new Date().toLocaleDateString('vi-VN')
    };

    DEALS_DB.unshift(newDeal);
    const idx = LEADS_DB.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      LEADS_DB[idx].status = 'qualified';
      LEADS_DB[idx].notes = (LEADS_DB[idx].notes || '') + ` [Có Deal: ${newDeal.name}]`;
    }

    toast('Đã chuyển đối Lead thành công thành cơ hội đàm phán thương thuyết!', 'success');
    if (CUR_PAGE === 'dashboard-manager' || CUR_PAGE === 'dashboard-salesrep') {
      renderPageContent(CUR_PAGE);
    } else {
      go('pipeline');
    }
  }
}

export function moveDealNextStage(dealId) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  if (!deal) return;

  const steps = ['prospecting', 'qualified', 'proposal', 'negotiation', 'closed_won'];
  const curIdx = steps.indexOf(deal.stage);
  if (curIdx < steps.length - 1) {
    const nextSt = steps[curIdx + 1];

    // TC-011: Workflow enforcement - to transition to proposal, negotiation or closed_won, must have logged a call
    if (nextSt === 'proposal' || nextSt === 'negotiation' || nextSt === 'closed_won') {
      const hasCall = ACTIVITIES_DB.some(act => act.dealId === dealId && act.type === 'call');
      if (!hasCall) {
        toast('🔒 Chặn đứng bởi Layer 5: Bạn phải tác nghiệp gọi điện trực tiếp [Tạo Log Cuộc Gọi] cho khách hàng trước khi đệ trình báo giáo, đề xuất hoặc chốt hợp đồng!', 'error');
        writeAuditLog('Kiểm duyệt T5 (Ngăn chặn): Chặn dịch chuyển Deal do thiếu Log gọi điện thoại', `Deal: ${deal.name}`, 'bi_chan');
        return;
      }
    }

    const prevSt = deal.stage;
    deal.stage = nextSt;
    deal.probability = (curIdx + 2) * 20;

    // TC-018: If closed won, run velocity controls
    if (nextSt === 'closed_won') {
      trackAndReportVelocityAnomaly();
    }

    writeAuditLog(`Cập nhật trạng thái Deal [${prevSt} → ${nextSt}]`, `Deal: ${deal.name}`);
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
    if (!l) return;

    const isB2C = l.leadType === 'b2c';
    const canReveal = !!SESSION && (SESSION.role === 'superadmin' || SESSION.role === 'manager' || SESSION.id === l.ownerId);

    let contactFieldsHtml = '';
    if (isB2C) {
      contactFieldsHtml = `
        <div class="panel" style="background:#f5f3ff; border:1.5px dashed #8b5cf6; padding:12px; border-radius:8px; margin-bottom:12px;">
          <h4 style="font-size:12px; color:#6d28d9; margin:0 0 6px 0;"><i class="fa-solid fa-shield-halved"></i> CHẾ ĐỘ BẢO MẬT THÔNG TIN KHÁCH HÀNG B2C</h4>
          <p style="font-size:11px; color:#5b21b6; margin:0 0 10px 0; line-height:1.4;">SĐT & Email được che mặc định theo chính sách bảo mật. Chỉ <strong>Sales phụ trách</strong> hoặc <strong>Quản lý/Admin</strong> được giải mã; mọi lượt giải mã đều ghi vào Audit Log.</p>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <div class="fg" style="margin:0;">
              <label style="color:#6d28d9; font-weight:700;">Số điện thoại (đã che bảo mật)</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="sec-lead-phone" class="tmono" readonly style="flex:1; background:#fff; font-weight:700; color:#4338ca; border:1px solid #c7d2fe; padding:8px; border-radius:6px;" value="${maskPhone(l.phone)}" />
                <button class="btn bl xs" style="height:36px; padding:0 12px;" ${canReveal ? `onclick="window.crmApp.revealSecuredField('lead','${l.id}','phone')"` : 'disabled title="Chỉ Sales phụ trách hoặc Quản lý được giải mã"'}><i class="fa-solid fa-eye"></i> Giải mã</button>
              </div>
            </div>
            <div class="fg" style="margin:0;">
              <label style="color:#6d28d9; font-weight:700;">Địa chỉ Email (đã che bảo mật)</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="sec-lead-email" class="tmono" readonly style="flex:1; background:#fff; font-weight:700; color:#4338ca; border:1px solid #c7d2fe; padding:8px; border-radius:6px;" value="${esc(maskEmail(l.email))}" />
                <button class="btn bl xs" style="height:36px; padding:0 12px;" ${canReveal ? `onclick="window.crmApp.revealSecuredField('lead','${l.id}','email')"` : 'disabled title="Chỉ Sales phụ trách hoặc Quản lý được giải mã"'}><i class="fa-solid fa-eye"></i> Giải mã</button>
              </div>
            </div>
            ${canReveal ? '' : `
            <div style="background:var(--n100); color:var(--n500); padding:8px 12px; border-radius:6px; font-size:11px;">
              <i class="fa-solid fa-lock text-rose-500"></i> Bạn không phụ trách lead này nên không thể giải mã thông tin liên lạc của khách.
            </div>`}
          </div>
        </div>
      `;
    } else {
      contactFieldsHtml = `
        <div class="fr2" style="margin-bottom:12px;">
          <div class="fg" style="margin:0;">
            <label>Số điện thoại doanh nghiệp *</label>
            <input type="text" id="m-edit-phone" value="${l.phone || ''}" />
          </div>
          <div class="fg" style="margin:0;">
            <label>Địa chỉ Email doanh nghiệp *</label>
            <input type="email" id="m-edit-email" value="${l.email || ''}" />
          </div>
        </div>
      `;
    }

    const modalBody = `
      <div class="auth-body">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:var(--n50); padding:8px 12px; border-radius:6px;">
          <div style="font-size:20px;">${isB2C ? '👤' : '🏢'}</div>
          <div>
            <div style="font-size:10px; font-weight:700; color:var(--n500); text-transform:uppercase; letter-spacing:0.5px;">Phân loại: ${isB2C ? 'B2C Cá Nhân' : 'B2B Doanh Nghiệp'}</div>
            <strong style="font-size:14px; color:var(--n900);">${esc(l.name)}</strong>
          </div>
        </div>

        ${contactFieldsHtml}

        <div class="fr2">
          <div class="fg">
            <label>Nguồn tiếp cận</label>
            <select id="m-edit-source">
              <option value="Facebook Ads" ${l.source==='Facebook Ads'?'selected':''}>Facebook Ads</option>
              <option value="Google Search Form" ${l.source==='Google Search Form'?'selected':''}>Google Form</option>
              <option value="Referral Partner" ${l.source==='Referral Partner'?'selected':''}>Đối tác Referral</option>
              <option value="Cold Calling Campaign" ${l.source==='Cold Calling Campaign'?'selected':''}>Điện thoại lạnh</option>
            </select>
          </div>
          <div class="fg">
            <label>Thứ tự ưu tiên</label>
            <select id="m-edit-priority">
              <option value="hot" ${l.priority==='hot'?'selected':''}>🔥 HOT (Chốt ngay)</option>
              <option value="warm" ${l.priority==='warm'?'selected':''}>⚡ WARM (Cần bàn bạc)</option>
              <option value="cold" ${l.priority==='cold'?'selected':''}>❄️ COLD (Tương lai)</option>
            </select>
          </div>
        </div>

        <div class="fr2">
          <div class="fg">
            <label>Giá trị dự kiến (₫ VND)</label>
            <input type="number" id="m-edit-value" value="${l.value || 0}" />
          </div>
          <div class="fg">
            <label>Trạng thái xử lý phễu</label>
            <select id="m-edit-status">
              <option value="new" ${l.status==='new'?'selected':''}>Mới nhận (New)</option>
              <option value="contacting" ${l.status==='contacting'?'selected':''}>Đang xử lý (Contacting)</option>
              <option value="qualified" ${l.status==='qualified'?'selected':''}>Đủ điều kiện (Qualified)</option>
              <option value="proposal" ${l.status==='proposal'?'selected':''}>Gửi báo giá (Proposal)</option>
              <option value="lost" ${l.status==='lost'?'selected':''}>Thất bại (Lost)</option>
            </select>
          </div>
        </div>

        <div class="fg">
          <label>Nhân viên Sales phụ trách *</label>
          <select id="m-edit-owner">
            ${USERS_DB.filter(u => ['sales', 'manager', 'superadmin'].includes(u.role)).map(u => `
              <option value="${u.id}" ${u.id === l.ownerId ? 'selected' : ''}>${esc(u.name)} (${esc(u.role.toUpperCase())})</option>
            `).join('')}
          </select>
        </div>

        <div class="fg">
          <label>Nhật ký ghi chú chăm sóc</label>
          <textarea id="m-edit-notes" rows="2" placeholder="Ghi nhận trạng thái tiếp cận hoặc phản hồi hiện thực...">${esc(l.notes || '')}</textarea>
        </div>

        <!-- Connected Deals Segment -->
        ${(() => {
          const connectedDeals = DEALS_DB.filter(d => 
            (d.contactName && d.contactName.toLowerCase() === l.name.toLowerCase()) || 
            (d.companyName && d.companyName.toLowerCase() === l.company.toLowerCase()) ||
            d.id === l.dealId || l.notes?.includes(d.id) || d.name?.includes(l.name)
          );

          if (connectedDeals.length > 0) {
            return `
              <div class="panel" style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:8px; margin-top:12px;">
                <h4 style="font-size:11px; font-weight:800; color:#166534; margin:0 0 6px 0; text-transform:uppercase; letter-spacing:0.5px;">
                  <i class="fa-solid fa-briefcase"></i> Các Cơ Hội Deal Liên Quan (${connectedDeals.length})
                </h4>
                <div style="display:flex; flex-direction:column; gap:6.5px;">
                  ${connectedDeals.map(d => {
                    const stageLabels = {
                      'prospecting': 'Tiếp cận tiếp thị',
                      'qualification': 'Xác định nhu cầu',
                      'proposal': 'Có báo đề xuất',
                      'negotiation': 'Đàm phán tối mật kỹ thương',
                      'closed_won': '🎉 Closed Won (Đã chốt ký)',
                      'closed_lost': '❌ Closed Lost (Thất bại)',
                      'nurtured': '🌱 Tái nuôi dưỡng (Nurture)'
                    };
                    return `
                      <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e2e8f0; padding:6px 10px; border-radius:6px; font-size:11px;">
                        <div>
                          <strong style="color:var(--n850);">${esc(d.name)}</strong>
                          <div style="color:var(--n500); font-size:10px; margin-top:2px;">
                            Trị giá: <strong class="text-emerald-600">${fmtVND(d.value)}</strong> &middot; Giai đoạn: <b>${stageLabels[d.stage] || d.stage}</b>
                          </div>
                        </div>
                        <button class="btn bl xs" onclick="window.crmApp.closeActiveModal(); window.crmApp.go('pipeline');" style="padding:3px 8px; font-size:10px;"><i class="fa-solid fa-link"></i> Xem Deal</button>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          } else {
            return `
              <div class="panel" style="background:#fafafa; border:1px solid #e2e8f0; padding:10px; border-radius:8px; margin-top:12px; text-align:center; color:var(--n500); font-size:11px;">
                <i class="fa-solid fa-circle-question text-amber-500" style="margin-right:4px;"></i> Chưa giao dịch liên đới Deal nào.
                <div style="margin-top:6px;">
                  <button class="btn gr xs" onclick="window.crmApp.closeActiveModal(); window.crmApp.convertLeadToDeal('${l.id}')" style="font-weight:700; font-size:10px;"><i class="fa-solid fa-shuffle"></i> Thăng Cấp Thành Deal Hợp Đồng</button>
                </div>
              </div>
            `;
          }
        })()}
      </div>
    `;

    const modalFooter = `
      <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Hủy</button>
      <button class="btn pr" id="m-btn-save-lead-edit"><i class="fa-solid fa-floppy-disk"></i> Cập nhật hồ sơ</button>
    `;

    openModalElement('CẬP NHẬT HỒ SƠ & TIẾP CẬN BẢO MẬT LEAD', modalBody, modalFooter);

    document.getElementById('m-btn-save-lead-edit')?.addEventListener('click', () => {
      l.source = document.getElementById('m-edit-source').value;
      l.priority = document.getElementById('m-edit-priority').value;
      l.value = Number(document.getElementById('m-edit-value').value) || 0;
      l.status = document.getElementById('m-edit-status').value;
      l.ownerId = document.getElementById('m-edit-owner').value;
      l.notes = document.getElementById('m-edit-notes').value;

      if (!isB2C) {
        l.phone = document.getElementById('m-edit-phone').value || l.phone;
        l.email = document.getElementById('m-edit-email').value || l.email;
      }

      toast('Cập nhật hồ sơ tác vụ Lead phễu thành công!', 'success');
      closeActiveModal();
      renderPageContent(CUR_PAGE);
    });
  },
  copyLeadContact: (text) => {
    navigator.clipboard.writeText(text);
    toast('Đã sao chép thông tin tiếp cận B2C!', 'info');
  },
  changeLeadTypeFilter: (type) => {
    FILTER_STATE.leadType = type;
    renderPageContent('leads');
  },
  onNewLeadTypeChange: (val) => {
    const compInput = document.getElementById('m-lead-company');
    if (compInput) {
      if (val === 'b2c') {
        compInput.value = 'Khách hàng cá nhân';
        compInput.disabled = true;
        compInput.style.background = '#f1f5f9';
      } else {
        compInput.value = '';
        compInput.disabled = false;
        compInput.style.background = '#fff';
      }
    }
  },
  deleteLead,
  openDealDetailModal,
  moveDealNextStage,
  logDealActivity,
  switchSimTab,
  simSubmitCaptureForm,
  simAutoScoringRoute,
  simSalesActionLog,
  simAmberDecision,
  simBankWebhookCallback,
  setupMcnaFunnelEvents,
  writeAuditLog,
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
    if (!con) return;

    // Privacy policy: only the owning rep / manager / admin can see or edit
    // the customer's raw contact channels; everyone else gets masked values.
    const canReveal = !!SESSION && (SESSION.role === 'superadmin' || SESSION.role === 'manager' || SESSION.id === con.ownerId);

    const modalBody = `
      <div class="auth-body">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; background:var(--n50); padding:8px 12px; border-radius:6px;">
          <div style="font-size:20px;">👤</div>
          <div>
            <div style="font-size:10px; font-weight:700; color:var(--n500); text-transform:uppercase; letter-spacing:0.5px;">Phân Loại: Khách Hàng Cá Nhân B2C</div>
            <strong style="font-size:14px; color:var(--n900);">${esc(con.fullName)}</strong>
          </div>
        </div>

        <div class="fr2">
          <div class="fg">
            <label>Họ Khách hàng *</label>
            <input type="text" id="m-edit-con-ln" value="${esc(con.lastName || '')}" />
          </div>
          <div class="fg">
            <label>Tên Khách hàng *</label>
            <input type="text" id="m-edit-con-fn" value="${esc(con.firstName || '')}" />
          </div>
        </div>

        <!-- Privacy Shield Visualizer for B2C Contacts -->
        <div class="panel" style="background:#f5f3ff; border:1.5px dashed #8b5cf6; padding:12px; border-radius:8px; margin-bottom:12px;">
          <h4 style="font-size:12px; color:#6d28d9; margin:0 0 4px 0;"><i class="fa-solid fa-shield-halved"></i> CHẾ ĐỘ TIẾP CẬN BẢO MẬT B2C</h4>
          <p style="font-size:11px; color:#5b21b6; margin:0; line-height:1.4;">Phòng ngừa rò rỉ dữ liệu lớn, thông tin liên lạc được hiển thị riêng lẻ hoặc mã hóa an toàn trên giao diện làm việc chung.</p>
          
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
            <div class="fg" style="margin:0;">
              <label style="color:#6d28d9; font-weight:700; font-size:11px;">Số điện thoại (đã che bảo mật)</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="sec-contact-phone" class="tmono" readonly style="flex:1; background:#fff; font-weight:700; color:#4338ca; border:1px solid #c7d2fe; padding:8px; border-radius:6px;" value="${maskPhone(con.phone)}" />
                <button class="btn bl xs" style="height:36px; padding:0 12px;" ${canReveal ? `onclick="window.crmApp.revealSecuredField('contact','${con.id}','phone')"` : 'disabled title="Chỉ Sales phụ trách hoặc Quản lý được giải mã"'}><i class="fa-solid fa-eye"></i> Giải mã</button>
              </div>
            </div>
            <div class="fg" style="margin:0;">
              <label style="color:#6d28d9; font-weight:700; font-size:11px;">Địa chỉ Email (đã che bảo mật)</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="text" id="sec-contact-email" class="tmono" readonly style="flex:1; background:#fff; font-weight:700; color:#4338ca; border:1px solid #c7d2fe; padding:8px; border-radius:6px;" value="${esc(maskEmail(con.email))}" />
                <button class="btn bl xs" style="height:36px; padding:0 12px;" ${canReveal ? `onclick="window.crmApp.revealSecuredField('contact','${con.id}','email')"` : 'disabled title="Chỉ Sales phụ trách hoặc Quản lý được giải mã"'}><i class="fa-solid fa-eye"></i> Giải mã</button>
              </div>
            </div>
            ${canReveal ? '' : `
            <div style="background:var(--n100); color:var(--n500); padding:8px 12px; border-radius:6px; font-size:11px;">
              <i class="fa-solid fa-lock text-rose-500"></i> Bạn không phụ trách khách hàng này nên không thể giải mã hay chỉnh sửa kênh liên lạc.
            </div>`}
          </div>
        </div>

        <div class="fr2">
          <div class="fg">
            <label>Số điện thoại liên hệ *</label>
            <input type="tel" id="m-edit-con-phone" value="${canReveal ? esc(con.phone || '') : esc(maskPhone(con.phone))}" ${canReveal ? '' : 'readonly style="background:#f1f5f9; color:var(--n500);"'} />
          </div>
          <div class="fg">
            <label>Địa chỉ Email *</label>
            <input type="email" id="m-edit-con-email" value="${canReveal ? esc(con.email || '') : esc(maskEmail(con.email))}" ${canReveal ? '' : 'readonly style="background:#f1f5f9; color:var(--n500);"'} />
          </div>
        </div>

        <div class="fr2">
          <div class="fg">
            <label>Nguồn tiếp cận</label>
            <select id="m-edit-con-source">
              <option value="Facebook Ads" ${con.source==='Facebook Ads'?'selected':''}>Facebook Ads</option>
              <option value="Google Search Form" ${con.source==='Google Search Form'?'selected':''}>Google Form tuyển sinh</option>
              <option value="Referral Partner" ${con.source==='Referral Partner'?'selected':''}>Đối tác giới thiệu lẻ</option>
              <option value="Direct Web" ${con.source==='Direct Web'?'selected':''}>Đăng ký tự do Web</option>
            </select>
          </div>
          <div class="fg">
            <label>Phân loại khách lẻ</label>
            <select id="m-edit-con-tags">
              <option value="Khách lẻ" ${con.tags==='Khách lẻ'?'selected':''}>👤 Khách lẻ tiêu dùng</option>
              <option value="VIP" ${con.tags==='VIP'?'selected':''}>💎 Khách hàng VIP</option>
              <option value="Thân thiết" ${con.tags==='Thân thiết'?'selected':''}>⭐ Khách hàng Thân thiết</option>
            </select>
          </div>
        </div>

        <div class="fg">
          <label>Ghi chú tiêu dùng / Nhu cầu mua lẻ</label>
          <textarea id="m-edit-con-notes" rows="2" style="width:100%;">${esc(con.notes || '')}</textarea>
        </div>
      </div>
    `;

    const modalFooter = `
      <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
      <button class="btn pr" id="m-btn-save-con-edit"><i class="fa-solid fa-floppy-disk"></i> Lưu hồ sơ</button>
    `;

    openModalElement('CẬP NHẬT HỒ SƠ KHÁCH HÀNG B2C CÁ NHÂN', modalBody, modalFooter);

    document.getElementById('m-btn-save-con-edit')?.addEventListener('click', () => {
      const ln = document.getElementById('m-edit-con-ln').value;
      const fn = document.getElementById('m-edit-con-fn').value;
      const phone = document.getElementById('m-edit-con-phone').value;
      const email = document.getElementById('m-edit-con-email').value;
      const source = document.getElementById('m-edit-con-source').value;
      const tags = document.getElementById('m-edit-con-tags').value;
      const notes = document.getElementById('m-edit-con-notes').value;

      if (!fn || !ln || !phone || !email) {
        toast('Vui lòng không để trống các thông tin bắt buộc!', 'error');
        return;
      }

      con.lastName = ln;
      con.firstName = fn;
      con.fullName = `${ln} ${fn}`;
      if (canReveal) {
        // masked placeholders must never overwrite the real channels
        con.phone = phone;
        con.email = email;
      }
      con.source = source;
      con.tags = tags;
      con.notes = notes;

      toast('Cập nhật hồ sơ Khách hàng B2C cá nhân thành công!', 'success');
      closeActiveModal();
      renderPageContent(CUR_PAGE);
    });
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
  spawnInvoiceFromQuote: (quoteId) => {
    openInvoiceCreatorForm();
    const selectEl = document.getElementById('m-inv-quote-select');
    if (selectEl) {
      selectEl.value = quoteId;
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
  
  togglePlannerTask: (id) => {
    const task = PLANNER_DB.find(p => p.id === id);
    if (task) {
      task.completed = !task.completed;
      toast(`Đã cập nhật trạng thái nhiệm vụ: ${task.title}!`, 'success');
      go('sales-toolkit');
    }
  },
  deletePlannerTask: (id) => {
    const idx = PLANNER_DB.findIndex(p => p.id === id);
    if (idx !== -1) {
      PLANNER_DB.splice(idx, 1);
      toast('Đã gỡ bỏ tác nghiệp khỏi daily planner!', 'warn');
      go('sales-toolkit');
    }
  },
  convertDiagnosisToQuote: (code, name, price) => {
    const newQuote = {
      id: 'q_' + Math.random().toString(36).substr(2, 9),
      number: 'BG-AURA-' + (QUOTES_DB.length + 1).toString().padStart(4, '0'),
      contactName: 'Đối tác Chuyển đổi Số (' + name + ')',
      contactId: 'c1',
      company: 'Doanh nghiệp Khách hàng',
      items: [{ desc: name + ' (' + code + ')', qty: 1, price: price, total: price }],
      total: price,
      status: 'draft',
      date: '2026-06-06',
      expiry: '2026-07-06'
    };
    QUOTES_DB.unshift(newQuote);
    toast('Đã tự động khởi tạo báo giá nháp tương quan chẩn đoán!', 'success');
    go('quotes');
  },
  selectEmailTemplate: (id) => {
    window.ACTIVE_TPL_ID = id;
    go('sales-toolkit');
  },
  selectEmailMatchedDeal: (id) => {
    window.ACTIVE_TPL_DEAL_ID = id;
    go('sales-toolkit');
  },
  setEmailTemplateFilters: (cat, dtype) => {
    if (cat !== undefined) window.EMAIL_TPL_FILTER_CAT = cat;
    if (dtype !== undefined) window.EMAIL_TPL_FILTER_DEAL_TYPE = dtype;
    go('sales-toolkit');
  },
  mockSendEmail: () => {
    toast('[MOCK SEND] Email đã được gửi thành công tới hòm thư đối tác!', 'success');
  },
  copyEmailToClipboard: () => {
    const subject = document.getElementById('email-resolved-subject-box')?.value || '';
    const body = document.getElementById('email-resolved-body-box')?.value || '';
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    toast('Đã sao chép tiêu đề và nội dung Email tùy biến vào clipboard!', 'success');
  },
  deleteEmailTemplate: (id) => {
    const tpl = EMAIL_TEMPLATES.find(t => t.id === id);
    if (!tpl) return;
    
    const confirmBody = `
      <div style="padding: 10px; text-align: center; color: var(--n800); font-size:13px; line-height:1.5;">
        <div style="font-size:32px; margin-bottom:12px; color:var(--red3);"><i class="fa-solid fa-triangle-exclamation"></i></div>
        Bạn có chắc chắn muốn xóa đi vĩnh viễn mẫu Email <strong class="text-rose-600">"${esc(tpl.name)}"</strong> không?<br/>
        Thao tác này hoàn toàn bất khả thu hồi sau khi thực hiện.
      </div>
    `;
    
    openModalElement(
      'XÁC NHẬN XÓA MẪU THƯ',
      confirmBody,
      `
        <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Huỷ bỏ</button>
        <button class="btn rd" id="modal-tpl-delete-btn" style="font-weight:700;"><i class="fa-solid fa-trash-can"></i> Đồng ý Xóa</button>
      `
    );
    
    document.getElementById('modal-tpl-delete-btn')?.addEventListener('click', () => {
      const idx = EMAIL_TEMPLATES.findIndex(t => t.id === id);
      if (idx !== -1) {
        EMAIL_TEMPLATES.splice(idx, 1);
        closeActiveModal();
        toast('Đã gỡ bỏ mẫu thư này ra khỏi thư viện bán hàng!', 'warn');
        go('sales-toolkit');
      }
    });
  },
  editEmailTemplate: (id) => {
    const tpl = EMAIL_TEMPLATES.find(t => t.id === id);
    if (!tpl) {
      toast('Không tìm thấy mẫu thư tương ứng!', 'error');
      return;
    }

    const formHtml = `
      <div class="auth-body">
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Danh mục thư / Giai đoạn *</label>
          <select id="m-tpl-cat" style="width:100%; padding:8px; border-radius:var(--rs); border:1px solid var(--bd);">
            <option value="intro" ${tpl.category === 'intro' ? 'selected' : ''}>Giới thiệu & Tiếp cận (Intro)</option>
            <option value="quote" ${tpl.category === 'quote' ? 'selected' : ''}>Báo Giá & Chốt Đàm Thoại (Quotation)</option>
            <option value="invoice" ${tpl.category === 'invoice' ? 'selected' : ''}>Báo Hóa Đơn & Nhắc Dư Nợ (Invoice/VAT)</option>
            <option value="care" ${tpl.category === 'care' ? 'selected' : ''}>Chăm Sóc Hậu Mãi CSKH (Follow-up)</option>
          </select>
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Loại Deal / Phân khúc áp dụng *</label>
          <select id="m-tpl-dealtype" style="width:100%; padding:8px; border-radius:var(--rs); border:1px solid var(--bd);">
            <option value="all" ${tpl.dealType === 'all' || !tpl.dealType ? 'selected' : ''}>Tất cả phân khúc (Mặc định)</option>
            <option value="b2b" ${tpl.dealType === 'b2b' ? 'selected' : ''}>B2B Doanh nghiệp (Enterprise)</option>
            <option value="b2c" ${tpl.dealType === 'b2c' ? 'selected' : ''}>B2C Khách lẻ (Consumer)</option>
          </select>
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Tên định nghĩa Mẫu Thư *</label>
          <input type="text" id="m-tpl-name" value="${esc(tpl.name)}" style="width:100%;" required />
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Tiêu đề thư email (Subject) *</label>
          <input type="text" id="m-tpl-subj" value="${esc(tpl.subject)}" style="width:100%;" required />
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Nội dung thư Email (Body) *</label>
          <textarea id="m-tpl-body" rows="7" style="width:100%; padding:8px; border:1px solid var(--bd); border-radius:var(--rs); font-family:var(--fm); font-size:12px;" required>${esc(tpl.body)}</textarea>
        </div>
      </div>
    `;

    const btns = `
      <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
      <button class="btn pr" id="modal-tpl-save-btn" style="font-weight:700;"><i class="fa-solid fa-save"></i> Cập nhật</button>
    `;

    openModalElement('CẬP NHẬT MẪU EMAIL CHUYÊN BIỆT', formHtml, btns);

    document.getElementById('modal-tpl-save-btn')?.addEventListener('click', () => {
      const catVal = document.getElementById('m-tpl-cat').value;
      const dtypeVal = document.getElementById('m-tpl-dealtype').value;
      const nameVal = document.getElementById('m-tpl-name').value.trim();
      const subjVal = document.getElementById('m-tpl-subj').value.trim();
      const bodyVal = document.getElementById('m-tpl-body').value.trim();

      if (!nameVal || !subjVal || !bodyVal) {
        toast('Vui lòng điền trọn vẹn thông tin mẫu thư!', 'error');
        return;
      }

      tpl.category = catVal;
      tpl.dealType = dtypeVal;
      tpl.name = nameVal;
      tpl.subject = subjVal;
      tpl.body = bodyVal;

      closeActiveModal();
      toast('Đã lưu thay đổi vào thư viện mẫu thư!', 'success');
      go('sales-toolkit');
    });
  },
  resetQuizState: () => {
    window.QUIZ_ACTIVE_ANSWERS = Array(5).fill(null);
    window.QUIZ_SCORE = 0;
    window.QUIZ_IS_EVALUATED = false;
    toast('Đã xóa ghi nhận kịch bản cũ, chúc bạn ôn tập tốt!', 'info');
    go('sales-toolkit');
  },
  openPreMeetingQuizModal: (id) => openPreMeetingQuizModal(id),
  closeActiveModal: () => closeActiveModal(),
};

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

function openPreMeetingQuizModal(activityId) {
  const meet = ACTIVITIES_DB.find(a => a.id === activityId);
  if (!meet) {
    toast('Không tìm thấy cuộc gặp mặt liên đới!', 'error');
    return;
  }

  const quizState = PREMEETING_QUIZ_COMPLETED[activityId] || { score: 0, answers: Array(5).fill(null) };
  
  const formHtml = `
    <div style="max-height: 420px; overflow-y: auto; padding-right:8px; font-size:12px; line-height: 1.5; color:var(--n800);">
      <p style="margin-bottom:12px; font-style:italic; color:var(--n500);">
        Aura Playbook bắt buộc nhân viên Sales trả lời đúng 5 tình huống đàm phán quan trọng nhằm bồi dưỡng tác phong, đạt trạng thái sẵn sàng cao nhất trước cuộc gặp <strong>${esc(meet.title)}</strong>.
      </p>
      
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${PREMEETING_QUIZ_QUESTIONS.map((q, qIdx) => {
          const chosenValue = quizState.answers[qIdx];
          return `
            <div style="background:var(--n50); border:1px solid var(--bd); padding:10px; border-radius:var(--rs);">
              <p style="font-weight:700; margin-bottom:6px;"><span class="text-indigo-600">Câu ${qIdx+1}:</span> ${esc(q.q)}</p>
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${q.o.map((o, oIdx) => {
                  const isChecked = chosenValue === oIdx;
                  return `
                    <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:${isChecked ? '700' : 'normal'}; margin:0;">
                      <input type="radio" name="m-qz-q-${qIdx}" class="modal-quiz-radio" data-q-idx="${qIdx}" data-o-idx="${oIdx}" ${isChecked ? 'checked' : ''} style="width:auto; margin:0; cursor:pointer;" />
                      <span>${esc(o)}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const footerBtns = `
    <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
    <button class="btn pr" id="modal-quiz-submit-trigger-btn" style="font-weight:700;"><i class="fa-solid fa-graduation-cap"></i> Gửi kết quả Chấm điểm</button>
  `;

  openModalElement('SALES PLAYBOOK PRE-MEETING QUIZ (BẮT BUỘC)', formHtml, footerBtns);

  document.getElementById('modal-quiz-submit-trigger-btn')?.addEventListener('click', () => {
    const radioInputs = document.querySelectorAll('.modal-quiz-radio');
    const answers = Array(5).fill(null);
    radioInputs.forEach(input => {
      if (input.checked) {
        const qIdx = parseInt(input.dataset.qIdx);
        const oIdx = parseInt(input.dataset.oIdx);
        answers[qIdx] = oIdx;
      }
    });

    const unansweredCount = answers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      toast(`Vui lòng trả lời trọn vẹn 5 đáp án! Còn thiếu ${unansweredCount} tình huống chưa giải quyết.`, 'error');
      return;
    }

    let score = 0;
    PREMEETING_QUIZ_QUESTIONS.forEach((q, qIdx) => {
      if (answers[qIdx] === q.ans) {
        score += 20;
      }
    });

    PREMEETING_QUIZ_COMPLETED[activityId] = { score, answers };
    
    closeActiveModal();
    toast(`Nộp đáp án thành công! Điểm Sẵn Sàng của bạn: ${score}/100. ${score >= 80 ? 'Bạn hoàn toàn bản lĩnh tự tin đàm luận!' : 'Hãy đọc lại Playbook Aura để thuyết phục mượt mà hơn.'}`, score >= 80 ? 'success' : 'warn');
    
    go(CUR_PAGE);
  });
}

function setupSalesToolkitEventHandlers() {
  document.getElementById('tk-tab-planner')?.addEventListener('click', () => {
    window.TOOLKIT_TAB_STATE = 'planner';
    go('sales-toolkit');
  });
  document.getElementById('tk-tab-diagnosis')?.addEventListener('click', () => {
    window.TOOLKIT_TAB_STATE = 'diagnosis';
    go('sales-toolkit');
  });
  document.getElementById('tk-tab-roi')?.addEventListener('click', () => {
    window.TOOLKIT_TAB_STATE = 'roi';
    go('sales-toolkit');
  });
  document.getElementById('tk-tab-email')?.addEventListener('click', () => {
    window.TOOLKIT_TAB_STATE = 'email';
    go('sales-toolkit');
  });
  document.getElementById('tk-tab-quiz')?.addEventListener('click', () => {
    window.TOOLKIT_TAB_STATE = 'quiz';
    go('sales-toolkit');
  });

  // Planner
  document.getElementById('planner-add-task-btn')?.addEventListener('click', () => {
    const titleVal = document.getElementById('planner-task-title')?.value.trim();
    const timeVal = document.getElementById('planner-task-time')?.value.trim() || '10:00';
    const isMit = document.getElementById('planner-task-is-mit')?.checked || false;

    if (!titleVal) {
      toast('Vui lòng điền nội dung kế hoạch Daily Planner!', 'error');
      return;
    }

    const newTask = {
      id: 'p_' + Math.random().toString(36).substr(2, 9),
      title: titleVal,
      completed: false,
      isMIT: isMit,
      time: timeVal
    };

    PLANNER_DB.push(newTask);
    toast('Đã ghi nhận lịch trình tác nghiệp mới!', 'success');
    go('sales-toolkit');
  });

  // Diagnosis
  const diagRadioBtns = document.querySelectorAll('.diagnosis-radio-btn');
  diagRadioBtns.forEach(btn => {
    btn.addEventListener('change', (e) => {
      const qIdx = parseInt(e.currentTarget.dataset.qIdx);
      const oIdx = parseInt(e.currentTarget.dataset.oIdx);
      DIAGNOSIS_ANSWERS[qIdx] = oIdx;
      
      const answeredCount = DIAGNOSIS_ANSWERS.filter(a => a !== null).length;
      const chipEl = document.getElementById('diagnosis-answered-chip');
      if (chipEl) {
        chipEl.innerText = `Hoàn thành: ${answeredCount}/10`;
      }
    });
  });

  document.getElementById('diagnosis-submit-btn')?.addEventListener('click', () => {
    const answeredCount = DIAGNOSIS_ANSWERS.filter(a => a !== null).length;
    if (answeredCount < 10) {
      toast(`Vui lòng phản hồi hết 10 câu chẩn đoán! Bạn mới chọn ${answeredCount}/10 câu.`, 'error');
      return;
    }
    toast('Đã hoàn tất phân tích chẩn đoán nút thắt!', 'success');
    go('sales-toolkit');
  });

  document.getElementById('diagnosis-reset-btn')?.addEventListener('click', () => {
    for (let i = 0; i < 10; i++) {
      DIAGNOSIS_ANSWERS[i] = null;
    }
    toast('Đã dọn sạch câu cũ, vui lòng chọn lại!', 'info');
    go('sales-toolkit');
  });

  // ROI Calculator inputs
  const roiInpRev = document.getElementById('roi-inp-revenue');
  const roiInpStaff = document.getElementById('roi-inp-staff');
  const roiInpHours = document.getElementById('roi-inp-hours');
  const roiInpSalary = document.getElementById('roi-inp-salary');
  const roiInpClose = document.getElementById('roi-inp-closerate');
  const roiInpDeal = document.getElementById('roi-inp-dealvalue');
  const roiInpCost = document.getElementById('roi-inp-crmcost');

  const updateInputs = () => {
    if (roiInpRev) ROI_INPUTS.revenue = parseInt(roiInpRev.value) || 0;
    if (roiInpStaff) ROI_INPUTS.salesStaff = parseInt(roiInpStaff.value) || 0;
    if (roiInpHours) ROI_INPUTS.wasteHours = parseFloat(roiInpHours.value) || 0;
    if (roiInpSalary) ROI_INPUTS.salary = parseInt(roiInpSalary.value) || 0;
    if (roiInpClose) ROI_INPUTS.closeRate = parseInt(roiInpClose.value) || 0;
    if (roiInpDeal) ROI_INPUTS.dealValue = parseInt(roiInpDeal.value) || 0;
    if (roiInpCost) ROI_INPUTS.crmCost = parseInt(roiInpCost.value) || 0;
  };

  [roiInpRev, roiInpStaff, roiInpHours, roiInpSalary, roiInpClose, roiInpDeal, roiInpCost].forEach(inp => {
    inp?.addEventListener('change', () => {
      updateInputs();
      go('sales-toolkit');
    });
  });

  // Pre-meeting quiz in general tab
  const quizRadioBtns = document.querySelectorAll('.quiz-radio-btn');
  quizRadioBtns.forEach(btn => {
    btn.addEventListener('change', (e) => {
      const qIdx = parseInt(e.currentTarget.dataset.qIdx);
      const oIdx = parseInt(e.currentTarget.dataset.oIdx);
      if (!window.QUIZ_ACTIVE_ANSWERS) {
        window.QUIZ_ACTIVE_ANSWERS = Array(5).fill(null);
      }
      window.QUIZ_ACTIVE_ANSWERS[qIdx] = oIdx;
      
      const answeredCount = window.QUIZ_ACTIVE_ANSWERS.filter(a => a !== null).length;
      const chipEl = document.getElementById('quiz-answered-chip');
      if (chipEl) {
        chipEl.innerText = `Hoàn thành: ${answeredCount}/5`;
      }
    });
  });

  document.getElementById('quiz-submit-btn')?.addEventListener('click', () => {
    if (!window.QUIZ_ACTIVE_ANSWERS) {
      window.QUIZ_ACTIVE_ANSWERS = Array(5).fill(null);
    }
    const answers = window.QUIZ_ACTIVE_ANSWERS;
    const answeredCount = answers.filter(a => a !== null).length;
    if (answeredCount < 5) {
      toast(`Vui lòng hoàn thiện đủ 5 câu trắc nghiệm! Còn thiếu ${5 - answeredCount} câu chưa chọn.`, 'error');
      return;
    }

    let score = 0;
    PREMEETING_QUIZ_QUESTIONS.forEach((q, qIdx) => {
       if (answers[qIdx] === q.ans) {
         score += 20;
       }
    });

    window.QUIZ_SCORE = score;
    window.QUIZ_IS_EVALUATED = true;
    toast(`Gửi kết quả đàm luận thành công! Bạn sở hữu: ${score}/100 điểm ready.`, score >= 80 ? 'success' : 'warn');
    go('sales-toolkit');
  });

  // Add Template Popup Triggers
  document.getElementById('email-add-tpl-btn')?.addEventListener('click', () => {
    const formHtml = `
      <div class="auth-body">
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Danh mục thư *</label>
          <select id="m-tpl-cat" style="width:100%; padding:8px; border-radius:var(--rs); border:1px solid var(--bd);">
            <option value="intro">Giới thiệu & Tiếp cận (Intro)</option>
            <option value="quote">Báo Giá & Chốt Đàm Thoại (Quotation)</option>
            <option value="invoice">Báo Hóa Đơn & Nhắc Dư Nợ (Invoice/VAT)</option>
            <option value="care">Chăm Sóc Hậu Mãi CSKH (Follow-up)</option>
          </select>
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Loại Deal / Phân khúc áp dụng *</label>
          <select id="m-tpl-dealtype" style="width:100%; padding:8px; border-radius:var(--rs); border:1px solid var(--bd);">
            <option value="all">Tất cả phân khúc (Mặc định)</option>
            <option value="b2b">B2B Doanh nghiệp (Enterprise)</option>
            <option value="b2c">B2C Khách lẻ (Consumer)</option>
          </select>
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Tên định nghĩa Mẫu Thư *</label>
          <input type="text" id="m-tpl-name" placeholder="Ví dụ: Email xin slot Demo Aura" style="width:100%;" required />
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Tiêu đề thư email (Subject) *</label>
          <input type="text" id="m-tpl-subj" placeholder="Chứa {{KHÁCH_HÀNG}} hoặc {{TÊN_DEAL}}" style="width:100%;" required />
        </div>
        <div class="fg" style="margin-bottom:10px;">
          <label style="font-weight:700;">Nội dung thư Email (Body) *</label>
          <textarea id="m-tpl-body" rows="6" placeholder="Nội dung thư. Hãy dùng các biến: {{KHÁCH_HÀNG}}, {{TÊN_DEAL}}, {{GIÁ_TRỊ_DEAL}} để hệ thống tự sáp nhập khớp." style="width:100%; padding:8px; border:1px solid var(--bd); border-radius:var(--rs); font-family:var(--fm); font-size:12px;" required></textarea>
        </div>
      </div>
    `;

    const btns = `
      <button class="btn bl" onclick="window.crmApp.closeActiveModal()">Thoát</button>
      <button class="btn pr" id="modal-tpl-save-btn" style="font-weight:700;"><i class="fa-solid fa-save"></i> Lưu mẫu</button>
    `;

    openModalElement('KHỞI TẠO MẪU EMAIL CHUYÊN BIỆT', formHtml, btns);

    document.getElementById('modal-tpl-save-btn')?.addEventListener('click', () => {
      const catVal = document.getElementById('m-tpl-cat').value;
      const dtypeVal = document.getElementById('m-tpl-dealtype').value;
      const nameVal = document.getElementById('m-tpl-name').value.trim();
      const subjVal = document.getElementById('m-tpl-subj').value.trim();
      const bodyVal = document.getElementById('m-tpl-body').value.trim();

      if (!nameVal || !subjVal || !bodyVal) {
        toast('Vui lòng điền trọn vẹn thông tin mẫu thư!', 'error');
        return;
      }

      const newTpl = {
        id: 'e_' + Math.random().toString(36).substr(2, 9),
        category: catVal,
        dealType: dtypeVal,
        name: nameVal,
        subject: subjVal,
        body: bodyVal
      };

      EMAIL_TEMPLATES.push(newTpl);
      window.ACTIVE_TPL_ID = newTpl.id; // Switch active selection
      closeActiveModal();
      toast('Đã găm thêm một mẫu email đàm luận!', 'success');
      go('sales-toolkit');
    });
  });
}

export function writeAuditLog(action, resource, status = "thanh_cong") {
  const timestamp = new Date().toLocaleString('vi-VN', { hour12: false });
  const ip = `192.168.1.${Math.floor(Math.random() * 240) + 10}`;
  AUDIT_LOG_DB.unshift({
    id: `adt-${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp,
    user: SESSION ? `${SESSION.name} [${SESSION.role.toUpperCase()}]` : "Hệ thống tự động",
    action,
    resource,
    ip,
    status
  });
}

export function switchSimTab(tabId) {
  ACTIVE_SIM_TAB = tabId;
  go('mcna-funnel');
}

export function simSubmitCaptureForm() {
  const name = document.getElementById('sim-t1-name')?.value?.trim();
  const phone = document.getElementById('sim-t1-phone')?.value?.trim();
  const email = document.getElementById('sim-t1-email')?.value?.trim();
  const source = document.getElementById('sim-t1-source')?.value;
  const need = document.getElementById('sim-t1-need')?.value;
  const region = document.getElementById('sim-t1-region')?.value;
  const valInput = document.getElementById('sim-t1-val')?.value;
  const val = Number(valInput) || 0;

  // 1. STYLED MANDATORY AND FULL NAME VALIDATION
  if (!name || !phone || !email || !valInput) {
    toast('🔴 CHẶN ĐỨNG: Hãy điền đầy đủ tất cả các trường thông tin bắt buộc (Họ tên, SĐT, Email, Trị giá)!', 'error');
    writeAuditLog('Kiểm duyệt Thắt Chặt (Chặn đứng): Thiếu trường bắt buộc', 'Form Capture T1', 'bi_chan');
    return;
  }

  const nameWords = name.split(/\s+/).filter(w => w.length > 0);
  if (nameWords.length < 2) {
    toast('🔴 CHẶN ĐỨNG: Yêu cầu bắt buộc điền đầy đủ cả HỌ VÀ TÊN (Ví dụ: Nguyễn Sơn, Nguyễn Ngọc Sơn), không được nhập tên rút gọn vắn tắt!', 'error');
    writeAuditLog('Kiểm duyệt Thắt Chặt (Chặn đứng): Tên không đầy đủ', 'Form Capture T1', 'bi_chan');
    return;
  }

  // TC-020: Check if name contains any numbers
  if (/\d/.test(name)) {
    toast('Chặn đứng bởi Layer 5: Tên khách hàng không được phép chứa chữ số!', 'error');
    writeAuditLog('Kiểm duyệt T5 (Chặn đứng): Tên chứa chữ số phát sinh từ chối tạo Contact', 'Form Capture T1', 'bi_chan');
    return;
  }

  // TC-003: Check Vietnamese Phone format (exactly 10 digits and starts with valid mobile prefixes)
  const validateVietnamPhone = (p) => {
    const cleaned = p.replace(/[\s\-\.]/g, '');
    return /^(03|05|07|08|09)\d{8}$/.test(cleaned);
  };
  if (!validateVietnamPhone(phone)) {
    toast('Chặn đứng bởi Layer 5: Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678, bắt đầu bằng 03/05/07/08/09 và dài đúng 10 số)!', 'error');
    writeAuditLog('Kiểm duyệt T5: Đăng ký Lead thất bại do SĐT sai định dạng Việt Nam', 'Form Capture T1', 'bi_chan');
    return;
  }

  // 2. STRICT DE-DUPLICATION CHECK FOR SAME PHONE OR EMAIL ACROSS DIFFERENT NAMES
  const targetPhoneClean = phone.replace(/[\s\-\.]/g, '');
  const dupPhoneLead = LEADS_DB.find(l => l.phone.replace(/[\s\-\.]/g, '') === targetPhoneClean);
  const dupPhoneContact = CONTACTS_DB.find(c => c.phone.replace(/[\s\-\.]/g, '') === targetPhoneClean);
  
  const dupEmailLead = LEADS_DB.find(l => l.email && l.email.toLowerCase() === email.toLowerCase());
  const dupEmailContact = CONTACTS_DB.find(c => c.email && c.email.toLowerCase() === email.toLowerCase());

  if (dupPhoneLead || dupPhoneContact) {
    const matchedName = dupPhoneLead ? dupPhoneLead.name : dupPhoneContact.fullName;
    toast(`🔴 CHẶN TRÙNG LẶP HỆ THỐNG: Số điện thoại (${phone}) đã được đăng ký bởi "${matchedName}" trước đó! Vui lòng kiểm tra lại để tránh gọi chồng chéo hoặc tạo dữ liệu rác!`, 'error');
    writeAuditLog(`Kiểm duyệt Chặn Trùng: SĐT trùng lặp với ${matchedName}`, 'Form Capture T1', 'bi_chan');
    return;
  }

  if (dupEmailLead || dupEmailContact) {
    const matchedName = dupEmailLead ? dupEmailLead.name : dupEmailContact.fullName;
    toast(`🔴 CHẶN TRÙNG LẶP HỆ THỐNG: Địa chỉ Email (${email}) đã được đăng ký bởi "${matchedName}" trước đó! Vui lòng sử dụng thông tin khác!`, 'error');
    writeAuditLog(`Kiểm duyệt Chặn Trùng: Email trùng lặp với ${matchedName}`, 'Form Capture T1', 'bi_chan');
    return;
  }

  // TC-005: Check for disposable email domains
  const DISPOSABLE_EMAIL_DOMAINS = ['mailinator.com', 'temp-mail.org', 'trashmail.com', 'tempmail.com', 'yopmail.com'];
  const emailParts = email.split('@');
  if (emailParts.length < 2 || DISPOSABLE_EMAIL_DOMAINS.includes(emailParts[1].toLowerCase())) {
    toast('Chặn đứng bởi Layer 5: Email không hợp lệ (Không cho phép sử dụng email rác/vô danh)!', 'error');
    writeAuditLog('Kiểm duyệt T5: Đăng ký Lead bất thành công do sử dụng Email rác', 'Form Capture T1', 'bi_chan');
    return;
  }

  // TC-007 & TC-008: Get active, under-capacity sales reps (max active leads capacity = 5)
  const MAX_SALES_CAPACITY = 5;
  const activeSellers = USERS_DB.filter(u => u.role === 'sales' && u.status === 'active');
  const getActiveLeadsCount = (sellerId) => {
    return LEADS_DB.filter(l => l.ownerId === sellerId && l.status !== 'lost' && l.status !== 'converted' && l.status !== 'qualified').length;
  };
  const availableSellers = activeSellers.filter(u => getActiveLeadsCount(u.id) < MAX_SALES_CAPACITY);

  let assignedRepId = 'usr-sales'; // default rep fallback
  let isAssignedPending = false;

  if (availableSellers.length > 0) {
    if (typeof window.LAST_ROUND_ROBIN_INDEX === 'undefined') {
      window.LAST_ROUND_ROBIN_INDEX = -1;
    }
    // Perform robust round-robin index rotation
    window.LAST_ROUND_ROBIN_INDEX = (window.LAST_ROUND_ROBIN_INDEX + 1) % availableSellers.length;
    assignedRepId = availableSellers[window.LAST_ROUND_ROBIN_INDEX].id;
  } else {
    // TC-009: No reps available under limit -> move to pending assignment queue state
    assignedRepId = 'pending_assignment';
    isAssignedPending = true;
  }

  // TC-004: Duplicate Contact Check (check matching phone in database list)
  let isNewContactCreated = false;
  const existingContact = CONTACTS_DB.find(c => c.phone === phone);
  if (existingContact) {
    // If different source, combine notes and update source reference
    if (existingContact.source !== source) {
      existingContact.notes = (existingContact.notes || '') + ` [Lần tái tiếp cận qua nguồn mới: ${source}]`;
      existingContact.source = source;
    }
    writeAuditLog('duplicate_contact: Biểu mẫu điền form phát hiện trùng SĐT Liên hệ', 'Contacts Collection', 'thanh_cong');

    // Notify assigned Sales rep about returning customer
    const notifyRepId = existingContact.ownerId || assignedRepId;
    if (notifyRepId !== 'pending_assignment') {
      NOTIFICATIONS_DB.unshift({
        id: `notif-${Date.now()}`,
        type: 'new_lead',
        title: '⚠️ [Tập Khách] Liên hệ cũ tái tiếp cận phễu',
        content: `Khách hàng cũ "${existingContact.fullName}" SĐT (${phone}) vừa điền lại biểu mẫu từ nguồn "${source}". Vui lòng lên phương án gọi hỗ trợ ngay.`,
        time: 'Vừa xong',
        user: 'Hệ thống tự động'
      });
    }
    toast(`Phát hiện liên hệ cũ (${existingContact.fullName}) đã có trong DB! Không nhân bản liên hệ, tự động kích hoạt thông báo tái tiếp cận cho Sales.`, 'warning');
    assignedRepId = existingContact.ownerId || assignedRepId;
  } else {
    // Create new contact in DB
    CONTACTS_DB.unshift({
      id: uid('con'),
      firstName: name.split(' ').pop() || name,
      lastName: name.split(' ')[0] || '',
      fullName: name,
      title: 'Đại diện đối tác SMB',
      companyId: `cmp-${LEADS_DB.length + 50}`,
      companyName: `${name} Ltd`,
      phone,
      email,
      source,
      ownerId: assignedRepId,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      notes: `Capture tự động từ form, nhu cầu chính: ${need}`
    });
    isNewContactCreated = true;
    writeAuditLog(`Tạo Contact thành công trong DB cho khách hàng ${name}`, 'Contacts Collection', 'thanh_cong');
  }

  // TC-006: Enhanced Scoring Algorithm
  let points = 2; // base score points
  if (email.includes('@') && !DISPOSABLE_EMAIL_DOMAINS.includes(emailParts[1]?.toLowerCase())) {
    points += 3;
  }
  if (val >= 100000000) { // 100 million VND size
    points += 3;
  }
  if (phone.length === 10 && validateVietnamPhone(phone)) {
    points += 2;
  }
  if (source.includes('Ads') || source.includes('Form')) {
    points += 1;
  }
  const priority = points >= 8 ? 'hot' : points >= 4 ? 'warm' : 'cold';

  const salesUser = USERS_DB.find(u => u.id === assignedRepId) || { name: 'Người nhận' };

  // Write new Lead to database
  const assignedName = isAssignedPending ? 'Hàng Chờ Pending-Queue (Mọi Sales đầy tải >= 5)' : salesUser.name;
  const newLeadObj = {
    id: uid('led'),
    leadType: 'b2b',
    name,
    company: `${name} SMB Co`,
    phone,
    email,
    source,
    status: isAssignedPending ? 'pending_assignment' : 'new',
    value: val,
    ownerId: assignedRepId,
    createdAt: new Date().toLocaleDateString('vi-VN'),
    deadline: '30/06/2026',
    priority,
    notes: `Hệ thống MCNA xếp lớp: ${region}. Score: ${points}đ. assigned_to_sales: ${assignedName}`
  };

  LEADS_DB.unshift(newLeadObj);
  writeAuditLog(`Tạo Lead mới thành công cho ${name}. Gán cho: ${assignedName}`, 'Leads Collection');

  // TRIGGER REAL-TIME ASSIGNED SALES NOTIFICATION IMMEDIATELY
  if (!isAssignedPending && assignedRepId) {
    NOTIFICATIONS_DB.unshift({
      id: `notif-sales-${Date.now()}`,
      userId: assignedRepId,
      unread: true,
      title: '⚡ [Phân Phối Toàn Tuyến] BẠN ĐƯỢC CHỈ ĐỊNH LEAD MỚI!',
      content: `Marketer vừa chia Lead "${name}" (SĐT: ${phone}) cho bạn. Vui lòng liên lạc ngay và tiến hành đàm luận Deal T3!`,
      time: 'Vừa xong',
      user: 'Marketer Hệ thống'
    });
    dispatchAssignmentEmail(newLeadObj);
  }

  // TC-001: Email confirmation simulator alert
  setTimeout(() => {
    toast(`📨 Tự động gửi email xác nhận thành công tới ${email}!`, 'info');
  }, 1000);

  if (val > 0) {
    // If has value, trigger the majestic semi-agentic flow modal so the user witnesses it!
    triggerAuraAgentPipeline(newLeadObj);
  } else {
    if (isAssignedPending) {
      toast(`Gửi biểu mẫu thành công! Lead được chấm ${points} điểm (${priority.toUpperCase()}). Cảnh báo: Mọi bộ phận Sales hiện tại đều đã đạt tải (>=${MAX_SALES_CAPACITY} leads), chuyển lead sang chế độ gán TREO gộp hàng chờ.`, 'warning');
    } else {
      toast(`Gửi biểu mẫu đăng ký phễu thành công! Chấm điểm Lead đạt ${points} điểm (${priority.toUpperCase()}), tự động gán cho Sales Rep: ${salesUser.name || assignedName}.`, 'success');
    }

    // Jump to next simulator phase tab
    ACTIVE_SIM_TAB = 't2';
    go('mcna-funnel');
  }
}

export function simAutoScoringRoute() {
  const latestLead = LEADS_DB[0];
  if (!latestLead) {
    toast('Không tìm thấy Lead để khởi tạo Deal! Vui lòng gửi biểu mẫu ở T1 trước.', 'error');
    return;
  }
  
  // Check if a Deal already exists for this Lead/Contact
  const existingDeal = DEALS_DB.find(d => d.contactName === latestLead.name || d.name.includes(latestLead.name));
  if (existingDeal) {
    toast('Deal cho khách hàng này đã tồn tại trong luồng đàm phán rồi!', 'warning');
    ACTIVE_SIM_TAB = 't3';
    go('mcna-funnel');
    return;
  }

  // Determine need from notes or default
  let need = 'Aura CRM Core Pack';
  if (latestLead.notes && latestLead.notes.includes('nhu cầu chính:')) {
    const parts = latestLead.notes.split('nhu cầu chính:');
    need = parts[1]?.trim() || need;
  }

  // Promote Lead to Deal in prospecting stage (forces the user to log a call to transition)
  const newDeal = {
    id: uid('dea'),
    name: `Gói ${need} cho ${latestLead.name}`,
    contactId: `con-${CONTACTS_DB.length}`,
    contactName: latestLead.name,
    companyId: latestLead.companyId || `cmp-${LEADS_DB.length + 50}`,
    companyName: latestLead.company || `${latestLead.name} Ltd`,
    value: latestLead.value,
    stage: 'prospecting', // Starts at prospecting to let Sales log a call to progress
    probability: 20,
    ownerId: latestLead.ownerId,
    expectedClose: '30/06/2026',
    createdAt: new Date().toLocaleDateString('vi-VN'),
    lastActivity: new Date().toLocaleDateString('vi-VN'),
    tags: latestLead.status === 'pending_assignment' ? ['Pending-Assign'] : ['Awaiting-Action']
  };

  DEALS_DB.unshift(newDeal);
  
  // Update lead status to qualified/promoted
  latestLead.status = 'qualified';

  writeAuditLog(`Tốt nghiệp Lead thành công: Thăng cấp ${latestLead.name} thành Deal cơ hội`, `Deal ID: ${newDeal.id}`);
  toast(`🎉 Đã tốt nghiệp & phân bổ Lead! Chuyển trạng thái sang "Qualified", tự động khởi tạo Deal cơ hội nháp tại T3 (Phân kỳ Prospecting).`, 'success');

  ACTIVE_SIM_TAB = 't3';
  go('mcna-funnel');
}

export function simSalesActionLog(dealId, actionType) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  if (!deal) return;
  
  const label = actionType === 'call' ? 'gọi điện trực tiếp' : actionType === 'meeting' ? 'thương thảo thương giới offline' : 'bàn giao biểu đồ báo giá';
  
  // Save activity
  ACTIVITIES_DB.unshift({
    id: `act-${Date.now()}`,
    dealId,
    type: actionType,
    notes: `Tác nghiệp Sales: Tiến hành ${label} xúc tiến cam kết.`,
    date: new Date().toLocaleDateString('vi-VN'),
    user: SESSION ? SESSION.name : 'Sales Rep'
  });

  writeAuditLog(`Log tác vụ (${label}) thúc đẩy Deal`, `Deal ID: ${dealId}`);
  toast('Đã ghi nhận lịch sử tác nghiệp vào danh mục dòng hoạt động!', 'success');
  go('mcna-funnel');
}

export function simAmberDecision(dealId, decisionType) {
  const deal = DEALS_DB.find(d => d.id === dealId);
  if (!deal) return;

  // TC-011: Workflow enforcement - must have logged a call before committing any customer agreement/decision
  const hasCall = ACTIVITIES_DB.some(act => act.dealId === dealId && act.type === 'call');
  if (!hasCall) {
    toast('🔒 Chặn đứng bởi Layer 5: Bạn phải tác nghiệp gọi điện [Log Cuộc Gọi] trước khi có thể ghi nhận quyết định từ phía khách hàng!', 'error');
    writeAuditLog('Kiểm duyệt T5 (Ngăn chặn): Từ chối xử lý Quyết định Amber do thiếu Log gọi điện thoại', `Deal: ${deal.name}`, 'bi_chan');
    return;
  }

  if (decisionType === 'accept') {
    deal.stage = 'negotiation';
    deal.tags = ['Awaiting-Payment'];
    deal.probability = 90;
    
    // Create Invoice pending
    const existingInv = INVOICES_DB.find(i => i.dealId === dealId);
    if (!existingInv) {
      INVOICES_DB.unshift({
        id: `inv-${dealId}`,
        dealId,
        companyName: deal.companyName,
        amount: deal.value,
        dueDate: '30/06/2026',
        status: 'pending',
        createdAt: new Date().toLocaleDateString('vi-VN')
      });
    }

    writeAuditLog('Quyết định Amber: Chấp nhận chốt pháp lý hợp đồng & xuất liên kết nợ thanh toán', `Deal ID: ${dealId}`);
    toast('Khách hàng CHẤP NHẬN! Bản dự thảo hoá đơn & link thanh toán tại T4 đã kích hoạt.', 'success');
    ACTIVE_SIM_TAB = 't4';
  } 
  else if (decisionType === 'delay') {
    deal.stage = 'proposal';
    deal.probability = 50;
    writeAuditLog('Quyết định Amber: Khách hàng kéo dãn thời hạn cân nhắc', `Deal ID: ${dealId}`);
    toast('Đã cập nhật hệ số kéo lùi 50%, ghi chú gia hạn nhắc việc tự động.', 'info');
  } 
  else if (decisionType === 'reject') {
    deal.stage = 'nurtured';
    deal.tags = ['Nurture'];
    writeAuditLog('Quyết định Amber: Từ chối - Đưa trả về Phễu Nurture tái nuôi dưỡng tự động', `Deal ID: ${dealId}`);
    
    // TC-013: Set automatic task follow up 90 days (3 months) later
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN');
    TASKS_DB.unshift({
      id: `tsk-${Date.now()}`,
      title: `📞 Chăm sóc lại đối tác hoãn nhu cầu: ${deal.companyName}`,
      type: 'call',
      description: `Khách hàng từ chối đàm phán hợp đồng 3 tháng trước. Bốc máy trao đổi lại xem tình trạng phát triển mới và giới thiệu chương trình nâng cấp tính năng. (Auto nurture reminder)`,
      relatedTo: 'Deal',
      relatedId: dealId,
      ownerId: deal.ownerId || SESSION.id,
      dueDate: futureDate,
      priority: 'medium',
      status: 'not_started',
      completed: false,
      subtasks: []
    });

    toast('Đã kích hoạt phán quyết Amber (Từ chối) -> Chuyển dòng dữ liệu sang Luồng Nurture & tạo tác vụ nhắc gọi lại sau 3 tháng!', 'error');
  }
  
  go('mcna-funnel');
}

// TC-018: Keep track of deal closing velocity anomalies
let DEAL_CLOSED_TIMESTAMPS = [];
export function trackAndReportVelocityAnomaly() {
  const now = Date.now();
  DEAL_CLOSED_TIMESTAMPS.push(now);
  // Filter for deal closures in the last 15 seconds
  const recentCloses = DEAL_CLOSED_TIMESTAMPS.filter(t => now - t < 15000);
  if (recentCloses.length >= 3) {
    writeAuditLog('🚨 Cảnh báo an ninh Cấp độ 3 (ANOMALY): Tần suất chốt Deal bất thường quá nhanh (>3 deals/15s)!', 'Control Layer 5', 'canh_bao');
    toast('🚨 Radar Layer 5 Cảnh Báo: Chốt deal liên tiếp quá nhanh! Kích hoạt quy trình đóng Whitelist phòng ngừa rò rỉ dữ liệu hoặc spam bulk actions!', 'warning');
  }
}

// TC-015: Idempotency keys tracker
let PROCESSED_WEBHOOK_TXS = new Set();

export function simBankWebhookCallback(dealId) {
  // TC-015: Idempotency Verification
  if (PROCESSED_WEBHOOK_TXS.has(dealId)) {
    toast('⚠️ Chặn đứng (Lỗi Idempotency): Giao dịch thanh toán Webhook này đã được đối soát xử lý trước đó rồi!', 'warning');
    writeAuditLog('Cổng Pay Webhook (Từ chối): Phát hiện yêu cầu trùng lặp trùng lặp chữ ký đối chiếu', `Deal ID: ${dealId}`, 'canh_bao');
    return;
  }

  const deal = DEALS_DB.find(d => d.id === dealId);
  if (!deal) return;

  // Track transaction as processed
  PROCESSED_WEBHOOK_TXS.add(dealId);

  // TC-014: Simulate HMAC SHA256 Signature generation & authentication
  const simulatedPayload = JSON.stringify({ dealId, amount: deal.value, timestamp: Date.now() });
  const simulatedHashKey = "MCNA_ENTERPRISE_WEBHOOK_SECRET_KEY";
  // Classic simple hashing simulation to print out a highly realistic signature hex
  const simulatedSignature = Array.from(simulatedPayload).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) & 0xffffffff, 0).toString(16);

  deal.stage = 'closed_won';
  deal.probability = 100;
  
  // Finish invoice
  const inv = INVOICES_DB.find(i => i.dealId === dealId || i.id === `inv-${dealId}`);
  if (inv) {
    inv.status = 'paid';
  }

  writeAuditLog(`Cổng Pay Webhook: Khớp chữ ký hmac-sha256=${simulatedSignature} đối soát thành công`, `Deal: ${deal.name}`);

  // Multi-department notification triggers
  const repNotif = {
    id: `notif-${Date.now()}-1`,
    title: '💰 [Doanh Số] Khớp lệnh doanh thu thành công',
    content: `Deal "${deal.name}" từ đối tác "${deal.companyName}" đã thanh toán trọn gói ${deal.value.toLocaleString('vi-VN')} VND. Hoa hồng sales ghi nhận thành công.`,
    time: 'Vừa xong',
    user: 'Hệ thống tự động'
  };
  NOTIFICATIONS_DB.unshift(repNotif);

  const pmNotif = {
    id: `notif-${Date.now()}-2`,
    title: '🛠️ [Dự Án PM] Kích hoạt bàn giao hạ tầng',
    content: `Cung ứng dịch vụ lắp ráp máy chủ, đồng bộ dữ liệu CRM cho đối tác "${deal.companyName}". PM nhận trọng điểm tiến trình bàn giao.`,
    time: 'Vừa xong',
    user: 'Webhook Bank Auto'
  };
  NOTIFICATIONS_DB.unshift(pmNotif);

  const accNotif = {
    id: `notif-${Date.now()}-3`,
    title: '🧾 [Kế Toán] Trát đối chiếu Hóa Đơn Giá Trị Gia Tăng (VAT)',
    content: `Khoản nợ hoá đơn hợp đồng "inv-${dealId}" đã qua rà soát khớp tiền thực. Kế toán đối chiếu kết xuất hóa đơn giá trị gia tăng sau đó.`,
    time: 'Vừa xong',
    user: 'Hệ thống tự động'
  };
  NOTIFICATIONS_DB.unshift(accNotif);

  // Play banner receiver print
  setTimeout(() => {
    const box = document.getElementById('sim-webhook-notif-toast-area');
    if (box) {
      box.innerHTML = `
        <div style="font-weight: 800; display:flex; align-items:center; gap:6px; margin-bottom:8px;">
          <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10b981;" class="animate-pulse"></span>
          <span>🛰️ CỔNG WEBHOOK BROADCAST - THÔNG BÁO LIÊN PHÒNG BAN THÀNH CÔNG!</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px; font-size:10px; border-left: 2px solid #10b981; padding-left:8px;">
          <div><span style="color:#0fa5e9; font-weight:700;">[Sales Rep]</span>: ${repNotif.content}</div>
          <div><span style="color:#10b981; font-weight:700;">[Project Manager]</span>: ${pmNotif.content}</div>
          <div><span style="color:#f59e0b; font-weight:700;">[Kế toán]</span>: ${accNotif.content}</div>
        </div>
      `;
      box.style.display = 'block';
    }
  }, 100);

  toast('Webhook khớp thanh toán, phát tán 3 thông cáo thành công!', 'success');
  
  setTimeout(() => {
    go('mcna-funnel');
  }, 3500);
}

export function simRunEndToEndFlow() {
  toast('🎬 Kích hoạt bộ mô phỏng chuỗi liên hoàn 5 Tầng đầu-cuối...', 'info');

  // Step 1: Submit Form (1000ms)
  setTimeout(() => {
    const leadName = "Bách Hóa Xanh (Mô phỏng)";
    const existing = LEADS_DB.find(l => l.name === leadName);
    if (existing) {
      const index = LEADS_DB.indexOf(existing);
      if (index !== -1) LEADS_DB.splice(index, 1);
    }

    const newLeadObj = {
      id: uid('led'),
      leadType: 'b2b',
      name: leadName,
      company: "Bách Hóa Xanh (Mô phỏng)",
      phone: "0345991823",
      email: "billing@bhx.com.vn",
      source: "Warm Event",
      region: "Kinh doanh miền Nam",
      value: 180000000,
      priority: "hot",
      status: "new",
      ownerId: "usr-sales",
      notes: "Nhu cầu chính: Aura CRM Core Pack. Khởi tạo tự động từ luồng liên hoàn.",
      createdAt: new Date().toLocaleDateString('vi-VN')
    };
    LEADS_DB.unshift(newLeadObj);
    writeAuditLog(`[AutoFlow] Tiếp nhận biểu mẫu thu thập T1: ${leadName}`, 'Marketing T1');
    toast('🚀 Bước 1: Landing Page nhận Form Đăng Ký thành công! Đẩy về Tầng 2.', 'success');
    ACTIVE_SIM_TAB = 't2';
    go('mcna-funnel');

    // Step 2: Auto-routing and lead scoring (2500ms)
    setTimeout(() => {
      toast('⚙️ Bước 2: Chạy chấm điểm Lead Scoring & phân bổ tự động sang Tầng 3.', 'info');
      const prevDeal = DEALS_DB.find(d => d.contactName === leadName);
      if (prevDeal) {
        const idx = DEALS_DB.indexOf(prevDeal);
        if (idx !== -1) DEALS_DB.splice(idx, 1);
      }

      const newDeal = {
        id: uid('dea'),
        name: `Gói CRM Core Pack cho ${leadName}`,
        contactId: `con-autoflow-${Date.now()}`,
        contactName: leadName,
        companyId: `cmp-autoflow-${Date.now()}`,
        companyName: "Bách Hóa Xanh (Mô phỏng)",
        value: 180000000,
        stage: 'prospecting',
        probability: 20,
        ownerId: 'usr-sales',
        expectedClose: '30/06/2026',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        lastActivity: new Date().toLocaleDateString('vi-VN'),
        tags: ['Awaiting-Action']
      };
      DEALS_DB.unshift(newDeal);
      newLeadObj.status = 'qualified';
      writeAuditLog(`[AutoFlow] Tốt nghiệp Lead sang Deal nháp: ${newDeal.name}`, 'Lead Routing T2');
      ACTIVE_SIM_TAB = 't3';
      go('mcna-funnel');

      // Step 3: Sales Log a call and Amber Decision Accept (4000ms)
      setTimeout(() => {
        toast('📞 Bước 3: Sales bốc điện thoại gọi tư vấn và ghi log cuộc đàm thoại thành công.', 'info');
        // Add Activity
        ACTIVITIES_DB.push({
          id: `act-${Date.now()}-autoflow`,
          type: 'call',
          title: `📞 Cuộc gọi tư vấn giải pháp CRM với ${leadName}`,
          contactId: newDeal.contactId,
          dealId: newDeal.id,
          ownerId: 'usr-sales',
          datetime: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          duration: '12 phút',
          outcome: 'Khách hàng cực kỳ hào hứng, đề xuất ký hợp đồng ngay.',
          notes: 'Khấu trừ 5% ưu đãi hỗ trợ hạ tầng.',
          direction: 'outbound'
        });
        writeAuditLog(`[AutoFlow] Sales ghi nhận nhật ký tư vấn & báo cáo`, `Deal ID: ${newDeal.id}`);
        go('mcna-funnel');

        // Step 4: Amber Decision (5500ms)
        setTimeout(() => {
          toast('💎 Khách hàng đưa ra phán quyết Amber [ĐỒNG Ý CHỐT]! Kích hoạt hóa đơn nợ T4.', 'success');
          newDeal.stage = 'negotiation';
          newDeal.tags = ['Awaiting-Payment'];
          newDeal.probability = 90;
          
          INVOICES_DB.unshift({
            id: `inv-${newDeal.id}`,
            dealId: newDeal.id,
            companyName: newDeal.companyName,
            amount: newDeal.value,
            dueDate: '30/06/2026',
            status: 'pending',
            createdAt: new Date().toLocaleDateString('vi-VN')
          });
          writeAuditLog(`[AutoFlow] Chấp thuận pháp lý, khởi tạo hóa đơn nợ`, `Invoice: inv-${newDeal.id}`);
          ACTIVE_SIM_TAB = 't4';
          go('mcna-funnel');

          // Step 5: Webhook Callback (7500ms)
          setTimeout(() => {
            toast('🎯 Bước 4: Kích hoạt simulated bank webhook khớp tiền realtime!', 'info');
            simBankWebhookCallback(newDeal.id);
            ACTIVE_SIM_TAB = 't4';
            go('mcna-funnel');
            toast('🎉 HOÀN TẤT LUỒNG LIÊN HOÀN 5 BƯỚC KHÉP KÍN THÀNH CÔNG RỰC RỠ!', 'success');
          }, 2000);

        }, 1500);

      }, 1500);

    }, 1500);

  }, 1000);
}

export function downloadMultiSheetExcel() {
  toast('Khởi tạo xuất kết xuất số liệu đa phân hệ...', 'info');

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>MCNA CRM System</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1e3a8a" ss:Pattern="Solid"/>
    </Style>
  </Styles>`;

  // 1. Contacts Sheet
  xml += `
  <Worksheet ss:Name="Contacts">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Contact ID</Data></Cell>
        <Cell><Data ss:Type="String">Full Name</Data></Cell>
        <Cell><Data ss:Type="String">Phone</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Source</Data></Cell>
        <Cell><Data ss:Type="String">Created At</Data></Cell>
      </Row>`;
  CONTACTS_DB.forEach(c => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escXml(c.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(c.fullName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(c.phone)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(c.email)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(c.source)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(c.createdAt)}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>`;

  // 2. Leads Sheet
  xml += `
  <Worksheet ss:Name="Leads">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Lead ID</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">Company</Data></Cell>
        <Cell><Data ss:Type="String">Phone</Data></Cell>
        <Cell><Data ss:Type="String">Email</Data></Cell>
        <Cell><Data ss:Type="String">Source</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Value</Data></Cell>
        <Cell><Data ss:Type="String">Priority</Data></Cell>
        <Cell><Data ss:Type="String">Created At</Data></Cell>
      </Row>`;
  LEADS_DB.forEach(l => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escXml(l.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.company)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.phone)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.email)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.source)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.status)}</Data></Cell>
        <Cell><Data ss:Type="Number">${l.value}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.priority)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.createdAt)}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>`;

  // 3. Deals Sheet
  xml += `
  <Worksheet ss:Name="Deals">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Deal ID</Data></Cell>
        <Cell><Data ss:Type="String">Deal Name</Data></Cell>
        <Cell><Data ss:Type="String">Contact Name</Data></Cell>
        <Cell><Data ss:Type="String">Company Name</Data></Cell>
        <Cell><Data ss:Type="String">Value</Data></Cell>
        <Cell><Data ss:Type="String">Stage</Data></Cell>
        <Cell><Data ss:Type="String">Probability (%)</Data></Cell>
        <Cell><Data ss:Type="String">Expected Close</Data></Cell>
        <Cell><Data ss:Type="String">Created At</Data></Cell>
      </Row>`;
  DEALS_DB.forEach(d => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escXml(d.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.contactName)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.companyName)}</Data></Cell>
        <Cell><Data ss:Type="Number">${d.value}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.stage)}</Data></Cell>
        <Cell><Data ss:Type="Number">${d.probability}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.expectedClose)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(d.createdAt)}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>`;

  // 4. Activities Sheet
  xml += `
  <Worksheet ss:Name="Activities">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Activity ID</Data></Cell>
        <Cell><Data ss:Type="String">Type</Data></Cell>
        <Cell><Data ss:Type="String">Title</Data></Cell>
        <Cell><Data ss:Type="String">Notes</Data></Cell>
        <Cell><Data ss:Type="String">Date/Time</Data></Cell>
        <Cell><Data ss:Type="String">Outcome</Data></Cell>
      </Row>`;
  ACTIVITIES_DB.forEach(a => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escXml(a.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(a.type)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(a.title)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(a.notes)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(a.datetime || a.date + ' 09:00')}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(a.outcome || 'Đã hoàn tất')}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>`;

  // 5. Audit Log Sheet
  xml += `
  <Worksheet ss:Name="AuditLog">
    <Table>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">Log ID</Data></Cell>
        <Cell><Data ss:Type="String">Timestamp</Data></Cell>
        <Cell><Data ss:Type="String">User</Data></Cell>
        <Cell><Data ss:Type="String">Action</Data></Cell>
        <Cell><Data ss:Type="String">Resource</Data></Cell>
        <Cell><Data ss:Type="String">IP Address</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
      </Row>`;
  AUDIT_LOG_DB.forEach(l => {
    xml += `
      <Row>
        <Cell><Data ss:Type="String">${escXml(l.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.timestamp)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.user)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.action)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.resource)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.ip)}</Data></Cell>
        <Cell><Data ss:Type="String">${escXml(l.status)}</Data></Cell>
      </Row>`;
  });
  xml += `
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Aura_CRM_Enterprise_Report.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast('Tải xuống báo cáo đa phân hệ XLSX chứa đúng 5 trang số liệu thành công!', 'success');
}

function escXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function markNotifAsRead(id) {
  const notif = NOTIFICATIONS_DB.find(n => n.id === id);
  if (notif) {
    notif.unread = false;
    toast('Đã ghi nhận thông báo là đã đọc!', 'success');
    renderTopbar();
    if (CUR_PAGE === 'notifications') {
      renderPageContent('notifications');
    }
  }
}

export function deleteNotif(id) {
  const idx = NOTIFICATIONS_DB.findIndex(n => n.id === id);
  if (idx !== -1) {
    NOTIFICATIONS_DB.splice(idx, 1);
    toast('Đã xóa thông báo khỏi hòm thư!', 'info');
    renderTopbar();
    if (CUR_PAGE === 'notifications') {
      renderPageContent('notifications');
    }
  }
}

export function markAllNotificationsAsRead() {
  let count = 0;
  NOTIFICATIONS_DB.forEach(n => {
    if ((!n.userId || n.userId === SESSION.id || n.userId === 'all') && n.unread) {
      n.unread = false;
      count++;
    }
  });
  if (count > 0) {
    toast(`Đã đánh dấu ${count} thông báo là đã đọc thành công!`, 'success');
  } else {
    toast('Bạn không có thông báo chưa đọc nào.', 'info');
  }
  renderTopbar();
  if (CUR_PAGE === 'notifications') {
    renderPageContent('notifications');
  }
}

export function clearAllNotifications() {
  const beforeCount = NOTIFICATIONS_DB.length;
  for (let i = NOTIFICATIONS_DB.length - 1; i >= 0; i--) {
    const n = NOTIFICATIONS_DB[i];
    if (!n.userId || n.userId === SESSION.id || n.userId === 'all') {
      NOTIFICATIONS_DB.splice(i, 1);
    }
  }
  const cleared = beforeCount - NOTIFICATIONS_DB.length;
  toast(`Đã dọn dẹp sạch sẽ ${cleared} thông báo của bạn!`, 'info');
  renderTopbar();
  if (CUR_PAGE === 'notifications') {
    renderPageContent('notifications');
  }
}

export function triggerAuraAgentPipeline(leadObj) {
  if (!leadObj || !leadObj.value || leadObj.value <= 0) {
    return;
  }

  // Append keyframe animations safely
  const styleId = 'aura-agent-style';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.innerHTML = `
      @keyframes auraPulse {
        0%, 100% { transform: scale(1); box-shadow: 0 0 0px rgba(124, 58, 237, 0.4); }
        50% { transform: scale(1.06); box-shadow: 0 0 12px 4px rgba(124, 58, 237, 0.3); }
      }
    `;
    document.head.appendChild(s);
  }

  // Create overlay container
  const overlay = document.createElement('div');
  overlay.className = 'modal-bg animate-fadeIn';
  overlay.id = 'agent-automation-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  overlay.innerHTML = `
    <div class="panel shadow-2xl animate-scaleUp" style="width: 580px; max-width: 90%; background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
      <!-- Futuristic AI Header -->
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 20px; color: white; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="background: rgba(255,255,255,0.2); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; animation: auraPulse 2s infinite;">
            <i class="fa-solid fa-robot" style="font-size: 20px;"></i>
          </div>
          <div>
            <h3 style="font-family: var(--fd); font-size: 16px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">AURA CO-PILOT AGENT</h3>
            <span style="font-size: 10px; background: rgba(255,255,255,0.22); padding: 1px 6px; border-radius: 10px; font-weight: 700; text-transform: uppercase;">Mô hình Tác vụ Liên thông Tự động</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 12px; font-family: var(--fm); background: rgba(255,255,255,0.15); padding: 3px 10px; border-radius: 6px;">Trị giá ròng: <strong style="color:#10b981;">${fmtVND(leadObj.value)}</strong></span>
        </div>
      </div>

      <!-- Lead Summary Information -->
      <div style="background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: var(--n600); display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px;">
        <div>👤 Khách hàng: <strong class="text-gray-800">${esc(leadObj.name)}</strong></div>
        <div>📞 Điện thoại: <strong class="text-gray-800">${esc(leadObj.phone)}</strong></div>
        <div>🏷️ Mô hình: <strong class="text-indigo-600 font-bold">${leadObj.leadType === 'b2c' ? 'B2C Cá Nhân Lẻ' : 'B2B Doanh Nghiệp'}</strong></div>
      </div>

      <!-- Dynamic Timeline Tasks with Statuses -->
      <div style="padding: 22px; display: flex; flex-direction: column; gap: 16px;" id="agent-steps-container">
        <!-- Step 1 -->
        <div style="display: flex; gap: 14px; align-items: flex-start; opacity: 0.4; transition: all 0.3s;" id="agent-step-1">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:11px; color:#64748b; font-weight:bold; flex-shrink:0;" class="step-ico">
            1
          </div>
          <div style="flex-grow:1;">
            <div style="font-weight: 700; font-size: 13px;" class="step-title text-gray-700">Chuyển đổi phễu & Hoạch định Deal đàm phán</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;" class="step-desc">Đang chuẩn bị điều hướng...</div>
          </div>
        </div>

        <!-- Step 2 -->
        <div style="display: flex; gap: 14px; align-items: flex-start; opacity: 0.4; transition: all 0.3s;" id="agent-step-2">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:11px; color:#64748b; font-weight:bold; flex-shrink:0;" class="step-ico">
            2
          </div>
          <div style="flex-grow:1;">
            <div style="font-weight: 700; font-size: 13px;" class="step-title text-gray-700">Tự động soạn thảo & Đăng ký Báo giá (Quotation)</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;" class="step-desc">Đang chờ tín hiệu liên kết...</div>
          </div>
        </div>

        <!-- Step 3 -->
        <div style="display: flex; gap: 14px; align-items: flex-start; opacity: 0.4; transition: all 0.3s;" id="agent-step-3">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:11px; color:#64748b; font-weight:bold; flex-shrink:0;" class="step-ico">
            3
          </div>
          <div style="flex-grow:1;">
            <div style="font-weight: 700; font-size: 13px;" class="step-title text-gray-700">Ghi nhận sổ sách kế toán & Phát hành Hóa đơn VAT (Ledger Invoice)</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;" class="step-desc">Đang chờ đối chiếu dòng tiền...</div>
          </div>
        </div>

        <!-- Step 4 -->
        <div style="display: flex; gap: 14px; align-items: flex-start; opacity: 0.4; transition: all 0.3s;" id="agent-step-4">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display:flex; align-items:center; justify-content:center; font-size:11px; color:#64748b; font-weight:bold; flex-shrink:0;" class="step-ico">
            4
          </div>
          <div style="flex-grow:1;">
            <div style="font-weight: 700; font-size: 13px;" class="step-title text-gray-700">Bàn giao chỉ thị & Đồng bộ thông báo đẩy đa luồng</div>
            <div style="font-size: 11.5px; color: #64748b; margin-top: 2px;" class="step-desc">Đang đợi hoàn tất chuỗi...</div>
          </div>
        </div>
      </div>

      <!-- Real-time Agentic Console Log -->
      <div style="background: #0f172a; margin: 0 24px; padding: 12px 16px; border-radius: 8px; font-family: var(--fm); font-size: 10.5px; color: #34d399; max-height: 100px; min-height: 80px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;" id="agent-console-log">
        <div style="color: #64748b;">[Aura Agent Core] Sẵn sàng kích hoạt phễu tự động hóa liên thông...</div>
      </div>

      <!-- Footer Buttons -->
      <div style="padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 8px; background: #f8fafc;">
        <button class="btn bl" id="agent-close-btn" disabled style="opacity: 0.5; font-size: 12px; font-weight: 700; padding: 8px 14px;"><i class="fa-solid fa-xmark"></i> Đóng</button>
        <button class="btn pr" id="agent-redirect-pipeline-btn" disabled style="opacity: 0.5; font-size: 12px; font-weight: 700; padding: 8px 14px;"><i class="fa-solid fa-arrow-right-to-bracket"></i> Tới Pipeline Kanban</button>
        <button class="btn gr" id="agent-redirect-invoice-btn" disabled style="opacity: 0.5; font-size: 12px; font-weight: 700; padding: 8px 14px;"><i class="fa-solid fa-file-invoice-dollar"></i> Sổ Hóa Đơn</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Helper to add console log entries
  const addLog = (text, type = 'info') => {
    const consoleBox = document.getElementById('agent-console-log');
    if (!consoleBox) return;
    const logDiv = document.createElement('div');
    if (type === 'success') logDiv.style.color = '#34d399';
    else if (type === 'warning') logDiv.style.color = '#fbbf24';
    else if (type === 'error') logDiv.style.color = '#f87171';
    else logDiv.style.color = '#38bdf8';
    
    logDiv.innerHTML = `[${new Date().toLocaleTimeString('vi-VN')}] ${esc(text)}`;
    consoleBox.appendChild(logDiv);
    consoleBox.scrollTop = consoleBox.scrollHeight;
  };

  // Run Step-by-Step Simulation Animation and Execution
  const processPipeline = async () => {
    const ownerId = leadObj.ownerId || SESSION?.id || 'usr-sales';
    const salesRepName = USERS_DB.find(u => u.id === ownerId)?.name || 'Trần Sơn Sales';

    // --- STEP 1 ---
    await new Promise(resolve => setTimeout(resolve, 600));
    const step1El = document.getElementById('agent-step-1');
    step1El.style.opacity = '1';
    step1El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i>';
    step1El.querySelector('.step-ico').style.background = '#e0e7ff';
    addLog(`Đang khởi hoạt sàng lọc & phân tích thông tin gói hàng...`);

    await new Promise(resolve => setTimeout(resolve, 800));
    const newDealId = uid('dea-auto');
    const newDeal = {
      id: newDealId,
      name: `Tư vấn Gói Giải pháp Cá Nhân ${leadObj.name}`,
      contactId: `con-auto-${Date.now()}`,
      contactName: leadObj.name,
      companyId: `cmp-auto-${Date.now()}`,
      companyName: leadObj.company || `${leadObj.name} (Khách lẻ)`,
      value: leadObj.value,
      stage: 'negotiation', // Moving directly to negotiation (đàm phán thương thảo deals) stage as requested!
      probability: 60,
      ownerId: ownerId,
      expectedClose: '30/08/2026',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastActivity: new Date().toLocaleDateString('vi-VN'),
      dealType: leadObj.leadType || 'b2c'
    };
    DEALS_DB.unshift(newDeal);
    writeAuditLog(`[Bán Agent] Thăng cấp và phân luồng Deal đàm phán thành công cho ${newDeal.name}`, 'Deals Collection');

    step1El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
    step1El.querySelector('.step-ico').style.background = '#d1fae5';
    step1El.querySelector('.step-title').className = 'font-bold text-gray-900';
    step1El.querySelector('.step-desc').innerHTML = `Đã xúc tiến thành công! Khởi tạo Deal: <strong class="text-indigo-600">"${newDeal.name}"</strong>, gán sang stage: <span class="chip gy font-bold">Thương Thấu đàm phán</span>.`;
    addLog(`Đã thăng cấp sang Pipeline Đàm phán (Probability: 60%). ID ${newDealId}`, 'success');

    // --- STEP 2 ---
    await new Promise(resolve => setTimeout(resolve, 600));
    const step2El = document.getElementById('agent-step-2');
    step2El.style.opacity = '1';
    step2El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i>';
    step2El.querySelector('.step-ico').style.background = '#e0e7ff';
    addLog(`Lọc sản phẩm hệ thống tương thích, dự phòng soạn thảo biểu mẫu báo giá...`);

    await new Promise(resolve => setTimeout(resolve, 800));
    const newQuoteId = uid('qte-auto');
    const newQuoteNumber = `BG-AG-${Date.now().toString().slice(-4)}`;
    const subtotal = leadObj.value;
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;
    
    // Add quotation
    const newQuote = {
      id: newQuoteId,
      number: newQuoteNumber,
      contactId: newDeal.contactId,
      contactName: newDeal.contactName,
      dealId: newDeal.id,
      items: [
        { id: 'prod-auto', name: 'Bản Quyền Hệ Thống Tích Hợp Aura CRM Personal B2C', price: subtotal, qty: 1, desc: 'Dịch vụ phân phối số hóa quy trình và chăm sóc khách hàng lẻ tự động.' }
      ],
      subtotal,
      vat,
      total,
      status: 'chap_nhan', // Autoconfirmed approved!
      createdAt: new Date().toLocaleDateString('vi-VN'),
      validUntil: '30/10/2026',
      ownerId: ownerId,
      terms: "Thanh toán chuyển khoản 100% tài chính doanh nghiệp khi kích hoạt đại lý.",
      notes: "Báo giá thiết lập tự động hóa theo chuẩn chiến dịch B2C."
    };
    QUOTES_DB.unshift(newQuote);
    writeAuditLog(`[Bán Agent] Khởi tạo hồ sơ Đăng ký báo giá tự động ${newQuoteNumber}`, 'Quotations Collection');

    step2El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
    step2El.querySelector('.step-ico').style.background = '#d1fae5';
    step2El.querySelector('.step-title').className = 'font-bold text-gray-900';
    step2El.querySelector('.step-desc').innerHTML = `Đã lập & đăng ký Báo giá: <strong class="text-indigo-600">${newQuoteNumber}</strong>. Trạng thái: <span class="chip gr font-bold">Chấp nhận / Phê duyệt</span>.`;
    addLog(`Khởi sinh Đăng ký Báo giá thành công: ${newQuoteNumber} (Ròng: ${fmtVND(subtotal)}).`, 'success');

    // --- STEP 3 ---
    await new Promise(resolve => setTimeout(resolve, 600));
    const step3El = document.getElementById('agent-step-3');
    step3El.style.opacity = '1';
    step3El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i>';
    step3El.querySelector('.step-ico').style.background = '#e0e7ff';
    addLog(`Vận hành đối soát kế toán tài vụ, cập nhật nợ nần & xuất sổ sách...`);

    await new Promise(resolve => setTimeout(resolve, 800));
    const newInvoiceId = uid('inv-auto');
    const newInvoiceNumber = `HD-AG-${Date.now().toString().slice(-4)}`;
    
    // Add Invoice
    const newInvoice = {
      id: newInvoiceId,
      number: newInvoiceNumber,
      quoteId: newQuoteNumber,
      contactId: newDeal.contactId,
      contactName: newDeal.contactName,
      items: [
        { id: 'prod-auto', name: 'Bản Quyền Hệ Thống Tích Hợp Aura CRM Personal B2C', price: subtotal, qty: 1 }
      ],
      total: total,
      status: 'partial', // Overdue / partial
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      notes: "Phát hành hóa đơn đỏ tự động tích hợp Aura Ledger quyết toán"
    };
    INVOICES_DB.unshift(newInvoice);
    writeAuditLog(`[Bán Agent] Định sổ kế toán tài vụ và phát hành hóa đơn đỏ số ${newInvoiceNumber}`, 'Invoices Collection');

    step3El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
    step3El.querySelector('.step-ico').style.background = '#d1fae5';
    step3El.querySelector('.step-title').className = 'font-bold text-gray-900';
    step3El.querySelector('.step-desc').innerHTML = `Ghi nhận sổ sách hoàn tất! Mã hóa đơn: <strong class="text-indigo-600">${newInvoiceNumber}</strong> (Cộng VAT 10%: ${fmtVND(total)}). Trạng thái: <span class="chip gy font-bold">Chờ thanh khoản</span>.`;
    addLog(`Cập nhật thành công sổ sách hóa đơn: ${newInvoiceNumber} (Trị giá thanh khoản: ${fmtVND(total)}).`, 'success');

    // --- STEP 4 ---
    await new Promise(resolve => setTimeout(resolve, 600));
    const step4El = document.getElementById('agent-step-4');
    step4El.style.opacity = '1';
    step4El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-spinner fa-spin text-indigo-500"></i>';
    step4El.querySelector('.step-ico').style.background = '#e0e7ff';
    addLog(`Ủy thác đầu việc và thông báo cho nhân viên thụ hưởng...`);

    await new Promise(resolve => setTimeout(resolve, 600));
    // Post notifications
    NOTIFICATIONS_DB.unshift({
      id: `notif-auto-${Date.now()}`,
      userId: ownerId,
      unread: true,
      title: '🤖 [AURA CO-PILOT] THĂNG HOÁ LUỒNG PHỄU SÂU B2C',
      content: `Aura Co-Pilot vừa tự động thăng cấp bốc xếp Lead B2C "${leadObj.name}" thành Deal đàm phán "${newDeal.name}", đăng ký báo giá ${newQuoteNumber} sổ sách và phát hành Hóa đơn quyết toán nợ nần ${newInvoiceNumber}. Vui lòng đôn đốc giải pháp!`,
      time: 'Vừa xong',
      user: 'Aura AI Agent'
    });

    step4El.querySelector('.step-ico').innerHTML = '<i class="fa-solid fa-circle-check text-emerald-500"></i>';
    step4El.querySelector('.step-ico').style.background = '#d1fae5';
    step4El.querySelector('.step-title').className = 'font-bold text-gray-900';
    step4El.querySelector('.step-desc').innerHTML = `Đã gửi báo cáo tức thời đa kênh thành công! Sales Rep <strong>${salesRepName}</strong> đã nạp thông báo.`;
    addLog(`Lưu chuyển thông tin và dọn dẹp các tiến trình đệm thành công!`, 'warning');
    addLog(`[AURA AGENT] LUỒNG BÁN AGENT TỰ ĐỘNG KHÉO ĐÃ HOÀN TẤT ĐỒNG BỘ 100%!`, 'success');

    toast('🤖 Đã hoàn tất 100% luồng liên thông Bán Agent liên kết: Deal, Báo giá & Hóa đơn!', 'success');

    // Enable button states
    const closeBtn = document.getElementById('agent-close-btn');
    const dealBtn = document.getElementById('agent-redirect-pipeline-btn');
    const invBtn = document.getElementById('agent-redirect-invoice-btn');

    if (closeBtn) { closeBtn.disabled = false; closeBtn.style.opacity = '1'; }
    if (dealBtn) { dealBtn.disabled = false; dealBtn.style.opacity = '1'; }
    if (invBtn) { invBtn.disabled = false; invBtn.style.opacity = '1'; }

    // Redirect click handlers
    closeBtn?.addEventListener('click', () => {
      overlay.remove();
      renderTopbar();
      renderPageContent(CUR_PAGE);
    });

    dealBtn?.addEventListener('click', () => {
      overlay.remove();
      go('pipeline');
    });

    invBtn?.addEventListener('click', () => {
      overlay.remove();
      go('invoices');
    });
  };

  processPipeline();
}

export function setupMcnaFunnelEvents() {
  if (typeof window.crmApp !== 'undefined') {
    window.crmApp.downloadMultiSheetExcel = downloadMultiSheetExcel;
    window.crmApp.simSubmitCaptureForm = simSubmitCaptureForm;
    window.crmApp.simBankWebhookCallback = simBankWebhookCallback;
    window.crmApp.moveDealNextStage = moveDealNextStage;
    window.crmApp.updateDealStageDirectly = updateDealStageDirectly;
    window.crmApp.simRunEndToEndFlow = simRunEndToEndFlow;
    window.crmApp.markNotifAsRead = markNotifAsRead;
    window.crmApp.deleteNotif = deleteNotif;
    window.crmApp.markAllNotificationsAsRead = markAllNotificationsAsRead;
    window.crmApp.clearAllNotifications = clearAllNotifications;
    window.crmApp.triggerAuraAgentPipeline = triggerAuraAgentPipeline;
  }
}

/* ==========================================================================
   CRM PIPELINE v1.0 (BA doc): LEAD->CUSTOMER MIRROR, ASSIGNMENT EMAIL,
   CALL KPI TRACKING & ANTI-FAKE-CALL CONTROLS
   ========================================================================== */

const KPI_DEFAULT_DAILY_CALLS = 100;
const CALL_MIN_DURATION_SEC = 20;     // outcome can't be logged before this
const CALL_DUP_WINDOW_MIN = 5;        // same number can't be re-logged within
const CALL_HOURLY_ANOMALY_LIMIT = 30; // beyond this calls get flagged
const CALL_FAIL_REASONS = ['Không nghe máy', 'Thuê bao / khóa máy', 'Sai số điện thoại', 'Từ chối trao đổi', 'Hẹn gọi lại sau', 'Khác (ghi rõ ở ghi chú)'];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function cleanPhone(p) { return String(p || '').replace(/[\s\-\.]/g, ''); }
function repNotifyEmail(rep) { return String(rep.notifyEmail || rep.email || '').trim(); }
function repKpiTarget(rep) { return Number(rep.kpiDailyCalls) || KPI_DEFAULT_DAILY_CALLS; }
function nowVN() { return new Date().toLocaleString('vi-VN'); }

// ---- 1) Pipeline T1: mirror every new lead into the customer database ----
function ensureCustomerFromLead(lead) {
  const phoneKey = cleanPhone(lead.phone);
  let companyId = null;

  if (lead.leadType === 'b2b' && lead.company && lead.company !== 'Khách hàng cá nhân') {
    let comp = COMPANIES_DB.find(c => (c.name || '').toLowerCase() === lead.company.toLowerCase());
    if (!comp) {
      comp = {
        id: uid('cmp'), name: lead.company, industry: 'Chưa phân loại', size: '10-50 nhân sự',
        website: '', phone: lead.phone, address: '', contactsCount: 1, dealsCount: 0, revenue: 0,
        ownerId: lead.ownerId, notes: `Tự sinh từ Lead "${lead.name}" theo pipeline T1 (Tiếp nhận).`
      };
      COMPANIES_DB.unshift(comp);
    }
    companyId = comp.id;
  }

  const existed = CONTACTS_DB.find(c =>
    cleanPhone(c.phone) === phoneKey ||
    (lead.email && c.email && c.email.toLowerCase() === lead.email.toLowerCase())
  );
  if (existed) return existed;

  const words = String(lead.name || '').trim().split(/\s+/);
  const contact = {
    id: uid('con'),
    firstName: words[words.length - 1] || lead.name,
    lastName: words[0] || '',
    fullName: lead.name,
    title: lead.leadType === 'b2b' ? 'Đại diện doanh nghiệp' : 'Khách tiêu dùng cá nhân',
    companyId,
    companyName: lead.leadType === 'b2b' ? (lead.company || '') : '',
    phone: lead.phone,
    email: lead.email || '',
    source: lead.source,
    ownerId: lead.ownerId,
    tags: 'Từ-Lead-Mới',
    dealsCount: 0,
    lastActivity: new Date().toLocaleDateString('vi-VN'),
    createdAt: new Date().toLocaleDateString('vi-VN'),
    notes: `Khởi tạo tự động từ Lead mới theo pipeline T1 (nguồn: ${lead.source}).`
  };
  CONTACTS_DB.unshift(contact);
  writeAuditLog(`Pipeline T1: Tự sinh hồ sơ khách hàng "${lead.name}" (${lead.leadType?.toUpperCase() || 'B2C'}) từ Lead mới`, 'Contacts Collection');
  return contact;
}

// ---- 2) Assignment email: parameterized per-rep address, full outbox audit ----
async function dispatchAssignmentEmail(lead) {
  const rep = USERS_DB.find(u => u.id === lead.ownerId);
  if (!rep) return;
  const toEmail = repNotifyEmail(rep);

  const mail = {
    id: uid('mail'),
    toEmail,
    toName: rep.name,
    subject: `🔥 [MCNA CRM] Bạn được giao Lead mới: ${lead.name} (${lead.phone})`,
    body: `Chào ${rep.name},\n\nBạn vừa được phân công một Lead mới trên hệ thống MCNA CRM:\n\n• Khách hàng: ${lead.name}\n• SĐT: ${lead.phone}\n• Email: ${lead.email || '(không có)'}\n• Nguồn: ${lead.source}\n• Phân loại: ${(lead.leadType || 'b2c').toUpperCase()} | Ưu tiên: ${(lead.priority || 'warm').toUpperCase()}\n• Giá trị dự kiến: ${Number(lead.value || 0).toLocaleString('vi-VN')} ₫\n• Hạn xử lý: ${lead.deadline || 'sớm nhất có thể'}\n\nVui lòng đăng nhập CRM và liên hệ khách hàng ngay: ${typeof location !== 'undefined' ? location.origin : ''}\n\n— MCNA CRM (email tự động, không trả lời thư này)`,
    relatedType: 'lead',
    relatedId: lead.id,
    status: 'pending',
    error: '',
    createdAt: nowVN(),
    sentAt: ''
  };
  EMAIL_OUTBOX_DB.unshift(mail);

  if (!toEmail) {
    mail.status = 'skipped';
    mail.error = 'Nhân sự chưa có email nhận thông báo (cấu hình tại trang KPI Cuộc Gọi)';
    return;
  }

  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, toName: rep.name, subject: mail.subject, text: mail.body })
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.sent) {
      mail.status = 'sent';
      mail.sentAt = nowVN();
      toast(`📨 Đã gửi email giao việc tới ${rep.name} <${toEmail}>`, 'success');
    } else if (out.reason === 'smtp_not_configured') {
      mail.status = 'skipped';
      mail.error = 'Máy chủ chưa cấu hình SMTP - email được lưu vào hàng đợi outbox';
      toast(`📭 Email giao việc cho ${rep.name} đã vào hàng đợi (chưa cấu hình SMTP).`, 'warning');
    } else {
      mail.status = 'failed';
      mail.error = out.error || `HTTP ${res.status}`;
      toast(`⚠️ Gửi email giao việc thất bại: ${mail.error}`, 'error');
    }
  } catch (e) {
    mail.status = 'failed';
    mail.error = String(e?.message || e);
  }
  writeAuditLog(`Email giao Lead "${lead.name}" tới ${rep.name} <${toEmail || 'N/A'}> [${mail.status}]`, 'Email Outbox', mail.status === 'failed' ? 'bi_chan' : 'thanh_cong');
}

// ---- 3) Verified call sessions (anti-fake controls) ----
let ACTIVE_CALL = null;
let CALL_TICKER = null;

function myCallsWithin(repId, ms) {
  const cutoff = Date.now() - ms;
  return CALL_LOGS_DB.filter(c => c.repId === repId && Number(c.tsEnd || 0) > cutoff);
}

export function openCallSession(targetType, targetId) {
  if (!SESSION) return;
  const target = targetType === 'lead'
    ? LEADS_DB.find(x => x.id === targetId)
    : CONTACTS_DB.find(x => x.id === targetId);
  if (!target) { toast('Không tìm thấy khách hàng/lead để gọi!', 'error'); return; }

  const name = target.name || target.fullName;
  const phone = target.phone || '';

  // Anti-fake guard: re-calling the same number inside the dedup window is blocked
  const phoneKey = cleanPhone(phone);
  const recentDup = CALL_LOGS_DB.find(c =>
    c.repId === SESSION.id && cleanPhone(c.phone) === phoneKey &&
    (Date.now() - Number(c.tsEnd || 0)) < CALL_DUP_WINDOW_MIN * 60 * 1000
  );
  if (recentDup) {
    toast(`🔒 CHỐNG GỌI ẢO: Bạn vừa ghi nhận cuộc gọi tới số này chưa đầy ${CALL_DUP_WINDOW_MIN} phút trước. Không thể tạo phiên gọi trùng!`, 'error');
    writeAuditLog(`Chặn phiên gọi trùng lặp tới ${phone} (anti-fake)`, 'Call KPI Control', 'bi_chan');
    return;
  }

  ACTIVE_CALL = { targetType, targetId, targetName: name, phone, startTs: 0 };

  const contentHtml = `
    <div class="auth-body">
      <div class="panel" style="background:#eef2ff; border:1.5px dashed #6366f1; padding:12px; border-radius:8px; margin-bottom:12px;">
        <p style="font-size:12px; color:#4338ca; margin:0; line-height:1.6;">
          <i class="fa-solid fa-shield-halved"></i> <strong>Cơ chế chống cuộc gọi ảo:</strong>
          phiên gọi tính giờ thực, tối thiểu <strong>${CALL_MIN_DURATION_SEC} giây</strong> mới được ghi nhận;
          một số điện thoại chỉ ghi nhận 1 lần mỗi ${CALL_DUP_WINDOW_MIN} phút;
          KPI chỉ đếm <strong>khách hàng khác nhau</strong>; vượt ${CALL_HOURLY_ANOMALY_LIMIT} cuộc/giờ sẽ bị gắn cờ bất thường cho quản lý.
        </p>
      </div>
      <div class="fr2">
        <div class="fg"><label>Khách hàng</label><input type="text" readonly value="${esc(name)}" /></div>
        <div class="fg"><label>SĐT hệ thống (không sửa được)</label><input type="text" readonly class="tmono" value="${esc(phone)}" /></div>
      </div>
      <div style="text-align:center; margin:14px 0;">
        <a href="tel:${esc(phone)}" id="call-dial-btn" class="btn pr" style="font-size:15px; padding:10px 22px;" onclick="window.crmApp.beginDial()"><i class="fa-solid fa-phone-volume"></i> Bắt đầu cuộc gọi</a>
        <div id="call-timer-box" style="display:none; margin-top:10px; font-family:var(--fd); font-size:26px; font-weight:800; color:#4f46e5;">
          ⏱ <span id="call-timer">00:00</span>
        </div>
        <p id="call-min-hint" style="display:none; font-size:11px; color:var(--n500); margin-top:4px;">Cần tối thiểu ${CALL_MIN_DURATION_SEC} giây trước khi được ghi nhận kết quả…</p>
      </div>
      <div id="call-outcome-box" style="opacity:.45; pointer-events:none;">
        <div class="fg">
          <label>Kết quả tiếp cận *</label>
          <div style="display:flex; gap:14px; padding:6px 2px;">
            <label style="display:flex; align-items:center; gap:6px; font-weight:700; color:#059669; cursor:pointer;"><input type="radio" name="call-reach" value="yes" onchange="window.crmApp.onReachChange()"> ✅ Tiếp cận được</label>
            <label style="display:flex; align-items:center; gap:6px; font-weight:700; color:#dc2626; cursor:pointer;"><input type="radio" name="call-reach" value="no" onchange="window.crmApp.onReachChange()"> ❌ Không tiếp cận được</label>
          </div>
        </div>
        <div class="fg" id="call-reason-wrap" style="display:none;">
          <label>Lý do không tiếp cận được * (bắt buộc)</label>
          <select id="call-fail-reason">${CALL_FAIL_REASONS.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join('')}</select>
        </div>
        <div class="fg">
          <label>Ghi chú cuộc gọi</label>
          <textarea id="call-note" rows="2" placeholder="Nội dung trao đổi, cam kết tiếp theo..."></textarea>
        </div>
      </div>
    </div>
  `;
  const footerHtml = `
    <button class="btn bl" onclick="window.crmApp.cancelCallSession()">Hủy phiên</button>
    <button class="btn pr" id="call-finish-btn" disabled onclick="window.crmApp.submitCallOutcome()"><i class="fa-solid fa-circle-check"></i> Kết thúc & Ghi nhận KPI</button>
  `;
  openModalElement(`📞 PHIÊN GỌI KHÁCH HÀNG CÓ KIỂM CHỨNG`, contentHtml, footerHtml);
}

export function beginDial() {
  if (!ACTIVE_CALL || ACTIVE_CALL.startTs) return;
  ACTIVE_CALL.startTs = Date.now();
  const dialBtn = document.getElementById('call-dial-btn');
  if (dialBtn) { dialBtn.style.opacity = '.5'; dialBtn.style.pointerEvents = 'none'; dialBtn.innerHTML = '<i class="fa-solid fa-phone"></i> Đang gọi…'; }
  document.getElementById('call-timer-box')?.style.setProperty('display', 'block');
  document.getElementById('call-min-hint')?.style.setProperty('display', 'block');

  CALL_TICKER = setInterval(() => {
    const el = document.getElementById('call-timer');
    if (!el || !ACTIVE_CALL) { clearInterval(CALL_TICKER); return; }
    const sec = Math.floor((Date.now() - ACTIVE_CALL.startTs) / 1000);
    el.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    if (sec >= CALL_MIN_DURATION_SEC) {
      const box = document.getElementById('call-outcome-box');
      if (box) { box.style.opacity = '1'; box.style.pointerEvents = 'auto'; }
      const fin = document.getElementById('call-finish-btn');
      if (fin) fin.disabled = false;
      const hint = document.getElementById('call-min-hint');
      if (hint) hint.textContent = 'Đã đủ thời lượng tối thiểu - hãy chọn kết quả tiếp cận để ghi nhận.';
    }
  }, 1000);
}

export function onReachChange() {
  const v = document.querySelector('input[name="call-reach"]:checked')?.value;
  const wrap = document.getElementById('call-reason-wrap');
  if (wrap) wrap.style.display = v === 'no' ? 'block' : 'none';
}

export function cancelCallSession() {
  clearInterval(CALL_TICKER);
  ACTIVE_CALL = null;
  closeActiveModal();
}

export function submitCallOutcome() {
  if (!ACTIVE_CALL || !ACTIVE_CALL.startTs) { toast('Bạn chưa bắt đầu cuộc gọi!', 'error'); return; }
  const durationSec = Math.floor((Date.now() - ACTIVE_CALL.startTs) / 1000);
  if (durationSec < CALL_MIN_DURATION_SEC) {
    toast(`🔒 CHỐNG GỌI ẢO: Cuộc gọi mới ${durationSec}s, chưa đạt tối thiểu ${CALL_MIN_DURATION_SEC}s!`, 'error');
    return;
  }
  const reachVal = document.querySelector('input[name="call-reach"]:checked')?.value;
  if (!reachVal) { toast('Hãy chọn kết quả: Tiếp cận được / Không tiếp cận được!', 'error'); return; }
  const reached = reachVal === 'yes';
  const failReason = reached ? '' : (document.getElementById('call-fail-reason')?.value || '');
  if (!reached && !failReason) { toast('Bắt buộc chọn lý do khi không tiếp cận được khách hàng!', 'error'); return; }
  const note = document.getElementById('call-note')?.value || '';

  // Velocity anomaly: too many calls in the last hour gets flagged for managers
  const lastHour = myCallsWithin(SESSION.id, 60 * 60 * 1000);
  const flagged = lastHour.length + 1 > CALL_HOURLY_ANOMALY_LIMIT;

  const log = {
    id: uid('call'),
    repId: SESSION.id,
    repName: SESSION.name,
    targetType: ACTIVE_CALL.targetType,
    targetId: ACTIVE_CALL.targetId,
    targetName: ACTIVE_CALL.targetName,
    phone: ACTIVE_CALL.phone,
    startedAt: new Date(ACTIVE_CALL.startTs).toLocaleString('vi-VN'),
    endedAt: nowVN(),
    durationSec,
    reached,
    failReason,
    note,
    dateKey: todayKey(),
    flagged,
    tsEnd: Date.now()
  };
  CALL_LOGS_DB.unshift(log);

  // Mirror into the activity timeline so deal workflow checks (TC-011) see it
  ACTIVITIES_DB.unshift({
    id: uid('act'),
    type: 'call',
    title: `📞 Cuộc gọi KPI với ${ACTIVE_CALL.targetName}`,
    contactId: ACTIVE_CALL.targetType === 'contact' ? ACTIVE_CALL.targetId : '',
    dealId: '',
    ownerId: SESSION.id,
    datetime: nowVN(),
    duration: `${durationSec} giây`,
    outcome: reached ? 'Tiếp cận thành công' : `Không tiếp cận: ${failReason}`,
    notes: note,
    direction: 'outbound',
    user: SESSION.name
  });

  // Reached lead advances in the funnel: new -> contacting
  if (reached && ACTIVE_CALL.targetType === 'lead') {
    const lead = LEADS_DB.find(l => l.id === ACTIVE_CALL.targetId);
    if (lead && (lead.status === 'new' || lead.status === 'pending_assignment')) lead.status = 'contacting';
  }

  if (flagged) {
    NOTIFICATIONS_DB.unshift({
      id: uid('ntf'), type: 'system', unread: true, time: 'Vừa xong',
      title: '🚨 CẢNH BÁO KPI BẤT THƯỜNG',
      body: `Sales ${SESSION.name} vượt ${CALL_HOURLY_ANOMALY_LIMIT} cuộc gọi/giờ - cuộc gọi bị gắn cờ chờ quản lý xác minh.`
    });
    writeAuditLog(`KPI Anomaly: ${SESSION.name} vượt ngưỡng ${CALL_HOURLY_ANOMALY_LIMIT} cuộc/giờ`, 'Call KPI Control', 'bi_chan');
    toast('🚨 Cuộc gọi được ghi nhận nhưng BỊ GẮN CỜ bất thường (quá nhiều cuộc/giờ)!', 'warning');
  } else {
    toast(reached
      ? `✅ Ghi nhận tiếp cận thành công ${ACTIVE_CALL.targetName} (${durationSec}s) vào KPI!`
      : `📵 Đã ghi nhận KHÔNG tiếp cận được (${failReason}).`, reached ? 'success' : 'info');
  }
  writeAuditLog(`Ghi nhận cuộc gọi ${durationSec}s tới ${ACTIVE_CALL.targetName} [${reached ? 'TIẾP CẬN ĐƯỢC' : 'THẤT BẠI: ' + failReason}]`, 'Call KPI Log');

  clearInterval(CALL_TICKER);
  ACTIVE_CALL = null;
  closeActiveModal();
  if (CUR_PAGE === 'kpi-calls') renderPageContent('kpi-calls');
}

// ---- Privacy vault: controlled reveal of masked customer channels ----
export function revealSecuredField(kind, recId, field) {
  const rec = kind === 'lead' ? LEADS_DB.find(x => x.id === recId) : CONTACTS_DB.find(x => x.id === recId);
  if (!rec || !SESSION) return;
  const allowed = SESSION.role === 'superadmin' || SESSION.role === 'manager' || SESSION.id === rec.ownerId;
  const custName = rec.name || rec.fullName || recId;
  if (!allowed) {
    toast('🔒 Chỉ Sales phụ trách hoặc Quản lý mới được giải mã thông tin khách hàng!', 'error');
    writeAuditLog(`TỪ CHỐI giải mã ${field === 'phone' ? 'SĐT' : 'Email'} của khách "${custName}" (không có quyền)`, 'Privacy Vault', 'bi_chan');
    return;
  }
  const input = document.getElementById(`sec-${kind}-${field}`);
  if (input) input.value = (field === 'phone' ? rec.phone : rec.email) || '(trống)';
  writeAuditLog(`GIẢI MÃ ${field === 'phone' ? 'SĐT' : 'Email'} khách hàng "${custName}"`, 'Privacy Vault');
  toast('👁 Đã giải mã. Lượt truy cập này được ghi vào Audit Log.', 'info');
}

// ---- Marketer -> Sales direct email dispatch ----
export async function sendMarketerEmail() {
  const repId = document.getElementById('mkt-mail-rep')?.value;
  const subject = (document.getElementById('mkt-mail-subject')?.value || '').trim();
  const body = (document.getElementById('mkt-mail-body')?.value || '').trim();
  const rep = USERS_DB.find(u => u.id === repId);
  if (!rep) { toast('Hãy chọn Sales nhận email!', 'error'); return; }
  if (!subject || !body) { toast('Vui lòng nhập đầy đủ tiêu đề và nội dung email!', 'error'); return; }
  const toEmail = repNotifyEmail(rep);
  if (!toEmail) { toast(`${rep.name} chưa có email nhận thông báo - bấm ✉️ ở bảng dưới để cấu hình trước!`, 'error'); return; }

  const btn = document.getElementById('mkt-mail-send-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang gửi…'; }

  const mail = {
    id: uid('mail'),
    toEmail, toName: rep.name,
    subject: `📣 [MCNA CRM] ${subject}`,
    body: `Chào ${rep.name},\n\n${body}\n\n— Gửi bởi ${SESSION.name} (${SESSION.role === 'manager' ? 'Marketer' : 'Quản trị'}) qua MCNA CRM`,
    relatedType: 'marketer_direct', relatedId: SESSION.id,
    status: 'pending', error: '', createdAt: nowVN(), sentAt: ''
  };
  EMAIL_OUTBOX_DB.unshift(mail);
  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: toEmail, toName: rep.name, subject: mail.subject, text: mail.body })
    });
    const out = await res.json().catch(() => ({}));
    if (res.ok && out.sent) {
      mail.status = 'sent'; mail.sentAt = nowVN();
      toast(`📨 Đã gửi email tới ${rep.name} <${toEmail}>`, 'success');
    } else if (out.reason === 'smtp_not_configured') {
      mail.status = 'skipped'; mail.error = 'Máy chủ chưa cấu hình SMTP';
      toast('📭 Email vào hàng đợi (chưa cấu hình SMTP).', 'warning');
    } else {
      mail.status = 'failed'; mail.error = out.error || `HTTP ${res.status}`;
      toast(`⚠️ Gửi email thất bại: ${mail.error}`, 'error');
    }
  } catch (e) {
    mail.status = 'failed'; mail.error = String(e?.message || e);
    toast(`⚠️ Gửi email thất bại: ${mail.error}`, 'error');
  }
  writeAuditLog(`Marketer gửi email trực tiếp tới ${rep.name} <${toEmail}>: "${subject}" [${mail.status}]`, 'Email Outbox', mail.status === 'failed' ? 'bi_chan' : 'thanh_cong');
  if (CUR_PAGE === 'kpi-calls') renderPageContent('kpi-calls');
}

// ---- 4) Per-rep parameterized settings (NO hardcoded emails) ----
export function editRepNotifyEmail(repId) {
  const rep = USERS_DB.find(u => u.id === repId);
  if (!rep) return;
  const v = prompt(`Email nhận thông báo giao việc của ${rep.name}:`, repNotifyEmail(rep));
  if (v === null) return;
  if (v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) { toast('Email không hợp lệ!', 'error'); return; }
  rep.notifyEmail = v.trim();
  writeAuditLog(`Cập nhật email nhận thông báo của ${rep.name} thành <${rep.notifyEmail || '(trống)'}>`, 'Users');
  toast(`Đã lưu email nhận thông báo cho ${rep.name}. Thay đổi tự đồng bộ lên Supabase.`, 'success');
  if (CUR_PAGE === 'kpi-calls') renderPageContent('kpi-calls');
}

export function editRepKpiTarget(repId) {
  const rep = USERS_DB.find(u => u.id === repId);
  if (!rep) return;
  const v = prompt(`Chỉ tiêu cuộc gọi/ngày của ${rep.name}:`, String(repKpiTarget(rep)));
  if (v === null) return;
  const n = parseInt(v, 10);
  if (!n || n < 1) { toast('Chỉ tiêu phải là số nguyên dương!', 'error'); return; }
  rep.kpiDailyCalls = n;
  writeAuditLog(`Cập nhật KPI cuộc gọi/ngày của ${rep.name} = ${n}`, 'Users');
  toast(`Đã đặt KPI ${n} cuộc gọi/ngày cho ${rep.name}.`, 'success');
  if (CUR_PAGE === 'kpi-calls') renderPageContent('kpi-calls');
}

// ---- 5) KPI page ----
function repDayStats(repId) {
  const tk = todayKey();
  const logs = CALL_LOGS_DB.filter(c => c.repId === repId && c.dateKey === tk);
  const distinct = new Set(logs.map(c => cleanPhone(c.phone))).size;
  const reached = logs.filter(c => c.reached).length;
  const flaggedN = logs.filter(c => c.flagged).length;
  const avgDur = logs.length ? Math.round(logs.reduce((s, c) => s + Number(c.durationSec || 0), 0) / logs.length) : 0;
  return { logs, total: logs.length, distinct, reached, notReached: logs.length - reached, flaggedN, avgDur };
}

function renderKpiCallsPage() {
  const isMgmt = SESSION.role === 'superadmin' || SESSION.role === 'manager';
  const isSales = SESSION.role === 'sales';
  let html = `<div class="page-container animate-fadeIn">`;

  // Personal block for sales reps
  if (isSales) {
    const st = repDayStats(SESSION.id);
    const target = repKpiTarget(SESSION);
    const pct = Math.min(100, Math.round((st.distinct / target) * 100));
    const myLeads = LEADS_DB.filter(l => l.ownerId === SESSION.id && l.status !== 'lost');
    const myContacts = CONTACTS_DB.filter(c => c.ownerId === SESSION.id);
    html += `
      <div class="panel" style="padding:18px; margin-bottom:14px;">
        <h3 style="font-family:var(--fd); font-weight:800; margin:0 0 4px 0;">🎯 KPI của tôi hôm nay (${todayKey()})</h3>
        <p style="font-size:12px; color:var(--n500); margin:0 0 12px 0;">Chỉ tiêu: gọi <strong>${target} khách hàng khác nhau/ngày</strong>. Chỉ cuộc gọi có kiểm chứng (≥${CALL_MIN_DURATION_SEC}s, không trùng số trong ${CALL_DUP_WINDOW_MIN} phút) mới được tính.</p>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px,1fr)); gap:10px; margin-bottom:12px;">
          <div class="panel" style="padding:10px; text-align:center; background:#eef2ff;"><div style="font-size:22px; font-weight:800; color:#4f46e5;">${st.distinct}/${target}</div><div style="font-size:11px; color:var(--n500);">KH đã gọi (KPI)</div></div>
          <div class="panel" style="padding:10px; text-align:center;"><div style="font-size:22px; font-weight:800;">${st.total}</div><div style="font-size:11px; color:var(--n500);">Tổng cuộc gọi</div></div>
          <div class="panel" style="padding:10px; text-align:center; background:#ecfdf5;"><div style="font-size:22px; font-weight:800; color:#059669;">${st.reached}</div><div style="font-size:11px; color:var(--n500);">Tiếp cận được</div></div>
          <div class="panel" style="padding:10px; text-align:center; background:#fef2f2;"><div style="font-size:22px; font-weight:800; color:#dc2626;">${st.notReached}</div><div style="font-size:11px; color:var(--n500);">Không tiếp cận</div></div>
          <div class="panel" style="padding:10px; text-align:center;"><div style="font-size:22px; font-weight:800; color:${st.flaggedN ? '#dc2626' : 'var(--n800)'};">${st.flaggedN}</div><div style="font-size:11px; color:var(--n500);">Bị gắn cờ</div></div>
        </div>
        <div style="background:var(--n100); border-radius:99px; height:14px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:${pct >= 100 ? '#059669' : '#6366f1'}; transition:width .4s;"></div>
        </div>
        <p style="font-size:11.5px; margin-top:4px; font-weight:700; color:${pct >= 100 ? '#059669' : '#4f46e5'};">${pct}% chỉ tiêu ngày ${pct >= 100 ? '- ĐÃ ĐẠT KPI! 🎉' : ''}</p>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap; align-items:center;">
          <select id="kpi-call-target" style="flex:1; min-width:240px;">
            <optgroup label="— Leads của tôi (${myLeads.length}) —">
              ${myLeads.map(l => `<option value="lead|${l.id}">${esc(l.name)} · ${esc(l.phone)} [${esc(l.status)}]</option>`).join('')}
            </optgroup>
            <optgroup label="— Khách hàng của tôi (${myContacts.length}) —">
              ${myContacts.slice(0, 200).map(c => `<option value="contact|${c.id}">${esc(c.fullName)} · ${esc(c.phone)}</option>`).join('')}
            </optgroup>
          </select>
          <button class="btn pr" onclick="window.crmApp.launchCallFromPicker()"><i class="fa-solid fa-phone-volume"></i> Mở phiên gọi có kiểm chứng</button>
        </div>
      </div>`;

    html += `
      <div class="panel" style="padding:16px; margin-bottom:14px;">
        <h4 style="font-family:var(--fd); font-weight:800; margin:0 0 10px 0;">📒 Nhật ký cuộc gọi hôm nay của tôi</h4>
        ${renderCallLogTable(st.logs)}
      </div>`;
  }

  // Management block
  if (isMgmt) {
    const reps = USERS_DB.filter(u => u.role === 'sales');

    // Marketer -> Sales direct email composer (addresses come from rep profiles)
    html += `
      <div class="panel" style="padding:18px; margin-bottom:14px; border-left:4px solid #7c3aed;">
        <h3 style="font-family:var(--fd); font-weight:800; margin:0 0 4px 0;">📨 Bắn Email từ Marketers → Sales</h3>
        <p style="font-size:12px; color:var(--n500); margin:0 0 12px 0;">Email người nhận lấy từ <strong>hồ sơ nhân sự</strong> (tham số hóa, không hardcode). Mọi email được lưu vào Outbox bên dưới.</p>
        <div style="display:grid; grid-template-columns: 1fr 1.6fr; gap:10px; margin-bottom:10px;">
          <div class="fg" style="margin:0;">
            <label>Sales nhận email *</label>
            <select id="mkt-mail-rep">
              ${reps.filter(r => r.status === 'active').map(r => `<option value="${r.id}">${esc(r.name)} — ${esc(repNotifyEmail(r) || 'chưa có email')}</option>`).join('')}
            </select>
          </div>
          <div class="fg" style="margin:0;">
            <label>Tiêu đề *</label>
            <input type="text" id="mkt-mail-subject" placeholder="VD: Ưu tiên xử lý nhóm lead Facebook Ads hôm nay" />
          </div>
        </div>
        <div class="fg" style="margin:0 0 10px 0;">
          <label>Nội dung *</label>
          <textarea id="mkt-mail-body" rows="3" placeholder="Nội dung điều phối, hướng dẫn chiến dịch, danh sách lead cần ưu tiên..."></textarea>
        </div>
        <button class="btn pr" id="mkt-mail-send-btn" onclick="window.crmApp.sendMarketerEmail()"><i class="fa-solid fa-paper-plane"></i> Gửi email cho Sales</button>
      </div>`;

    html += `
      <div class="panel" style="padding:18px; margin-bottom:14px;">
        <h3 style="font-family:var(--fd); font-weight:800; margin:0 0 4px 0;">🛡️ Giám sát KPI cuộc gọi đội Sales - ${todayKey()}</h3>
        <p style="font-size:12px; color:var(--n500); margin:0 0 12px 0;">KPI đếm <strong>khách hàng khác nhau</strong> đã gọi có kiểm chứng. Email giao việc của từng sales được <strong>tham số hóa</strong> - bấm ✉️ để sửa, hệ thống tự đồng bộ Supabase.</p>
        <div style="overflow-x:auto;">
        <table class="tbl" style="width:100%; font-size:12px;">
          <thead><tr>
            <th style="text-align:left;">Sales Rep</th><th>Email nhận thông báo</th><th>Chỉ tiêu/ngày</th>
            <th>KH đã gọi</th><th>Tiếp cận</th><th>Không tiếp cận</th><th>TB giây/cuộc</th><th>Gắn cờ</th><th>Trạng thái KPI</th>
          </tr></thead>
          <tbody>
          ${reps.map(rep => {
            const st = repDayStats(rep.id);
            const target = repKpiTarget(rep);
            const pct = Math.round((st.distinct / target) * 100);
            const status = st.flaggedN > 0
              ? '<span style="background:#fef2f2; color:#dc2626; padding:2px 8px; border-radius:99px; font-weight:800;">🚨 BẤT THƯỜNG</span>'
              : (st.distinct >= target
                ? '<span style="background:#ecfdf5; color:#059669; padding:2px 8px; border-radius:99px; font-weight:800;">✅ ĐẠT</span>'
                : `<span style="background:#fffbeb; color:#b45309; padding:2px 8px; border-radius:99px; font-weight:800;">⏳ ${pct}%</span>`);
            return `<tr style="border-top:1px solid var(--bd);">
              <td style="text-align:left; font-weight:700;">${esc(rep.name)}<div style="font-size:10.5px; color:var(--n500); font-weight:400;">${esc(rep.dept || '')}</div></td>
              <td class="tmono" style="font-size:11px;">${esc(repNotifyEmail(rep)) || '<i style="color:#dc2626;">chưa có</i>'}
                <button class="btn bl xs" style="padding:2px 6px;" title="Sửa email nhận thông báo" onclick="window.crmApp.editRepNotifyEmail('${rep.id}')">✉️</button></td>
              <td>${target} <button class="btn bl xs" style="padding:2px 6px;" title="Sửa chỉ tiêu" onclick="window.crmApp.editRepKpiTarget('${rep.id}')">⚙️</button></td>
              <td style="font-weight:800; color:#4f46e5;">${st.distinct}</td>
              <td style="color:#059669; font-weight:700;">${st.reached}</td>
              <td style="color:#dc2626; font-weight:700;">${st.notReached}</td>
              <td>${st.avgDur}s</td>
              <td>${st.flaggedN ? `<strong style="color:#dc2626;">${st.flaggedN} ⚠</strong>` : '0'}</td>
              <td>${status}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>
        </div>
      </div>`;

    const allToday = CALL_LOGS_DB.filter(c => c.dateKey === todayKey());
    html += `
      <div class="panel" style="padding:16px; margin-bottom:14px;">
        <h4 style="font-family:var(--fd); font-weight:800; margin:0 0 10px 0;">📒 Toàn bộ cuộc gọi hôm nay (${allToday.length})</h4>
        ${renderCallLogTable(allToday.slice(0, 50), true)}
      </div>
      <div class="panel" style="padding:16px; margin-bottom:14px;">
        <h4 style="font-family:var(--fd); font-weight:800; margin:0 0 10px 0;">📨 Email Outbox - nhật ký gửi thông báo giao việc (${EMAIL_OUTBOX_DB.length})</h4>
        <div style="overflow-x:auto;">
        <table class="tbl" style="width:100%; font-size:12px;">
          <thead><tr><th style="text-align:left;">Thời gian</th><th style="text-align:left;">Người nhận</th><th style="text-align:left;">Tiêu đề</th><th>Trạng thái</th></tr></thead>
          <tbody>
          ${EMAIL_OUTBOX_DB.slice(0, 15).map(m => `<tr style="border-top:1px solid var(--bd);">
            <td style="text-align:left; white-space:nowrap;">${esc(m.createdAt)}</td>
            <td style="text-align:left;">${esc(m.toName)}<div class="tmono" style="font-size:10.5px; color:var(--n500);">${esc(m.toEmail)}</div></td>
            <td style="text-align:left;">${esc(m.subject)}</td>
            <td>${m.status === 'sent' ? '<span style="color:#059669; font-weight:800;">✅ Đã gửi</span>' : m.status === 'failed' ? `<span style="color:#dc2626; font-weight:800;" title="${esc(m.error)}">❌ Lỗi</span>` : `<span style="color:#b45309; font-weight:800;" title="${esc(m.error)}">📭 Hàng đợi</span>`}</td>
          </tr>`).join('') || '<tr><td colspan="4" style="padding:14px; color:var(--n500);">Chưa có email nào - hãy tạo lead mới và gán cho sales.</td></tr>'}
          </tbody>
        </table>
        </div>
      </div>`;
  }

  if (!isSales && !isMgmt) html += `<div class="panel" style="padding:20px;">Vai trò của bạn không tham gia KPI cuộc gọi.</div>`;
  html += `</div>`;
  return html;
}

function renderCallLogTable(logs, showRep = false) {
  if (!logs.length) return '<p style="font-size:12px; color:var(--n500); padding:8px 0;">Chưa có cuộc gọi nào được ghi nhận hôm nay.</p>';
  return `<div style="overflow-x:auto;"><table class="tbl" style="width:100%; font-size:12px;">
    <thead><tr>${showRep ? '<th style="text-align:left;">Sales</th>' : ''}<th style="text-align:left;">Khách hàng</th><th>SĐT</th><th>Bắt đầu</th><th>Thời lượng</th><th>Kết quả</th><th style="text-align:left;">Lý do / Ghi chú</th></tr></thead>
    <tbody>${logs.map(c => `<tr style="border-top:1px solid var(--bd); ${c.flagged ? 'background:#fff7ed;' : ''}">
      ${showRep ? `<td style="text-align:left; font-weight:700;">${esc(c.repName)}</td>` : ''}
      <td style="text-align:left; font-weight:700;">${esc(c.targetName)} ${c.flagged ? '<span title="Cuộc gọi bị gắn cờ bất thường">🚩</span>' : ''}</td>
      <td class="tmono">${esc(c.phone)}</td>
      <td style="white-space:nowrap;">${esc(c.startedAt)}</td>
      <td style="font-weight:700;">${c.durationSec}s</td>
      <td>${c.reached ? '<span style="color:#059669; font-weight:800;">✅ Tiếp cận</span>' : '<span style="color:#dc2626; font-weight:800;">❌ Thất bại</span>'}</td>
      <td style="text-align:left; color:var(--n600);">${esc(c.failReason || '')}${c.note ? `<div style="font-size:10.5px; color:var(--n500);">${esc(c.note)}</div>` : ''}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

export function launchCallFromPicker() {
  const v = document.getElementById('kpi-call-target')?.value;
  if (!v) { toast('Hãy chọn một khách hàng/lead để gọi!', 'error'); return; }
  const [type, id] = v.split('|');
  openCallSession(type, id);
}

// Expose pipeline & KPI methods for inline handlers
Object.assign(window.crmApp || (window.crmApp = {}), {
  openCallSession, beginDial, onReachChange, cancelCallSession, submitCallOutcome,
  editRepNotifyEmail, editRepKpiTarget, launchCallFromPicker,
  revealSecuredField, sendMarketerEmail
});

async function init() {
  // Load durable data from Supabase first; fall back to in-memory seeds
  // so the app still works when the cloud is unreachable.
  let cloudOk = false;
  try {
    cloudOk = await bootLoadFromCloud();
  } catch (err) {
    console.error('Supabase boot failure:', err);
  }
  if (!cloudOk) {
    initDB();
  }

  // Register dynamic window properties
  Object.defineProperty(window, 'SESSION', {
    get: function() { return SESSION; },
    set: function(val) { SESSION = val; },
    configurable: true
  });
  
  // Starting page: login screen directly
  CUR_PAGE = 'login';
  renderEntryScreen();

  setupFloatingRoleSwitcher();
  setupEventDelegation();
  setupMcnaFunnelEvents();

  setTimeout(() => {
    if (cloudOk) {
      toast(`☁️ Đã kết nối Supabase: ${CONTACTS_DB.length} khách hàng, ${USERS_DB.length} nhân sự. Mọi thay đổi được lưu tự động.`, 'success');
    } else {
      toast('⚠️ MẤT KẾT NỐI SUPABASE: đang chạy dữ liệu demo, thay đổi sẽ KHÔNG được lưu!', 'error', 12000);
      const banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#dc2626;color:#fff;text-align:center;padding:8px 16px;font-size:13px;font-weight:700;font-family:sans-serif;';
      banner.textContent = '⚠️ KHÔNG KẾT NỐI ĐƯỢC SUPABASE — dữ liệu hiển thị là bản demo tạm, mọi thay đổi sẽ mất khi tải lại trang. Hãy tải lại (F5) để thử kết nối lại.';
      document.body.appendChild(banner);
    }
  }, 800);
}

// Run Application Init
init();
