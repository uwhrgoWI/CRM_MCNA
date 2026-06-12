// Opens the production site headless and captures console output + network
// failures to diagnose why the app falls back to offline mode.
import { chromium } from 'playwright';

const logs = [];
const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => logs.push(`[console.${msg.type()}] ${msg.text()}`));
page.on('pageerror', err => logs.push(`[pageerror] ${err.message}`));
page.on('requestfailed', req => logs.push(`[requestfailed] ${req.url()} -> ${req.failure()?.errorText}`));
page.on('response', res => {
  if (res.status() >= 400) logs.push(`[http ${res.status()}] ${res.url()}`);
});

await page.goto('https://crm-mcna.vercel.app', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(8000);

// Detect which mode the app booted in by counting in-memory data via the toast/log
const title = await page.title();
console.log('TITLE:', title);
console.log('--- LOGS ---');
for (const l of logs) console.log(l);

await page.screenshot({ path: 'scripts/live-screenshot.png', fullPage: false });
await browser.close();
