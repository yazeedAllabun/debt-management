import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { employee_id, email } = await req.json()
    if (!employee_id || !email) {
      return new Response(JSON.stringify({ error: 'employee_id and email required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes

    // Store OTP in employees table
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const { error: dbErr } = await supabase
      .from('employees')
      .update({ otp_code: otp, otp_expires_at: expiresAt })
      .eq('id', employee_id)

    if (dbErr) throw new Error(dbErr.message)

    // Send via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY not set')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: Deno.env.get('RESEND_FROM_EMAIL') || 'noreply@yourdomain.com',
        to: [email],
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
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.message || 'Resend error')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
