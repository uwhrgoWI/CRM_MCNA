// Enterprise CRM Pro - In-Memory Database & Seed Engine
'use strict';

// 1. Seed helper lists
const VN_FIRST_NAMES = ["An", "Bình", "Chinh", "Dũng", "Hải", "Anh", "Triệu", "Chiến", "Huy", "Linh", "Cường", "Trang", "Phương", "Hoàng", "Minh", "Nam", "Sơn", "Tuấn", "Vũ", "Yến", "Lan", "Hương", "Khánh", "Duy", "Đức"];
const VN_LAST_NAMES = ["Nguyễn", "Trần", "Lê", "Phạm", "Vũ", "Hoàng", "Phan", "Bùi", "Ngô", "Đặng", "Đỗ", "Hồ", "Dương", "Lý"];
const COMPLEX_COMPANY_NAMES = ["VNG Corp", "Tiki JSC", "FPT Software", "Viettel Telecom", "MISA Software", "Đất Xanh Group", "Vinamilk Group", "Masan Consumer", "Techcom Securities", "Hoa Phat Group", "TH True Milk", "Vingroup JSC", "Sendo Vietnam", "Bách Hóa Xanh", "Thế Giới Di Động"];
const CRM_INDUSTRIES = ["Công nghệ thông tin", "Tài chính ngân hàng", "Y tế & Dược phẩm", "Bán lẻ thương mại", "Sản xuất thiết bị", "Giáo dục & Đào tạo", "Bất động sản", "F&B thực phẩm", "Vận tải Logistics"];
const CAMPAIGHT_SOURCES = ["Facebook Ads", "Google Search Form", "Referral Partner", "Cold Calling Campaign", "Zalo OA Fanpage", "LinkedIn Sales Navigator", "Tech Exhibition", "Outbound Email blast"];
const NOTIF_TYPES = ["new_lead", "deal_update", "task_due", "deal_won", "ticket_assigned", "mention", "system", "payment_received"];

// Helper random numbers generator
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function genPhone() {
  return "09" + randRange(10000000, 99999999).toString();
}

