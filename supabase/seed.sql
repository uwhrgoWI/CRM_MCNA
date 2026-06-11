-- =====================================================================
-- MCNA CRM VN - Seed Data
-- 20 staff (admin / marketers / sales / support) + 500 B2C customers
-- + companies, leads, deals, tasks, activities, products, quotes,
--   invoices, tickets, audit log, notifications, revenue history.
-- Deterministic generation (no random()) so reruns are stable.
-- =====================================================================

-- ----------------------------------------------------------------
-- 1. STAFF USERS (demo logins preserved for the login screen)
-- ----------------------------------------------------------------
insert into staff_users (id, email, pw, name, role, dept, phone, initials, color, status, "joinedAt", "lastLogin", target, "dealsWon", revenue) values
  ('usr-admin',   'superadmin@crm.vn', 'Admin@123',   'Cao Khải Hoàn',    'superadmin', 'Hội đồng Quản trị',            '0911000123', 'KH', '#ef4444', 'active', '10/01/2025', '10/06/2026 07:30', 5000000000, 12, 4200000000),
  ('usr-admin2',  'admin2@crm.vn',     'Admin@123',   'Trương Quốc Bảo',  'superadmin', 'Vận hành Hệ thống',            '0911000456', 'QB', '#f97316', 'active', '12/01/2025', '09/06/2026 17:10', 0, 0, 0),
  ('usr-manager', 'manager@crm.vn',    'Manager@123', 'Lê Nhật Ánh',      'manager',    'Marketing - Demand Gen',       '0905432109', 'NA', '#7c3aed', 'active', '15/02/2025', '10/06/2026 07:35', 3000000000, 8, 2150000000),
  ('usr-mkt2',    'mkt.huong@crm.vn',  'Mkt@1234',    'Phạm Thu Hương',   'manager',    'Marketing - Performance Ads',  '0905111222', 'TH', '#8b5cf6', 'active', '20/02/2025', '09/06/2026 15:20', 2200000000, 6, 1500000000),
  ('usr-mkt3',    'mkt.long@crm.vn',   'Mkt@1234',    'Đỗ Thành Long',    'manager',    'Marketing - Content & SEO',    '0905333444', 'TL', '#a855f7', 'active', '01/03/2025', '08/06/2026 11:05', 1800000000, 4, 990000000),
  ('usr-mkt4',    'mkt.chinh@crm.vn',  'Mkt@1234',    'Phạm Ngọc Chinh',  'manager',    'Marketing - CRM Automation',   '0905555666', 'NC', '#6d28d9', 'active', '10/02/2025', '09/06/2026 17:15', 2500000000, 7, 1980000000),
  ('usr-mkt5',    'mkt.thao@crm.vn',   'Mkt@1234',    'Nguyễn Phương Thảo','manager',   'Marketing - Social & Zalo OA', '0905777888', 'PT', '#c026d3', 'active', '05/03/2025', '10/06/2026 08:02', 1500000000, 3, 760000000),
  ('usr-sales',   'sales@crm.vn',      'Sales@123',   'Đặng Việt Triều',  'sales',      'Kinh doanh miền Bắc',          '0989123456', 'VT', '#2563eb', 'active', '01/03/2025', '10/06/2026 07:44', 1500000000, 5, 980000000),
  ('usr-s2',      'phuong.le@crm.vn',  'Emp@1234',    'Lê Minh Phương',   'sales',      'Kinh doanh miền Nam',          '0989222333', 'MP', '#3b82f6', 'active', '20/03/2025', '09/06/2026 09:12', 1200000000, 4, 750000000),
  ('usr-s3',      'hoang.pham@crm.vn', 'Emp@1234',    'Phạm Minh Hoàng',  'sales',      'Kinh doanh miền Bắc',          '0989444555', 'MH', '#60a5fa', 'active', '01/04/2025', '09/06/2026 10:45', 1000000000, 3, 550000000),
  ('usr-s4',      'anh.vu@crm.vn',     'Emp@1234',    'Vũ Tuấn Anh',      'sales',      'Key Account miền Trung',       '0989666777', 'TA', '#0ea5e9', 'active', '10/04/2025', '10/06/2026 08:00', 2000000000, 6, 1420000000),
  ('usr-s5',      'linh.nguyen@crm.vn','Emp@1234',    'Nguyễn Khánh Linh','sales',      'Inbound Sales',                '0989888999', 'KL', '#38bdf8', 'active', '12/03/2025', '09/06/2026 15:40', 800000000, 2, 450000000),
  ('usr-s6',      'tien.dao@crm.vn',   'Emp@1234',    'Đào Mạnh Tiến',    'sales',      'Kinh doanh B2C Retail',        '0978111222', 'MT', '#1d4ed8', 'active', '01/05/2025', '10/06/2026 08:30', 900000000, 3, 510000000),
  ('usr-s7',      'my.tran@crm.vn',    'Emp@1234',    'Trần Hà My',       'sales',      'Kinh doanh B2C Retail',        '0978333444', 'HM', '#312e81', 'active', '05/05/2025', '09/06/2026 14:22', 850000000, 2, 430000000),
  ('usr-s8',      'khoa.ngo@crm.vn',   'Emp@1234',    'Ngô Đăng Khoa',    'sales',      'Kinh doanh miền Nam',          '0978555666', 'DK', '#1e40af', 'active', '10/05/2025', '08/06/2026 16:55', 950000000, 2, 380000000),
  ('usr-s9',      'quyen.bui@crm.vn',  'Emp@1234',    'Bùi Thúy Quyên',   'sales',      'Inbound Sales',                '0978777888', 'TQ', '#2563eb', 'active', '15/05/2025', '10/06/2026 09:01', 700000000, 1, 210000000),
  ('usr-s10',     'dung.le@crm.vn',    'Emp@1234',    'Lê Quang Dũng',    'sales',      'Kinh doanh miền Bắc',          '0978999000', 'QD', '#0284c7', 'inactive', '10/01/2025', '15/04/2026 16:30', 600000000, 1, 150000000),
  ('usr-support', 'support@crm.vn',    'Support@123', 'Trần Thị Lan',     'support',    'Phòng Chăm sóc Khách hàng',    '0977654321', 'TL', '#14b8a6', 'active', '12/03/2025', '10/06/2026 07:50', 200, 14, 0),
  ('usr-sp2',     'yen.ngo@crm.vn',    'Emp@1234',    'Ngô Hoàng Yến',    'support',    'Phòng Chăm sóc Khách hàng',    '0966111222', 'HY', '#10b981', 'active', '15/04/2025', '09/06/2026 14:30', 150, 32, 0),
  ('usr-sp3',     'duc.bui@crm.vn',    'Emp@1234',    'Bùi Trọng Đức',    'support',    'Phòng Kỹ thuật Support',       '0966333444', 'TĐ', '#06b6d4', 'active', '01/05/2025', '10/06/2026 08:05', 150, 28, 0)
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 2. COMPANIES (15 B2B accounts so the B2B tab is not empty)
-- ----------------------------------------------------------------
insert into companies (id, name, industry, size, website, phone, address, "contactsCount", "dealsCount", revenue, "ownerId", notes)
select
  'cmp-' || i,
  (array['VNG Corp','Tiki JSC','FPT Software','Viettel Telecom','MISA Software','Đất Xanh Group','Vinamilk Group','Masan Consumer','Techcom Securities','Hoa Phat Group','TH True Milk','Vingroup JSC','Sendo Vietnam','Bách Hóa Xanh','Thế Giới Di Động'])[i],
  (array['Công nghệ thông tin','Tài chính ngân hàng','Y tế & Dược phẩm','Bán lẻ thương mại','Sản xuất thiết bị','Giáo dục & Đào tạo','Bất động sản','F&B thực phẩm','Vận tải Logistics'])[1 + (i % 9)],
  (array['10-50 nhân sự','50-200 nhân sự','200-500 nhân sự','500-1000 nhân sự','1000+ nhân sự'])[1 + (i % 5)],
  'https://company' || i || '.com.vn',
  '028' || lpad((3800000 + i * 137)::text, 7, '0'),
  (10 + i * 17) || ' Đường Nguyễn Huệ, Quận 1, TPHCM',
  2, 1 + (i % 3),
  (500 + i * 73)::bigint * 10000000,
  (array['usr-sales','usr-s2','usr-s3','usr-s4','usr-s5'])[1 + (i % 5)],
  'Khách hàng B2B tiềm năng cao, cơ cấu quản lý tinh gọn.'
