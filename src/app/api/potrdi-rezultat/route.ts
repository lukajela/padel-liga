import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { email1, email2, ime1, ime2, rezultat, zmagovalec } = await req.json()

  const posliEmail = async (to: string) => {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
        to: [{ email: to }],
        subject: `🏆 Tekma zaključena: ${ime1} vs ${ime2}`,
        htmlContent: `
          <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
            <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
                <div style="font-size:48px;">🏆</div>
                <h1 style="color:white;margin:8px 0 0;">Tekma zaključena!</h1>
              </div>
              <div style="padding:32px;">
                <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
                  <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">Rezultat</p>
                  <p style="margin:12px 0;color:white;font-size:24px;font-weight:bold;">${ime1} vs ${ime2}</p>
                  <p style="margin:0;color:#60a5fa;font-size:20px;font-weight:bold;">${rezultat}</p>
                </div>
                <p style="color:#93c5fd;text-align:center;font-size:18px;">
                  🥇 Zmagovalec: <strong style="color:white;">${zmagovalec}</strong>
                </p>
                <a href="https://padel-liga-bay.vercel.app/lestvica"
                  style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:24px;">
                  🏆 Poglej lestvico
                </a>
              </div>
            </div>
          </body>`
      })
    })
  }

  try {
    await posliEmail(email1)
    await posliEmail(email2)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}