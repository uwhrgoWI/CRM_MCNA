// Tests the "to be updated" lead workflow:
// 1. Marketer creates a lead WITHOUT a rep -> status to_be_updated, no owner
// 2. The lead shows "To be updated" + a "Chia" button for the manager
// 3. Manager distributes it to a sales rep -> owner set, email queued/sent
import { chromium } from 'playwright';

const BASE = 'https://crm-mcna.vercel.app';
const PHONE = '09' + String(Math.floor(10000000 + Math.random() * 89999999));
const NAME = 'Phan Tobe Updated';
console.log('Test phone:', PHONE);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.text().includes('Supabase')) console.log('[console]', m.text()); });
const check = (label, ok) => console.log(`${ok ? 'PASS' : 'FAIL'} - ${label}`);

// ---- Marketer creates an UNASSIGNED lead ----
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

// default owner for a marketer should be the unassigned option
const defaultOwner = await page.evaluate(() => document.getElementById('m-lead-owner').value);
check('Marketer mac dinh chon "Chua phan" (owner rong)', defaultOwner === '');

await page.fill('#m-lead-name', NAME);
await page.fill('#m-lead-phone', PHONE);
await page.fill('#m-lead-email', `tbu.${Date.now()}@example.com`);
await page.selectOption('#m-lead-owner', ''); // explicitly unassigned
await page.fill('#m-lead-val', '0');
await page.click('#m-save-lead-btn-action');
await page.waitForTimeout(2000);

// switch to the To be updated tab
await page.click('.tab[data-tab="to_be_updated"]');
await page.waitForTimeout(1000);
const tbuVisible = await page.locator(`text=${NAME}`).first().isVisible().catch(() => false);
const badgeVisible = (await page.locator('text=To be updated').count()) > 0;
const chiaBtn = (await page.locator('button:has-text("Chia")').count()) > 0;
check('Lead chua phan nam o tab "To be updated"', tbuVisible);
check('Hien badge "To be updated" + nut "Chia"', badgeVisible && chiaBtn);

// ---- Manager distributes the lead (click the row's "Chia" button) ----
// find the lead id from the row containing our test name
const leadId = await page.evaluate((nm) => {
  const rows = [...document.querySelectorAll('table.tw tbody tr')];
  const row = rows.find(r => r.innerText.includes(nm));
  if (!row) return null;
  const btn = row.querySelector('button[onclick*="openAssignLeadModal"]');
  const m = btn?.getAttribute('onclick')?.match(/openAssignLeadModal\('([^']+)'\)/);
  return m ? m[1] : null;
}, NAME);
check('Tim duoc nut Chia tren dong lead chua phan', !!leadId);

await page.evaluate((id) => window.crmApp.openAssignLeadModal(id), leadId);
await page.waitForSelector('#assign-lead-rep', { timeout: 8000 });
await page.selectOption('#assign-lead-rep', 'usr-sales');
await page.click('button:has-text("Chia Lead cho Sales")');
await page.waitForTimeout(2500);

await page.waitForTimeout(6000); // let sync push to Supabase
await browser.close();

// verify on Supabase
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWx0dG5xZW9xd3RtdHF6bGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzkzNDIsImV4cCI6MjA5Njc1NTM0Mn0.IbRfyMhOhVVJcP6Ck6Y7wDLm3ZRF8C39guzdnCVvQEs';
const r = await fetch(`https://taalttnqeoqwtmtqzlgp.supabase.co/rest/v1/leads?select=name,status,ownerId&phone=eq.${PHONE}`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` }
});
console.log('Supabase lead row:', JSON.stringify(await r.json()));
console.log('TBU e2e finished.');
