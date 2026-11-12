import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in the project .env.local file.')
  }

  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587)
    const secure = process.env.SMTP_SECURE
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    })
  }
  return transporter
}

export async function verifyEmailTransport() {
  await getTransporter().verify()
}

export async function sendVerificationEmail(email, code, name) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER
  const safeName = escapeHtml(name)
  const info = await getTransporter().sendMail({
    from,
    to: email,
    subject: 'Verify your Uni-Reas email address',
    text: `Hello ${name},\n\nYour Uni-Reas verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.\n`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>Welcome to Uni-Reas</h2><p>Hello ${safeName},</p><p>Use this verification code to activate your account:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f1f5f9;text-align:center">${code}</div><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`
  })
  if (!info.accepted?.includes(email)) {
    throw new Error('The email provider did not accept the recipient address.')
  }
  return info
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]))
}
