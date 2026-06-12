// Verifies the full assignment-email chain on production:
// manager creates a lead for usr-sales -> /api/notify sends via SMTP -> outbox 'sent'
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const PHONE = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
console.log('Test phone:', PHONE);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.text().includes('Supabase')) console.log('[console]', m.text()); });

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
await page.fill('#m-lead-name', 'Lê Email Thật');
await page.fill('#m-lead-phone', PHONE);
await page.fill('#m-lead-email', `khach.${Date.now()}@example.com`);
await page.selectOption('#m-lead-owner', 'usr-sales');
await page.fill('#m-lead-val', '0');
await page.click('#m-save-lead-btn-action');
await page.waitForTimeout(9000); // wait for /api/notify + sync loop

await browser.close();

// Check outbox status from Supabase
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWx0dG5xZW9xd3RtdHF6bGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzkzNDIsImV4cCI6MjA5Njc1NTM0Mn0.IbRfyMhOhVVJcP6Ck6Y7wDLm3ZRF8C39guzdnCVvQEs';
const r = await fetch('https://taalttnqeoqwtmtqzlgp.supabase.co/rest/v1/email_outbox?select=toEmail,subject,status,error,sentAt&order=seq.desc&limit=1', {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
});
const rows = await r.json();
console.log('Outbox moi nhat:', JSON.stringify(rows, null, 1));
console.log('KET QUA:', rows[0]?.status === 'sent' && rows[0]?.subject.includes(PHONE) ? 'PASS - email da gui that' : 'CHECK LAI');
