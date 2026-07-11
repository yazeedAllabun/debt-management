import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { employee_id, email } = req.body
    if (!employee_id || !email) return res.status(400).json({ error: 'employee_id and email required' })

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Store OTP in Supabase
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { error: dbErr } = await supabase
      .from('employees')
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq('id', employee_id)

    if (dbErr) throw new Error('DB: ' + dbErr.message)

    // Send via Gmail
    const gmailUser = process.env.GMAIL_USER
    const gmailPass = process.env.GMAIL_APP_PASSWORD
    if (!gmailUser || !gmailPass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not configured')

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    })

    await transporter.sendMail({
      from: `"راكان للتمويل" <${gmailUser}>`,
      to: email,
      subject: 'رمز التحقق — راكان للتمويل',
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="color:#1d4ed8;margin-bottom:8px;">رمز التحقق</h2>
          <p style="color:#6b7280;font-size:14px;">استخدم هذا الرمز لتسجيل الدخول. صالح لمدة 10 دقائق.</p>
          <div style="background:#f0f9ff;border:2px solid #bae6fd;border-radius:10px;padding:20px;text-align:center;margin:16px 0;">
            <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0369a1;">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;">إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.</p>
        </div>
      `,
    })

    return res.status(200).json({ success: true })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