from generate_series(1, 15) as i
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 3. CONTACTS - 500 B2C CUSTOMERS
-- ----------------------------------------------------------------
insert into contacts (id, "firstName", "lastName", "fullName", title, "companyId", "companyName", phone, email, source, "ownerId", tags, "dealsCount", "lastActivity", "createdAt", notes)
select
  'con-' || i,
  fn.v, ln.v,
  ln.v || ' ' || md.v || ' ' || fn.v,
  'Khách tiêu dùng cá nhân',
  null, '',
  '09' || lpad((10000000 + i * 37)::text, 8, '0'),
  fn.slug || '.' || ln.slug || i || '@' || (array['gmail.com','yahoo.com','outlook.com.vn','hotmail.com'])[1 + (i % 4)],
  (array['Facebook Ads','Google Search Form','Referral Partner','Cold Calling Campaign','Zalo OA Fanpage','LinkedIn Sales Navigator','Tech Exhibition','Outbound Email blast'])[1 + (i % 8)],
  (array['usr-sales','usr-s2','usr-s3','usr-s4','usr-s5','usr-s6','usr-s7','usr-s8','usr-s9','usr-s10'])[1 + (i % 10)],
  to_jsonb((array['VIP','Khách lẻ','Thân thiết','Hợp đồng mới','Tiềm năng','Khó tính'])[1 + (i % 6)]),
  (i % 4),
  lpad((1 + (i * 7) % 28)::text, 2, '0') || '/0' || (5 + (i % 2)) || '/2026',
  lpad((1 + (i * 11) % 28)::text, 2, '0') || '/0' || (1 + (i % 5)) || '/2026',
  'Khách hàng cá nhân B2C, quan tâm trải nghiệm dịch vụ trực tiếp.'
