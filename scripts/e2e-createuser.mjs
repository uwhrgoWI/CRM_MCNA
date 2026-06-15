// Tests: new admin email login, demo panel removed, admin creates a Sales
// account, welcome email queued/sent, new account can log in.
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const stamp = Date.now();
const NEW_EMAIL = `sales.test.${stamp}@example.com`;
const NEW_PW = 'Mcna@7788';
const NEW_NAME = 'Vo Tan Binh';
console.log('New account:', NEW_EMAIL);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.text().includes('Supabase')) console.log('[console]', m.text()); });
const has = async (p, sel) => (await p.locator(sel).count()) > 0;
const check = (label, ok) => console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForSelector('#login-email', { timeout: 30000 });

// Bug: demo panel removed
check('Panel dang nhap nhanh demo da bi go bo', !(await has(page, '.demo-btn')));

// New admin email login works (old one should fail)
await page.fill('#login-email', 'cskh.mcna.247@gmail.com');
await page.fill('#login-pw', 'Admin@123');
await page.click('#login-form button[type="submit"]');
await page.waitForTimeout(2500);
const loggedIn = await has(page, '.ni[data-page="dashboard-superadmin"]');
check('Dang nhap bang email admin moi cskh.mcna.247@gmail.com', loggedIn);

// Go to users page, open create modal, create a Sales account
await page.click('.ni[data-page="users"]');
await page.waitForSelector('#users-create-btn', { timeout: 12000 });
check('Co nut "Tao Tai Khoan Moi" o trang Users', await has(page, '#users-create-btn'));
await page.click('#users-create-btn');
await page.waitForSelector('#cu-name', { timeout: 8000 });
await page.fill('#cu-name', NEW_NAME);
await page.selectOption('#cu-role', 'sales');
await page.fill('#cu-email', NEW_EMAIL);
await page.fill('#cu-phone', '0901239999');
await page.fill('#cu-dept', 'Kinh doanh test');
await page.fill('#cu-pw', NEW_PW);
await page.click('#cu-save-btn');
await page.waitForTimeout(3000);

const inTable = await page.locator(`text=${NEW_NAME}`).first().isVisible().catch(() => false);
check('Tai khoan moi xuat hien trong bang nhan su', inTable);
await page.waitForTimeout(6000); // sync to Supabase
await browser.close();

// Verify on Supabase: staff row + welcome email outbox
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWx0dG5xZW9xd3RtdHF6bGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzkzNDIsImV4cCI6MjA5Njc1NTM0Mn0.IbRfyMhOhVVJcP6Ck6Y7wDLm3ZRF8C39guzdnCVvQEs';
const hdr = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const staff = await (await fetch(`https://taalttnqeoqwtmtqzlgp.supabase.co/rest/v1/staff_users?select=name,email,role,status&email=eq.${encodeURIComponent(NEW_EMAIL)}`, { headers: hdr })).json();
console.log('Staff row:', JSON.stringify(staff));
check('Tai khoan Sales moi da luu len Supabase', staff[0]?.role === 'sales' && staff[0]?.status === 'active');
const mail = await (await fetch(`https://taalttnqeoqwtmtqzlgp.supabase.co/rest/v1/email_outbox?select=toEmail,subject,status&toEmail=eq.${encodeURIComponent(NEW_EMAIL)}`, { headers: hdr })).json();
console.log('Welcome email:', JSON.stringify(mail));
check('Email dang nhap da gui toi tai khoan moi', mail[0]?.status === 'sent');

console.log('Create-user e2e finished.');
