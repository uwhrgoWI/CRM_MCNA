// End-to-end test of the CRM pipeline on production:
// 1. Manager creates a lead assigned to usr-sales -> customer mirrored + email queued
// 2. Sales rep opens a verified call session, waits out the minimum duration,
//    logs "not reached" with a reason -> call_logs row with KPI data
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const PHONE = '09' + String(Math.floor(10000000 + Math.random() * 89999999)); // unique per run
const NAME = 'Trần Test Pipeline';

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error' || m.text().includes('Supabase')) console.log('[console]', m.text()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));

console.log('Test phone:', PHONE);

// ---------- Manager session ----------
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#login-email', { timeout: 30000 });
await page.fill('#login-email', 'manager@crm.vn');
await page.fill('#login-pw', 'Manager@123');
await page.click('#login-form button[type="submit"]');
await page.waitForTimeout(2500);

await page.click('.ni[data-page="leads"]');
await page.waitForSelector('#lead-add-modal-trigger', { timeout: 15000 });
await page.click('#lead-add-modal-trigger');
await page.waitForSelector('#m-lead-name', { timeout: 10000 });
await page.fill('#m-lead-name', NAME);
await page.fill('#m-lead-phone', PHONE);
await page.fill('#m-lead-email', `test.pipeline.${Date.now()}@example.com`);
await page.selectOption('#m-lead-owner', 'usr-sales');
await page.fill('#m-lead-val', '0'); // skip the agent pipeline animation
await page.click('#m-save-lead-btn-action');
await page.waitForTimeout(2000);

const mgrState = await page.evaluate(() => ({
  leadTop: window.crmApp && document.body ? null : null,
}));

// check in-memory mirror via the customers page
await page.click('.ni[data-page="contacts"]');
await page.waitForTimeout(1500);
const contactVisible = await page.locator(`text=${NAME}`).first().isVisible().catch(() => false);
console.log('1) Khách hàng B2C hiển thị ở tab Contacts:', contactVisible ? 'PASS' : 'FAIL');

// give the sync loop time to push lead/contact/outbox
await page.waitForTimeout(7000);

// ---------- Sales session (new page = fresh boot from cloud) ----------
const page2 = await browser.newPage();
page2.on('pageerror', e => console.log('[pageerror2]', e.message));
await page2.goto(BASE, { waitUntil: 'networkidle' });
await page2.waitForSelector('#login-email', { timeout: 30000 });
await page2.fill('#login-email', 'sales@crm.vn');
await page2.fill('#login-pw', 'Sales@123');
await page2.click('#login-form button[type="submit"]');
await page2.waitForTimeout(2500);

await page2.click('.ni[data-page="kpi-calls"]');
await page2.waitForSelector('#kpi-call-target', { timeout: 15000 });

// pick the lead we just created (matched by phone)
const optValue = await page2.evaluate((phone) => {
  const sel = document.getElementById('kpi-call-target');
  const opt = [...sel.options].find(o => o.textContent.includes(phone));
  if (opt) { sel.value = opt.value; return opt.value; }
  return null;
}, PHONE);
console.log('2) Lead mới xuất hiện trong danh sách gọi của sales:', optValue ? 'PASS' : 'FAIL');

if (optValue) {
  await page2.click('button:has-text("Mở phiên gọi")');
  await page2.waitForSelector('#call-dial-btn', { timeout: 10000 });
  await page2.evaluate(() => window.crmApp.beginDial());

  // try to record before the minimum duration -> must be blocked
  await page2.waitForTimeout(3000);
  const blockedEarly = await page2.evaluate(() => document.getElementById('call-finish-btn').disabled);
  console.log('3) Chống gọi ảo - chưa đủ 20s thì không cho ghi nhận:', blockedEarly ? 'PASS' : 'FAIL');

  await page2.waitForTimeout(19000); // total > 20s
  await page2.check('input[name="call-reach"][value="no"]');
  await page2.selectOption('#call-fail-reason', 'Không nghe máy');
  await page2.fill('#call-note', 'E2E: thuê bao không bắt máy, sẽ gọi lại sau');
  await page2.click('#call-finish-btn');
  await page2.waitForTimeout(2000);

  const kpiRow = await page2.locator(`text=Không nghe máy`).first().isVisible().catch(() => false);
  console.log('4) Cuộc gọi + lý do hiển thị trong nhật ký KPI:', kpiRow ? 'PASS' : 'FAIL');
  await page2.screenshot({ path: 'scripts/kpi-page.png', fullPage: true });
  await page2.waitForTimeout(6000); // sync to Supabase
}

await browser.close();
console.log('E2E driver finished.');