from generate_series(1, 500) as i
cross join lateral (
  select (array['An','Bình','Châu','Dũng','Hải','Anh','Triệu','Chiến','Huy','Linh','Cường','Trang','Phương','Hoàng','Minh','Nam','Sơn','Tuấn','Vũ','Yến','Lan','Hương','Khánh','Duy','Đức','Thảo','Quân','Hà','Loan','Phúc','Tâm','Vy'])[1 + ((i * 7) % 32)] as v,
         (array['an','binh','chau','dung','hai','anh','trieu','chien','huy','linh','cuong','trang','phuong','hoang','minh','nam','son','tuan','vu','yen','lan','huong','khanh','duy','duc','thao','quan','ha','loan','phuc','tam','vy'])[1 + ((i * 7) % 32)] as slug
) fn
cross join lateral (
  select (array['Nguyễn','Trần','Lê','Phạm','Vũ','Hoàng','Phan','Bùi','Ngô','Đặng','Đỗ','Hồ','Dương','Lý'])[1 + ((i * 3) % 14)] as v,
         (array['nguyen','tran','le','pham','vu','hoang','phan','bui','ngo','dang','do','ho','duong','ly'])[1 + ((i * 3) % 14)] as slug
) ln
cross join lateral (
  select (array['Văn','Thị','Đức','Minh','Ngọc','Hữu','Thanh','Xuân'])[1 + ((i * 5) % 8)] as v
) md
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 4. LEADS - 60 leads in the funnel (mostly B2C)
-- ----------------------------------------------------------------
insert into leads (id, "leadType", name, company, phone, email, source, status, value, "ownerId", "createdAt", deadline, priority, notes, tags)
select
  'led-' || i,
  case when i % 5 = 0 then 'b2b' else 'b2c' end,
  (array['Nguyễn','Đặng','Trần','Lê','Phú','Bùi','Đỗ'])[1 + (i % 7)] || ' ' ||
  (array['Kim','Thành','Vinh','Khánh','Sơn','Vân','Kiên','Tài','Hạnh','Cường'])[1 + (i % 10)],
  case when i % 5 = 0
    then (array['Đại lý Thép Cường Lực','Gia dụng Minh Phát','Logistics Thành Công','Dệt may Việt Nam','Xây dựng Hòa Bình','Hải sản Tươi Sống','Nội thất Decor'])[1 + (i % 7)]
    else 'Khách hàng cá nhân' end,
  '08' || lpad((20000000 + i * 53)::text, 8, '0'),
  'lead' || i || '@outlook.com.vn',
  (array['Facebook Ads','Google Search Form','Referral Partner','Cold Calling Campaign','Zalo OA Fanpage','LinkedIn Sales Navigator','Tech Exhibition','Outbound Email blast'])[1 + (i % 8)],
  (array['new','contacting','qualified','proposal','lost','new'])[1 + (i % 6)],
  (20 + (i * 13) % 180) * 1000000,
  (array['usr-sales','usr-s2','usr-s3','usr-s4','usr-s5','usr-s6','usr-s7','usr-s8','usr-s9'])[1 + (i % 9)],
  lpad((1 + (i * 9) % 28)::text, 2, '0') || '/0' || (5 + (i % 2)) || '/2026',
  '30/06/2026',
  (array['hot','warm','cold'])[1 + (i % 3)],
  case when i % 5 = 0 then 'Nhu cầu mua hàng lớn, quan tâm quy chuẩn hỗ trợ kỹ thuật.' else 'Khách hàng cá nhân có nhu cầu tư vấn giải pháp trực tiếp gia đình.' end,
  to_jsonb(case when i % 5 = 0 then 'Khách-Mới, B2B-SMB' else 'Khách-Mới, B2C-Retail' end)
