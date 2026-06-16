// MCNA CRM - self-hosted server for the VPS (crm.mcna.vn).
// Serves the static Vite build (dist/) with SPA fallback and exposes the
// /api/notify email endpoint (same behaviour as the Vercel function).
// Listens on 127.0.0.1:PORT behind nginx. SMTP creds come from env.
'use strict';

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 3001);
const DIST = path.join(__dirname, 'dist');

app.post('/api/notify', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const { to, toName, subject, text } = req.body || {};
  if (!to || !subject || !text) {
    return res.status(400).json({ sent: false, error: 'Thiếu trường to/subject/text' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to))) {
    return res.status(400).json({ sent: false, error: 'Email người nhận không hợp lệ' });
  }
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) {
    return res.status(200).json({ sent: false, reason: 'smtp_not_configured' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: Number(process.env.SMTP_PORT || 465) === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"MCNA CRM" <${user}>`,
      to: toName ? `"${String(toName).replace(/"/g, '')}" <${to}>` : to,
      subject,
      text,
    });
    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(200).json({ sent: false, error: String(err && err.message || err) });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true, service: 'mcna-crm' }));

// Static assets + SPA fallback
app.use(express.static(DIST));
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[MCNA CRM] listening on 127.0.0.1:${PORT}, serving ${DIST}`);
});
