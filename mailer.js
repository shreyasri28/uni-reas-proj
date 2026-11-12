import nodemailer from 'nodemailer'

let transporter
function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email service is not configured. Add SMTP settings to server/.env.')
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  }
  return transporter
}

export async function sendVerificationEmail(email, code, name) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER
  await getTransporter().sendMail({
    from, to: email, subject: 'Verify your Uni-Reas email address',
    text: `Hello ${name},\n\nYour Uni-Reas verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.\n`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>Welcome to Uni-Reas</h2><p>Hello ${escapeHtml(name)},</p><p>Use this verification code to activate your account:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f1f5f9;text-align:center">${code}</div><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`
  })
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
}