from generate_series(1, 60) as i
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 5. DEALS - 40 B2C retail deals (linked to real contacts) + 10 B2B
-- ----------------------------------------------------------------
insert into deals (id, name, "contactId", "contactName", "companyId", "companyName", value, stage, probability, "ownerId", "expectedClose", "createdAt", "lastActivity", notes, tags)
select
  'dea-' || c.rn,
  'Đơn bán lẻ - ' || c."fullName",
  c.id, c."fullName",
  null, 'Khách lẻ cá nhân',
  (8 + (c.rn * 7) % 72) * 1000000,
  st.stage,
  st.prob,
  c."ownerId",
  '28/06/2026',
  lpad((1 + (c.rn * 3) % 28)::text, 2, '0') || '/05/2026',
  lpad((1 + (c.rn * 5) % 28)::text, 2, '0') || '/06/2026',
  'Bán lẻ giải pháp cá nhân tiêu dùng trực tiếp.',
  to_jsonb('Hóa-Đơn-Cá-Nhân, B2C'::text)
from (
  select *, row_number() over (order by seq) as rn
  from contacts order by seq limit 40
) c
cross join lateral (
  select
    (array['prospecting','qualified','proposal','negotiation','closed_won','closed_lost'])[1 + (c.rn % 6)] as stage,
    (array[20, 40, 60, 80, 100, 0])[1 + (c.rn % 6)] as prob
) st
on conflict (id) do nothing;

insert into deals (id, name, "contactId", "contactName", "companyId", "companyName", value, stage, probability, "ownerId", "expectedClose", "createdAt", "lastActivity", notes, tags)
select
  'dea-b2b-' || co.rn,
  'Hợp đồng cung cấp cho ' || co.name,
  'con-b2b-' || co.rn,
  'Người đại diện ' || co.name,
  co.id, co.name,
  (120 + (co.rn * 91) % 680) * 1000000,
  (array['prospecting','qualified','proposal','negotiation','closed_won'])[1 + (co.rn % 5)],
  (array[20, 40, 60, 80, 100])[1 + (co.rn % 5)],
  co."ownerId",
  '30/06/2026',
  lpad((1 + (co.rn * 2) % 28)::text, 2, '0') || '/05/2026',
  lpad((1 + (co.rn * 4) % 28)::text, 2, '0') || '/06/2026',
  'Sản phẩm chủ lực B2B SaaS, thời hiệu thanh khoản nhanh.',
  to_jsonb('Hợp-Đồng, B2B, VIP'::text)
