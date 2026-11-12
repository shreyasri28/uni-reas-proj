import nodemailer from 'nodemailer'

let transporter
function getTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('Email service is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in the root .env.local file.')
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587)
    if (![25, 465, 587, 2525].includes(port)) throw new Error('Unsupported SMTP_PORT. Use your provider SMTP port.')
    const secure = process.env.SMTP_SECURE
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000
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
  const result = await getTransporter().sendMail({
    from, to: email,
    subject: 'Your Uni-Reas email verification code',
    text: `Hello ${name},\n\nYour Uni-Reas verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.\n`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>Welcome to Uni-Reas</h2><p>Hello ${safeName},</p><p>Your verification code is:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f1f5f9;text-align:center">${code}</div><p>This code expires in 10 minutes. If you did not request this, ignore this email.</p></div>`
  })
  if (!result.accepted?.some(address => address.toLowerCase() === email.toLowerCase())) {
    throw new Error('SMTP provider did not accept the recipient address.')
  }
  return result
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
}
