// RBAC + privacy regression test for the 5 reported bugs.
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const browser = await chromium.launch();

async function loginAs(email, pw) {
  const page = await browser.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#login-email', { timeout: 30000 });
  await page.fill('#login-email', email);
  await page.fill('#login-pw', pw);
  await page.click('#login-form button[type="submit"]');
  await page.waitForTimeout(2500);
  return page;
}
const has = async (page, sel) => (await page.locator(sel).count()) > 0;
const check = (label, ok) => console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);

// ---- BUG 3: marketer must NOT see quotes/invoices ----
const mgr = await loginAs('manager@crm.vn', 'Manager@123');
check('Bug3: Marketer khong thay muc Bao Gia tren sidebar', !(await has(mgr, '.ni[data-page="quotes"]')));
check('Bug3: Marketer khong thay muc Hoa Don tren sidebar', !(await has(mgr, '.ni[data-page="invoices"]')));
check('Bug3: Marketer van tao duoc lead (muc Leads ton tai)', await has(mgr, '.ni[data-page="leads"]'));

// ---- BUG 2: marketer email composer exists on KPI page ----
await mgr.click('.ni[data-page="kpi-calls"]');
await mgr.waitForTimeout(1200);
check('Bug2: Tab ban email Marketers -> Sales hien thi', await has(mgr, '#mkt-mail-rep') && await has(mgr, '#mkt-mail-send-btn'));

// ---- BUG 1: B2C lead detail shows masked channels + reveal works for manager ----
await mgr.click('.ni[data-page="leads"]');
await mgr.waitForTimeout(1200);
// open first B2C lead detail via openLeadDetail with a b2c lead id from page state
const b2cLeadId = await mgr.evaluate(() => {
  const row = document.querySelector('[onclick*="openLeadDetail"]');
  const m = row?.getAttribute('onclick')?.match(/openLeadDetail\('([^']+)'\)/);
  return m ? m[1] : null;
});
if (b2cLeadId) {
  await mgr.evaluate((id) => window.crmApp.openLeadDetail(id), b2cLeadId);
  await mgr.waitForTimeout(800);
  const masked = await mgr.evaluate(() => document.getElementById('sec-lead-phone')?.value || '');
  const hasDots = masked.includes('•');
  await mgr.evaluate((id) => window.crmApp.revealSecuredField('lead', id, 'phone'), b2cLeadId);
  await mgr.waitForTimeout(500);
  const revealed = await mgr.evaluate(() => document.getElementById('sec-lead-phone')?.value || '');
  check('Bug1: SDT lead B2C duoc che mac dinh (khong random)', hasDots);
  check('Bug1: Quan ly giai ma duoc SDT (co audit)', /^0\d{9}/.test(revealed));
} else {
  check('Bug1: tim duoc lead B2C de test', false);
}
await mgr.close();

// ---- BUG 4: support only sees SLA ----
const sup = await loginAs('support@crm.vn', 'Support@123');
const supLeads = await has(sup, '.ni[data-page="leads"]');
const supQuotes = await has(sup, '.ni[data-page="quotes"]');
const supInvoices = await has(sup, '.ni[data-page="invoices"]');
const supTasks = await has(sup, '.ni[data-page="tasks"]');
const supContacts = await has(sup, '.ni[data-page="contacts"]');
const supFunnel = await has(sup, '.ni[data-page="mcna-funnel"]');
const supTickets = await has(sup, '.ni[data-page="tickets"]');
check('Bug4: Support CHI con SLA Tickets (khong leads/quotes/invoices/tasks/contacts/funnel)',
  supTickets && !supLeads && !supQuotes && !supInvoices && !supTasks && !supContacts && !supFunnel);
await sup.close();

// ---- BUG 5: sales invoices page hides debt columns ----
const sal = await loginAs('sales@crm.vn', 'Sales@123');
await sal.click('.ni[data-page="invoices"]');
await sal.waitForTimeout(1500);
const pageText = (await sal.evaluate(() => document.querySelector('main, #app-root').innerText)).toLowerCase();
const hasDebtCol = pageText.includes('dư nợ / công nợ') || pageText.includes('đã thu hồi (vnd)') || pageText.includes('dòng tiền thực thu');
const hasValueCol = pageText.includes('giá trị hợp đồng') && pageText.includes('hạn thanh toán') && pageText.includes('trạng thái thu hồi');
const hasNaN = pageText.includes('nan');
check('Bug5: Sales KHONG thay Du no/Cong no/Da thu hoi', !hasDebtCol);
check('Bug5: Sales VAN thay Gia tri hop dong + Han thanh toan + Trang thai', hasValueCol);
check('Bug5b: Khong con NaN tren the tong gia tri', !hasNaN);
check('Bug1b: SDT khach trong bang hoa don da duoc che', pageText.includes('•'));
await sal.screenshot({ path: 'scripts/sales-invoices.png', fullPage: false });
await sal.close();

await browser.close();
console.log('RBAC e2e finished.');