from (
  select *, row_number() over (order by seq) as rn
  from companies order by seq limit 10
) co
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 6. PRODUCTS / SERVICES
-- ----------------------------------------------------------------
insert into products (id, name, code, category, price, unit, stock, description, emoji, status) values
  ('prd-1', 'Gói Phần mềm Aura CRM Pro License', 'AURA-PRO-101',  'Part',     15000000,  'Gói/Năm', 120, 'Giải pháp CRM cốt lõi hệ sinh thái Aura.', '💻', 'active'),
  ('prd-2', 'Phần mềm HRM Quản lý Nhân sự Core', 'AURA-HRM-202',  'Part',     12000000,  'Gói/Năm', 80,  'Quản trị nhân sự, chấm công, lương thưởng.', '👥', 'active'),
  ('prd-3', 'Giải pháp ERP Oracle Suite',        'AURA-ERP-303',  'Part',     120000000, 'Gói/Năm', 25,  'ERP tích hợp toàn diện cho doanh nghiệp.', '📊', 'active'),
  ('prd-4', 'Dịch vụ Triển khai On-Premise',     'SRV-DEPLOY-404','Service',  45000000,  'Dự án',   50,  'Triển khai hạ tầng tại chỗ trọn gói.', '🛠️', 'active'),
  ('prd-5', 'Khóa Đào tạo End-User Sales',       'SRV-TRAIN-505', 'Service',  8000000,   'Khóa',    200, 'Đào tạo sử dụng hệ thống cho đội Sales.', '📚', 'active'),
  ('prd-6', 'Máy chủ Server Dell PowerEdge',     'HW-SERVER-606', 'Hardware', 85000000,  'Chiếc',   15,  'Server vật lý chuyên dụng datacenter.', '🖥️', 'active'),
  ('prd-7', 'Hệ thống Call Center tích hợp',     'HW-CALLER-707', 'Hardware', 25000000,  'Hệ thống',30,  'Tổng đài chăm sóc khách hàng đa kênh.', '📞', 'active'),
  ('prd-8', 'Tư vấn Chuyển đổi số Doanh nghiệp', 'CNS-TRANS-808', 'Consult',  35000000,  'Dự án',   999, 'Tư vấn lộ trình chuyển đổi số tổng thể.', '💡', 'active')
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 7. TASKS - 30 follow-up tasks
-- ----------------------------------------------------------------
insert into tasks (id, title, type, description, "relatedTo", "relatedId", "ownerId", "dueDate", priority, status, completed, subtasks, tags)
select
  'tsk-' || i,
  (array['Gọi điện thương thuyết báo giá','Gửi thư follow up hợp đồng mới','Họp trực tiếp chốt số lượng','Demo tính năng sản phẩm','Nộp đề xuất phương án kỹ thuật','Liên hệ hỗ trợ khách hàng'])[1 + (i % 6)] || ' - Deal #' || (1 + (i % 40)),
  (array['call','email','meeting','demo','proposal','call'])[1 + (i % 6)],
  'Thực hiện đúng thời gian cam kết của khách hàng, cập nhật kết quả lên hệ thống.',
  'Deal',
  'dea-' || (1 + (i % 40)),
  (array['usr-sales','usr-s2','usr-s3','usr-s4','usr-s5','usr-s6','usr-s7','usr-support'])[1 + (i % 8)],
  lpad((10 + (i % 18))::text, 2, '0') || '/06/2026',
  (array['high','medium','low'])[1 + (i % 3)],
  (array['not_started','in_progress','completed'])[1 + (i % 3)],
  (i % 3 = 2),
  '[{"id":"sub-1","title":"Chuẩn bị slide dữ liệu","checked":true},{"id":"sub-2","title":"Đối chiếu biểu phí","checked":false}]'::jsonb,
  to_jsonb('Cần-Làm'::text)