// Global DB namespace storage
export const USERS_DB = [
  {
    id: "usr-admin",
    email: "superadmin@crm.vn",
    pw: "Admin@123",
    name: "Cao Khải Hoàn",
    role: "superadmin",
    dept: "Hội đồng Quản trị",
    phone: "0911000123",
    initials: "KH",
    color: "#ef4444",
    status: "active",
    joinedAt: "10/01/2025",
    lastLogin: "23/05/2026 07:30",
    target: 5000000000,
    dealsWon: 12,
    revenue: 4200000000
  },
  {
    id: "usr-manager",
    email: "manager@crm.vn",
    pw: "Manager@123",
    name: "Lê Nhật Ánh",
    role: "manager",
    dept: "Kinh doanh - B2B Sales",
    phone: "0905432109",
    initials: "NA",
    color: "#7c3aed",
    status: "active",
    joinedAt: "15/02/2025",
    lastLogin: "23/05/2026 07:35",
    target: 3000000000,
    dealsWon: 8,
    revenue: 2150000000
  },
  {
    id: "usr-sales",
    email: "sales@crm.vn",
    pw: "Sales@123",
    name: "Đặng Việt Triều",
    role: "sales",
    dept: "Kinh doanh miền Bắc",
    phone: "0989123456",
    initials: "VT",
    color: "#2563eb",
    status: "active",
    joinedAt: "01/03/2025",
    lastLogin: "23/05/2026 07:44",
    target: 1500000000,
    dealsWon: 5,
    revenue: 980000000
  },
  {
    id: "usr-support",
    email: "support@crm.vn",
    pw: "Support@123",
    name: "Trần Thị Lan",
    role: "support",
    dept: "Phòng Chăm sóc Khách hàng",
    phone: "0977654321",
    initials: "TL",
    color: "#14b8a6",
    status: "active",
    joinedAt: "12/03/2025",
    lastLogin: "23/05/2026 07:50",
    target: 200, // SLA score goal
    dealsWon: 14, // Tickets solved
    revenue: 0
  },
  // 8 additional core employees
  { id: "usr-emp1", email: "phuong.le@crm.vn", pw: "Emp@1234", name: "Lê Minh Phương", role: "sales", dept: "Kinh doanh miền Nam", phone: genPhone(), initials: "MP", color: "#3b82f6", status: "active", joinedAt: "20/03/2025", lastLogin: "22/05/2026 09:12", target: 1200000000, dealsWon: 4, revenue: 750000000 },
  { id: "usr-emp2", email: "hoang.pham@crm.vn", pw: "Emp@1234", name: "Phạm Minh Hoàng", role: "sales", dept: "Kinh doanh miền Bắc", phone: genPhone(), initials: "MH", color: "#60a5fa", status: "active", joinedAt: "01/04/2025", lastLogin: "22/05/2026 10:45", target: 1000000000, dealsWon: 3, revenue: 550000000 },
  { id: "usr-emp3", email: "anh.vu@crm.vn", pw: "Emp@1234", name: "Vũ Tuấn Anh", role: "sales", dept: "Quản trị Tài khoản Key Account", phone: genPhone(), initials: "TA", color: "#8b5cf6", status: "active", joinedAt: "10/04/2025", lastLogin: "23/05/2026 08:00", target: 2000000000, dealsWon: 6, revenue: 1420000000 },
  { id: "usr-emp4", email: "yen.ngo@crm.vn", pw: "Emp@1234", name: "Ngô Hoàng Yến", role: "support", dept: "Phòng Chăm sóc Khách hàng", phone: genPhone(), initials: "HY", color: "#10b981", status: "active", joinedAt: "15/04/2025", lastLogin: "21/05/2026 14:30", target: 150, dealsWon: 32, revenue: 0 },
  { id: "usr-emp5", email: "duc.bui@crm.vn", pw: "Emp@1234", name: "Bùi Trọng Đức", role: "support", dept: "Phòng Kỹ thuật Support", phone: genPhone(), initials: "TĐ", color: "#06b6d4", status: "active", joinedAt: "01/05/2025", lastLogin: "23/05/2026 08:05", target: 150, dealsWon: 28, revenue: 0 },
  { id: "usr-emp6", email: "chinh.pham@crm.vn", pw: "Emp@1234", name: "Phạm Ngọc Chinh", role: "manager", dept: "Kinh doanh miền Nam", phone: genPhone(), initials: "NC", color: "#7c3aed", status: "active", joinedAt: "10/02/2025", lastLogin: "22/05/2026 17:15", target: 2500000000, dealsWon: 7, revenue: 1980000000 },
  { id: "usr-emp7", email: "linh.nguyen@crm.vn", pw: "Emp@1234", name: "Nguyễn Khánh Linh", role: "sales", dept: "Inbound Marketing Sales", phone: genPhone(), initials: "KL", color: "#a855f7", status: "active", joinedAt: "12/03/2025", lastLogin: "22/05/2026 15:40", target: 800000000, dealsWon: 2, revenue: 450000000 },
  { id: "usr-emp8", email: "dung.le@crm.vn", pw: "Emp@1234", name: "Lê Quang Dũng", role: "support", dept: "Phòng Chăm sóc Khách hàng", phone: genPhone(), initials: "QD", status: "inactive", joinedAt: "10/01/2025", lastLogin: "15/04/2026 16:30", target: 100, dealsWon: 10, revenue: 0 }
];

export const COMPANIES_DB = [];
export const CONTACTS_DB = [];
export const LEADS_DB = [];
export const DEALS_DB = [];
export const TASKS_DB = [];
export const ACTIVITIES_DB = [];
export const QUOTES_DB = [];
export const INVOICES_DB = [];
export const PRODUCTS_DB = [];
export const TICKETS_DB = [];
export const AUDIT_LOG_DB = [];
export const NOTIFICATIONS_DB = [];

