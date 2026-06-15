// Full staff CRUD by admin, verifying each step reflects on Supabase:
// create -> edit -> delete (a throwaway account, so real seed users untouched).
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWx0dG5xZW9xd3RtdHF6bGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzkzNDIsImV4cCI6MjA5Njc1NTM0Mn0.IbRfyMhOhVVJcP6Ck6Y7wDLm3ZRF8C39guzdnCVvQEs';
const hdr = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const stamp = Date.now();
const EMAIL = `crud.test.${stamp}@example.com`;
const EMAIL2 = `crud.edited.${stamp}@example.com`;
const check = (label, ok) => console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);
const sbGet = async (q) => {
  const res = await fetch(`https://taalttnqeoqwtmtqzlgp.supabase.co/rest/v1/staff_users?${q}`, { headers: hdr });
  return res.json();
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#login-email', { timeout: 30000 });
await page.fill('#login-email', 'cskh.mcna.247@gmail.com');
await page.fill('#login-pw', 'Admin@123');
await page.click('#login-form button[type="submit"]');
await page.waitForTimeout(2500);
await page.click('.ni[data-page="users"]');
await page.waitForSelector('#users-create-btn', { timeout: 12000 });

// CREATE
await page.click('#users-create-btn');
await page.waitForSelector('#cu-name', { timeout: 8000 });
await page.fill('#cu-name', 'Crud Test User');
await page.selectOption('#cu-role', 'sales');
await page.fill('#cu-email', EMAIL);
await page.fill('#cu-phone', '0900000111');
await page.fill('#cu-pw', 'Mcna@1234');
await page.click('#cu-save-btn');
await page.waitForTimeout(8000);
let row = await sbGet(`select=id,email,role&email=eq.${encodeURIComponent(EMAIL)}`);
const userId = row[0]?.id;
check('CREATE -> staff row tren Supabase', !!userId);

// EDIT (change email + role to manager)
await page.evaluate((id) => window.crmApp.openUserEditModal(id), userId);
await page.waitForSelector('#ue-email', { timeout: 8000 });
await page.fill('#ue-email', EMAIL2);
await page.selectOption('#ue-role', 'manager');
await page.fill('#ue-dept', 'Marketing CRUD');
await page.click('button:has-text("Lưu thay đổi")');
await page.waitForTimeout(8000);
row = await sbGet(`select=email,role,dept&id=eq.${userId}`);
check('EDIT -> Supabase cap nhat email+role+dept', row[0]?.email === EMAIL2 && row[0]?.role === 'manager' && row[0]?.dept === 'Marketing CRUD');

// DELETE
page.on('dialog', d => d.accept()); // auto-confirm the delete prompt
await page.evaluate((id) => window.crmApp.deleteStaffUser(id), userId);
await page.waitForTimeout(8000);
row = await sbGet(`select=id&id=eq.${userId}`);
check('DELETE -> staff row da bi xoa khoi Supabase', Array.isArray(row) && row.length === 0);

await browser.close();
console.log('User-mgmt CRUD e2e finished.');