from generate_series(1, 30) as i
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 8. ACTIVITIES - 60 logged interactions
-- ----------------------------------------------------------------
insert into activities (id, type, title, "contactId", "dealId", "ownerId", datetime, duration, outcome, notes, direction)
select
  'act-' || i,
  ty.v,
  case ty.v when 'call' then '📞 Cuộc gọi' when 'email' then '📧 Outbound Email' when 'meeting' then '📅 Cuộc họp' else '📝 Note ngắn' end || ' với khách hàng #' || (1 + (i * 13) % 500),
  'con-' || (1 + (i * 13) % 500),
  'dea-' || (1 + (i % 40)),
  (array['usr-sales','usr-s2','usr-s3','usr-s4','usr-s5','usr-s6'])[1 + (i % 6)],
  lpad((1 + (i * 3) % 28)::text, 2, '0') || '/06/2026 ' || lpad((8 + (i % 9))::text, 2, '0') || ':00',
  (10 + (i * 7) % 35) || ' phút',
  (array['Interested / Ghi nhận','No Answer / Gọi lại sau','Hẹn lịch họp bàn','Yêu cầu sửa đổi báo giá','Đã chốt xong','Bàn giao kỹ thuật thành công'])[1 + (i % 6)],
  'Trao đổi về cơ cấu tính giá, thời gian triển khai dự án.',
  case when i % 2 = 0 then 'inbound' else 'outbound' end
from generate_series(1, 60) as i
cross join lateral (
  select (array['call','email','meeting','note'])[1 + (i % 4)] as v
) ty
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 9. QUOTES - 12 quotations
-- ----------------------------------------------------------------
insert into quotes (id, number, "contactId", "contactName", "dealId", items, subtotal, vat, total, status, "createdAt", "validUntil", "ownerId", terms, notes)
select
  'qte-' || i,
  'BG-2026-' || lpad(i::text, 4, '0'),
  d."contactId", d."contactName", d.id,
  jsonb_build_array(
    jsonb_build_object('id', 'prd-' || (1 + (i % 8)), 'name', 'Gói giải pháp Aura #' || (1 + (i % 8)), 'price', 15000000 + (i % 8) * 2500000, 'qty', 1),
    jsonb_build_object('id', 'prd-' || (1 + ((i + 3) % 8)), 'name', 'Dịch vụ triển khai #' || (1 + ((i + 3) % 8)), 'price', 8000000, 'qty', 2)
  ),
  (15000000 + (i % 8) * 2500000) + 16000000,
  round(((15000000 + (i % 8) * 2500000) + 16000000) * 0.1),
  round(((15000000 + (i % 8) * 2500000) + 16000000) * 1.1),
  (array['nhap','da_gui','xem_xet','chap_nhan','tu_choi'])[1 + (i % 5)],
  lpad((1 + (i * 2) % 28)::text, 2, '0') || '/06/2026',
  '30/06/2026',
  d."ownerId",
  'Phương thức thanh toán: Chuyển khoản Techcombank 100% khi bàn giao giấy phép.',
  'Báo giá chiết khấu 5% cho khách hàng thân thiết.'
from (
  select *, row_number() over (order by seq) as rn from deals order by seq limit 12
) d
cross join lateral (select d.rn as i) x
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 10. INVOICES - 10 invoices (AR ledger)
-- ----------------------------------------------------------------
insert into invoices (id, number, "quoteId", "contactId", "contactName", "dealId", "companyName", items, amount, total, status, "dueDate", "paidAt", "createdAt", notes)
select
  'inv-' || i,
  'HD-2026-' || lpad(i::text, 4, '0'),
  'qte-' || (1 + (i % 12)),
  d."contactId", d."contactName", d.id, d."companyName",
  jsonb_build_array(jsonb_build_object('id', 'prd-' || (1 + (i % 8)), 'name', 'Gói giải pháp Aura #' || (1 + (i % 8)), 'price', d.value, 'qty', 1)),
  d.value,
  round(d.value * 1.1),
  (array['paid','partial','overdue','pending'])[1 + (i % 4)],
  '28/06/2026',
  case when i % 4 = 1 then lpad((1 + (i * 2) % 28)::text, 2, '0') || '/06/2026' else null end,
  lpad((1 + i % 28)::text, 2, '0') || '/06/2026',
  'Hóa đơn giá trị gia tăng đối chiếu công nợ phát sinh trực tiếp.'