// 12 Months Revenue seed data (last June to current May 2026)
export const REVENUE_DATA = [
  { month: "T6/25", revenue: 840000000, wonDeals: 12 },
  { month: "T7/25", revenue: 950000000, wonDeals: 14 },
  { month: "T8/25", revenue: 1100000000, wonDeals: 15 },
  { month: "T9/25", revenue: 1050000000, wonDeals: 13 },
  { month: "T10/25", revenue: 1250000000, wonDeals: 18 },
  { month: "T11/25", revenue: 1400000000, wonDeals: 21 },
  { month: "T12/25", revenue: 1850000000, wonDeals: 28 },
  { month: "T1/26", revenue: 1300000000, wonDeals: 16 },
  { month: "T2/26", revenue: 1500000000, wonDeals: 19 },
  { month: "T3/26", revenue: 1680000000, wonDeals: 22 },
  { month: "T4/26", revenue: 1950000000, wonDeals: 25 },
  { month: "T5/26", revenue: 2150000000, wonDeals: 30 }
];

// Seeding function (Called automatically on load)
export function initDB() {
  if (COMPANIES_DB.length > 0) return; // Guard duplicate

  // 1. Seed 15 Companies
  COMPANIES_DB.push(...COMPLEX_COMPANY_NAMES.map((name, idx) => {
    const id = `cmp-${idx + 1}`;
    const size = randChoice(["10-50 nhân sự", "50-200 nhân sự", "200-500 nhân sự", "500-1000 nhân sự", "1000+ nhân sự"]);
    return {
      id,
      name,
      industry: randChoice(CRM_INDUSTRIES),
      size,
      website: `https://${name.toLowerCase().replace(/[^a-z]/g, "")}.com.vn`,
      phone: genPhone(),
      address: `${randRange(10, 480)} Đường Nguyễn Huệ, Quận 1, TPHCM`,
      contactsCount: 2,
      dealsCount: randRange(1, 3),
      revenue: randRange(500, 1600) * 10000000,
      ownerId: randChoice(["usr-sales", "usr-emp1", "usr-emp2", "usr-emp3"]),
      notes: `Khách hàng tiềm năng cao B2B, cơ cấu quản lý tinh gọn.`
    };
  }));

  // 2. Seed 30 Contacts
  for (let i = 1; i <= 30; i++) {
    const firstName = randChoice(VN_FIRST_NAMES);
    const lastName = randChoice(VN_LAST_NAMES);
    const linkedCompany = randChoice(COMPANIES_DB);
    const deptRole = randChoice(["Trưởng phòng Mua hàng", "Giám đốc Công nghệ (CTO)", "Chuyên viên mua sắm B2B", "CEO Sáng lập", "Trưởng phòng HCNS", "Giám đốc Tài chính (CFO)"]);
    CONTACTS_DB.push({
      id: `con-${i}`,
      firstName,
      lastName,
      fullName: `${lastName} ${firstName}`,
      title: deptRole,
      companyId: linkedCompany.id,
      companyName: linkedCompany.name,
      phone: genPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}@${linkedCompany.name.toLowerCase().replace(/[^a-z]/g, "")}.com.vn`,
      source: randChoice(CAMPAIGHT_SOURCES),
      ownerId: linkedCompany.ownerId,
      tags: randChoice(["VIP", "Doanh nghiệp", "Kỹ thuật", "Hợp đồng mới", "Nợ xấu", "Khó tính"]),
      dealsCount: linkedCompany.dealsCount,
      lastActivity: `${randRange(10, 23)}/05/2026`,
      notes: `Phụ trách đàm phán chính, ra quyết định trực tiếp môn mua sắm.`
    });
  }

  // 3. Seed 25 Leads
  const LEAD_FIRST_NAMES = ["Kim", "Thành", "Vinh", "Khánh", "Sơn", "Vân", "Kiên", "Tài", "Hạnh", "Cường"];
  const LEAD_LAST_NAMES = ["Nguyễn", "Đặng", "Trần", "Lê", "Phú", "Bùi", "Đỗ"];
  for (let i = 1; i <= 25; i++) {
    const fn = randChoice(LEAD_FIRST_NAMES);
    const ln = randChoice(LEAD_LAST_NAMES);
    const fullName = `${ln} ${fn}`;
    LEADS_DB.push({
      id: `led-${i}`,
      name: fullName,
      company: randChoice(["Đại lý Thép Cường Lực", "Gia dụng Minh Phát", "Logistics Thành Công", "Dệt may Việt Nam", "Xây dựng Hòa Bình", "Hải sản Tươi Sống", "Nội thất Decor"]),
      phone: genPhone(),
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@outlook.com.vn`,
      source: randChoice(CAMPAIGHT_SOURCES),
      status: randChoice(["new", "contacting", "qualified", "proposal", "lost"]),
      value: randRange(20, 200) * 1000000,
      ownerId: randChoice(["usr-sales", "usr-emp1", "usr-emp2", "usr-emp3"]),
      createdAt: `${randRange(1, 20)}/05/2026`,
      deadline: `${randRange(24, 30)}/05/2026`,
      priority: randChoice(["hot", "warm", "cold"]),
      notes: "Nhu cầu mua hàng lớn, quan tâm đến quy chuẩn hỗ trợ kĩ thuật.",
      tags: "Khách-Mới, B2B-SMB"
    });
  }

  // 4. Seed 20 Deals
  const STAGES = ["prospecting", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
  for (let i = 1; i <= 20; i++) {
    const contact = randChoice(CONTACTS_DB);
    const company = COMPANIES_DB.find(c => c.id === contact.companyId);
    const stage = randChoice(STAGES);
    let value = randRange(80, 800) * 1000000;
    let prob = 20;
    if (stage === "qualified") prob = 40;
    else if (stage === "proposal") prob = 60;
    else if (stage === "negotiation") prob = 80;
    else if (stage === "closed_won") { prob = 100; value = value * 1.2; }
    else if (stage === "closed_lost") prob = 0;

    DEALS_DB.push({
      id: `dea-${i}`,
      name: `Hợp đồng cung cấp cho ${company.name}`,
      contactId: contact.id,
      contactName: contact.fullName,
      companyId: company.id,
      companyName: company.name,
      value,
      stage,
      probability: prob,
      ownerId: company.ownerId,
      expectedClose: `28/05/2026`,
      createdAt: `01/05/2026`,
      lastActivity: `${randRange(15, 23)}/05/2026`,
      notes: "Sản phẩm chủ lực B2B SaaS, thời hiệu thanh khoản nhanh.",
      tags: "Hợp-Đồng, VIP"
    });
  }

  // 5. Seed 30 Tasks
  const TASK_TITLES = [
    { title: "Gọi điện thương thuyết báo giá", type: "call" },
    { title: "Gửi thư follow up hợp đồng mới", type: "email" },
    { title: "Họp trực tiếp chốt số lượng", type: "meeting" },
    { title: "Demo tính năng sản phẩm", type: "demo" },
    { title: "Nộp đề xuất phương án kĩ thuật", type: "proposal" },
    { title: "Liên hệ đối chất hỗ trợ", type: "call" }
  ];
  for (let i = 1; i <= 30; i++) {
    const pick = randChoice(TASK_TITLES);
    const owner = randChoice(["usr-sales", "usr-emp1", "usr-emp2", "usr-emp3", "usr-support"]);
    const deal = randChoice(DEALS_DB);
    TASKS_DB.push({
      id: `tsk-${i}`,
      title: `${pick.title} - ${deal.companyName}`,
      type: pick.type,
      description: "Thực hiện đúng thời gian cam kết của khách hàng, cập nhật kết quả lên hệ thống.",
      relatedTo: "Deal",
      relatedId: deal.id,
      ownerId: owner,
      dueDate: `23/05/2026`,
      priority: randChoice(["high", "medium", "low"]),
      status: randChoice(["not_started", "in_progress", "completed"]),
      completed: i % 3 === 0,
      subtasks: [
        { id: "sub-1", title: "Chuẩn bị slide dữ liệu", checked: true },
        { id: "sub-2", title: "Đối chiếu biểu phí", checked: i % 3 === 0 }
      ],
      tags: "Cần-Làm, Khẩn-Cấp"
    });
  }

  // 6. Seed 40 Activities
  const OUTCOMES = ["Interested / Ghi nhận", "No Answer / Gọi lại sau", "Hẹn lịch họp bàn", "Yêu cầu sửa đổi báo giá", "Đã chốt xong", "Bàn giao kỹ thuật thành công"];
  for (let i = 1; i <= 40; i++) {
    const contact = randChoice(CONTACTS_DB);
    const deal = randChoice(DEALS_DB);
    const type = randChoice(["call", "email", "meeting", "note"]);
    ACTIVITIES_DB.push({
      id: `act-${i}`,
      type,
      title: `${type === "call" ? "📞 Cuộc gọi" : type === "email" ? "📧 Outbound Email" : type === "meeting" ? "📅 Cuộc họp" : "📝 Note ngắn"} với ${contact.fullName}`,
      contactId: contact.id,
      dealId: deal.id,
      ownerId: deal.ownerId,
      datetime: `${randRange(10, 23)}/05/2026 14:00`,
      duration: `${randRange(10, 45)} phút`,
      outcome: randChoice(OUTCOMES),
      notes: "Trao đổi sâu về cơ cấu tính giá, thời gian phân kì triển khai dự án.",
      direction: randChoice(["inbound", "outbound"])
    });
  }

  // 7. Seed 20 Products/Services
  const PRODUCT_SAMPLES = [
    { name: "Gói Phần mềm Aura CRM Pro License", code: "AURA-PRO", cate: "Part", price: 15000000, emoji: "💻" },
    { name: "Phần mềm HRM Quản lý Nhân sự Core", code: "AURA-HRM", cate: "Part", price: 12000000, emoji: "👥" },
    { name: "Giải pháp ERP ERP Oracle Suite", code: "AURA-ERP", cate: "Part", price: 120000000, emoji: "📊" },
    { name: "Dịch vụ Triển khai Hệ thống On-Premise", code: "SRV-DEPLOY", cate: "Service", price: 45000000, emoji: "🛠️" },
    { name: "Khóa ôn luyện Đào tạo End-User Sales", code: "SRV-TRAIN", cate: "Service", price: 8000000, emoji: "📚" },
    { name: "Máy chủ Server Dell PowerEdge", code: "HW-SERVER", cate: "Hardware", price: 85000000, emoji: "🖥️" },
    { name: "Hệ thống điện toán tích hợp Call Center", code: "HW-CALLER", cate: "Hardware", price: 25000000, emoji: "📞" },
    { name: "Tư vấn Chuyển đổi số Doanh nghiệp", code: "CNS-TRANS", cate: "Consult", price: 35000000, emoji: "💡" }
  ];
  for (let i = 1; i <= 20; i++) {
    const sample = randChoice(PRODUCT_SAMPLES);
    PRODUCTS_DB.push({
      id: `prd-${i}`,
      name: `${sample.name} - Version ${i}`,
      code: `${sample.code}-${randRange(100, 999)}`,
      category: sample.cate,
      price: sample.price + randRange(-5, 10) * 100000,
      unit: "Gói/Năm",
      stock: randRange(10, 200),
      description: "Sản phẩm cốt lõi thuộc hệ sinh thái Aura ERP Solutions, cung cấp giải pháp chuyển đổi nhanh.",
      emoji: sample.emoji,
      status: "active"
    });
  }

  // 8. Seed 12 Quotations + Invoices
  for (let i = 1; i <= 12; i++) {
    const deal = randChoice(DEALS_DB);
    const item1 = randChoice(PRODUCTS_DB);
    const item2 = randChoice(PRODUCTS_DB);
    const subtotal = item1.price + item2.price * 2;
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    QUOTES_DB.push({
      id: `qte-${i}`,
      number: `BG-2026-${i.toString().padStart(4, "0")}`,
      contactId: deal.contactId,
      contactName: deal.contactName,
      dealId: deal.id,
      items: [
        { id: item1.id, name: item1.name, price: item1.price, qty: 1, desc: item1.description },
        { id: item2.id, name: item2.name, price: item2.price, qty: 2, desc: item2.description }
      ],
      subtotal,
      vat,
      total,
      status: randChoice(["nhap", "da_gui", "xem_xet", "chap_nhan", "tu_choi"]),
      createdAt: `15/05/2026`,
      validUntil: `30/05/2026`,
      ownerId: deal.ownerId,
      terms: "Phương thức thanh toán: Chuyển khoản Techcombank 100% khi bàn giao giấy phép.",
      notes: "Báo giá đặc biệt chiết khấu 5% cho đối tác VIP."
    });

    INVOICES_DB.push({
      id: `inv-${i}`,
      number: `HD-2026-${i.toString().padStart(4, "0")}`,
      quoteId: `qte-${i}`,
      contactId: deal.contactId,
      contactName: deal.contactName,
      items: [
        { id: item1.id, name: item1.name, price: item1.price, qty: 1 },
        { id: item2.id, name: item2.name, price: item2.price, qty: 2 }
      ],
      total,
      status: randChoice(["paid", "partial", "overdue"]),
      dueDate: `30/05/2026`,
      paidAt: `20/05/2026`,
      notes: "Xuất hóa đơn đỏ điện tử VAT."
    });
  }

  // 9. Seed 25 Support Tickets
  const TICKET_SUBJECTS = ["Lỗi đồng bộ dữ liệu API CRM", "Không gửi được SMS Brandname", "Mất kết nối máy chủ Cloud miền Nam", "Lỗi phân quyền Nhân viên", "Lỗi tạo tài khoản mới", "Tài liệu API hướng dẫn Zalo OA"];
  for (let i = 1; i <= 25; i++) {
    const contact = randChoice(CONTACTS_DB);
    const agent = randChoice(["usr-support", "usr-emp4", "usr-emp5"]);
    const status = randChoice(["open", "pending", "resolved", "escalated"]);
    TICKETS_DB.push({
      id: `tk-${i}`,
      number: `TK-${i.toString().padStart(4, "0")}`,
      subject: randChoice(TICKET_SUBJECTS) + ` [${contact.companyName}]`,
      contactId: contact.id,
      contactName: contact.fullName,
      channel: randChoice(["Email", "Chat", "Phone", "Web"]),
      priority: randChoice(["Critical", "High", "Medium", "Low"]),
      status,
      agentId: agent,
      createdAt: `22/05/2026 10:15`,
      lastReply: `23/05/2026 08:30`,
      slaHours: randChoice([2, 4, 8, 24]),
      tags: "Lỗi-Hệ-Thống, Cần-Gấp",
      messages: [
        { sender: "customer", text: "Chào bạn, hệ thống của chúng tôi hiện không đồng bộ được danh sách liên hệ từ phễu quảng cáo, vui lòng kiểm tra gấp giúp.", time: "10:15" },
        { sender: "agent", text: "Dạ em đã tiếp nhận thông tin, em đang bàn giao bộ phận kĩ thuật kiểm tra IP Whitelist.", time: "10:30" }
      ]
    });
  }

  // 10. Seed 25 Audit Entries
  const USERS_LIST = USERS_DB.map(u => u.name);
  const RESOURCES_LIST = ["Leads", "Deals", "Quotations", "Invoices", "Users", "Settings", "Tickets", "Integrations"];
  const ACTIONS_LIST = ["Đăng nhập", "Xem chi tiết", "Cập nhật thông tin", "Khởi tạo thành công", "Xóa bỏ bản ghi", "Duyệt chi phí"];
  for (let i = 1; i <= 25; i++) {
    AUDIT_LOG_DB.push({
      id: `adt-${i}`,
      timestamp: `23/05/2026 08:${randRange(10,59).toString().padStart(2, "0")}`,
      user: randChoice(USERS_LIST),
      action: randChoice(ACTIONS_LIST),
      resource: randChoice(RESOURCES_LIST),
      ip: `192.168.1.${randRange(10, 254)}`,
      status: "thanh_cong"
    });
  }

  // 11. Seed 20 Notifications
  for (let i = 1; i <= 20; i++) {
    NOTIFICATIONS_DB.push({
      id: `ntf-${i}`,
      type: randChoice(NOTIF_TYPES),
      title: "Hệ thống thông báo thông minh",
      body: `Bản ghi vừa được cập nhật tiến trình vào lúc ${randRange(1, 23)} giờ trước, vui lòng nhấp chuột để kiểm tra.`,
      time: `${randRange(1, 12)} giờ trước`,
      unread: i <= 6
    });
  }
}
