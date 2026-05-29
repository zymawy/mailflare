import axios from 'axios';
import nodemailer from 'nodemailer';

const RESEND_API = 'https://api.resend.com';

export async function validateResendKey(apiKey) {
  try {
    const res = await axios.get(`${RESEND_API}/domains`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return { valid: true, domains: res.data.data || [] };
  } catch {
    return { valid: false };
  }
}

export async function addResendDomain(apiKey, domain) {
  const res = await axios.post(
    `${RESEND_API}/domains`,
    { name: domain },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  );
  return res.data;
}

export function getResendSmtpConfig(apiKey) {
  return {
    host: 'smtp.resend.com',
    port: 465,
    secure: true,
    auth: { user: 'resend', pass: apiKey },
  };
}

export async function sendTestEmail({ apiKey, from, to, domain }) {
  const transporter = nodemailer.createTransporter(getResendSmtpConfig(apiKey));
  const result = await transporter.sendMail({
    from: `Mailflare Test <${from}>`,
    to,
    subject: `✅ mailflare setup confirmed for ${domain}`,
    html: `
      <h2>Your domain email is working! 🎉</h2>
      <p>This email was sent from <strong>${from}</strong> via Resend SMTP.</p>
      <p>Your mailflare setup is complete:</p>
      <ul>
        <li>✅ Receive emails at <strong>${from}</strong></li>
        <li>✅ Send emails from <strong>${from}</strong></li>
        <li>✅ Forwarding to <strong>${to}</strong></li>
      </ul>
      <hr>
      <p style="color:#888;font-size:12px">Sent by <a href="https://github.com/zymawy/mailflare">mailflare</a> — free domain email</p>
    `,
  });
  return result;
}