from (
  select *, row_number() over (order by seq) as rn from deals order by seq limit 10
) d
cross join lateral (select d.rn as i) x
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 11. TICKETS - 25 support tickets
-- ----------------------------------------------------------------
insert into tickets (id, number, subject, "contactId", "contactName", channel, priority, status, "agentId", "createdAt", "lastReply", "slaHours", tags, messages)
select
  'tk-' || i,
  'TK-' || lpad(i::text, 4, '0'),
  (array['Lỗi đồng bộ dữ liệu API CRM','Không gửi được SMS Brandname','Mất kết nối máy chủ Cloud miền Nam','Lỗi phân quyền nhân viên','Lỗi tạo tài khoản mới','Hỏi tài liệu hướng dẫn Zalo OA'])[1 + (i % 6)],
  'con-' || (1 + (i * 19) % 500),
  'Khách hàng #' || (1 + (i * 19) % 500),
  (array['Email','Chat','Phone','Web'])[1 + (i % 4)],
  (array['Critical','High','Medium','Low'])[1 + (i % 4)],
  (array['open','pending','resolved','escalated'])[1 + (i % 4)],
  (array['usr-support','usr-sp2','usr-sp3'])[1 + (i % 3)],
  lpad((1 + (i * 2) % 28)::text, 2, '0') || '/06/2026 10:15',
  lpad((2 + (i * 2) % 27)::text, 2, '0') || '/06/2026 08:30',
  (array[2, 4, 8, 24])[1 + (i % 4)],
  to_jsonb('Lỗi-Hệ-Thống'::text),
  '[{"sender":"customer","text":"Chào bạn, hệ thống hiện không đồng bộ được dữ liệu, vui lòng kiểm tra gấp giúp.","time":"10:15"},{"sender":"agent","text":"Dạ em đã tiếp nhận thông tin, đang chuyển bộ phận kỹ thuật kiểm tra.","time":"10:30"}]'::jsonb
from generate_series(1, 25) as i
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 12. AUDIT LOG + NOTIFICATIONS
-- ----------------------------------------------------------------
insert into audit_log (id, timestamp, "user", action, resource, ip, status)
select
  'adt-' || i,
  '10/06/2026 08:' || lpad((10 + i)::text, 2, '0'),
  (array['Cao Khải Hoàn','Lê Nhật Ánh','Đặng Việt Triều','Trần Thị Lan','Phạm Minh Hoàng'])[1 + (i % 5)],
  (array['Đăng nhập','Xem chi tiết','Cập nhật thông tin','Khởi tạo thành công','Duyệt chi phí'])[1 + (i % 5)],
  (array['Leads','Deals','Quotations','Invoices','Users','Settings','Tickets'])[1 + (i % 7)],
  '192.168.1.' || (10 + i * 7),
  'thanh_cong'
from generate_series(1, 25) as i
on conflict (id) do nothing;

insert into notifications (id, type, title, body, time, unread)
select
  'ntf-' || i,
  (array['new_lead','deal_update','task_due','deal_won','ticket_assigned','mention','system','payment_received'])[1 + (i % 8)],
  'Hệ thống thông báo thông minh',
  'Bản ghi vừa được cập nhật tiến trình vào lúc ' || (1 + i) || ' giờ trước, vui lòng nhấp để kiểm tra.',
  (1 + (i % 12)) || ' giờ trước',
  (i <= 6)
from generate_series(1, 15) as i
on conflict (id) do nothing;

-- ----------------------------------------------------------------
-- 13. REVENUE HISTORY (12 months)
-- ----------------------------------------------------------------
insert into revenue_months (id, month, revenue, "wonDeals") values
  ('rev-01', 'T7/25',  950000000,  14),
  ('rev-02', 'T8/25',  1100000000, 15),
  ('rev-03', 'T9/25',  1050000000, 13),
  ('rev-04', 'T10/25', 1250000000, 18),
  ('rev-05', 'T11/25', 1400000000, 21),
  ('rev-06', 'T12/25', 1850000000, 28),
  ('rev-07', 'T1/26',  1300000000, 16),
  ('rev-08', 'T2/26',  1500000000, 19),
  ('rev-09', 'T3/26',  1680000000, 22),
  ('rev-10', 'T4/26',  1950000000, 25),
  ('rev-11', 'T5/26',  2150000000, 30),
  ('rev-12', 'T6/26',  1240000000, 17)
on conflict (id) do nothing;
