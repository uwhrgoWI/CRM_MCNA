// Vercel serverless function: sends assignment-notification emails.
// SMTP credentials come from env vars (SMTP_USER / SMTP_PASS, optionally
// SMTP_HOST / SMTP_PORT) so no address or secret is hardcoded anywhere.
// Without credentials it answers { sent:false, reason:'smtp_not_configured' }
// and the app keeps the mail in its outbox queue.
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    return res.status(405).json({ sent: false, error: 'Method not allowed' });
  }

  const { to, toName, subject, text } = req.body || {};
  if (!to || !subject || !text) {
    return res.status(400).json({ sent: false, error: 'Thiếu trường to/subject/text' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to))) {
    return res.status(400).json({ sent: false, error: 'Địa chỉ email người nhận không hợp lệ' });
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
      to: toName ? `"${toName.replace(/"/g, '')}" <${to}>` : to,
      subject,
      text,
    });
    return res.status(200).json({ sent: true });
  } catch (err) {
    return res.status(200).json({ sent: false, error: String(err?.message || err) });
  }
}
