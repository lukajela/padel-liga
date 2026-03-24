import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { povabiloId, emailPovabitelja, imePovabljeneca } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Posodobi status v bazi
    await supabase.from('povabila').update({ status: 'sprejeto' }).eq('id', povabiloId)

    // Pošlji email povabitelju
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
        to: [{ email: emailPovabitelja }],
        subject: `✅ ${imePovabljeneca} je sprejel tvoj izziv!`,
        htmlContent: `
          <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
            <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
                <div style="font-size:48px;">✅</div>
                <h1 style="color:white;margin:8px 0 0;">Izziv sprejet!</h1>
                <p style="color:#60a5fa;margin:4px 0 0;">Slovenian Padel League</p>
              </div>
              <div style="padding:32px;">
                <p style="color:#93c5fd;font-size:18px;margin:0 0 24px;">
                  <strong style="color:white;">${imePovabljeneca}</strong> je sprejel tvoj izziv! Čas je za tekmo! 🎾
                </p>
                <a href="https://padel-liga-bay.vercel.app/povabila"
                  style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;">
                  🎾 Pojdi na povabila
                </a>
              </div>
            </div>
          </body>`
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Brevo error:', err)
      return NextResponse.json({ error: 'Napaka' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}