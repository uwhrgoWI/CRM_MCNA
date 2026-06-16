import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://crm-mcna.vercel.app', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
// confirm the logo <img> actually loaded (naturalWidth > 0)
const ok = await page.evaluate(() => {
  const img = document.querySelector('.logo-img img');
  return img ? (img.complete && img.naturalWidth > 0) : false;
});
console.log('Login logo image loaded:', ok ? 'PASS' : 'FAIL');
await page.screenshot({ path: 'scripts/login-logo.png' });
// log in to check sidebar logo
await page.fill('#login-email', 'cskh.mcna.247@gmail.com');
await page.fill('#login-pw', 'Admin@123');
await page.click('#login-form button[type="submit"]');
await page.waitForTimeout(2500);
const sideOk = await page.evaluate(() => {
  const img = document.querySelector('.sb .logo-img img, #main-sidebar .logo-img img');
  return img ? (img.complete && img.naturalWidth > 0) : false;
});
console.log('Sidebar logo image loaded:', sideOk ? 'PASS' : 'FAIL');
await page.screenshot({ path: 'scripts/sidebar-logo.png' });
await browser.close();
