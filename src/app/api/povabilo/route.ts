import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { povabljenecId, povabljenecEmail, imePovabitelja, povabiteljaId, liga, igrisca, termin } = await req.json()

  try {
    // Shrani povabilo v bazo
    const supabase = createClient()
    const { data: povabilo } = await supabase.from('povabila').insert({
      povabitelj_id: povabiteljaId,
      povabljenec_id: povabljenecId,
      igrisca,
      termin: termin || null,
      status: 'caka'
    }).select().single()

    // Pošlji email povabljencu
    await posljiEmail({
      to: povabljenecEmail,
      subject: `⚔️ ${imePovabitelja} te izziva na padel tekmo!`,
      html: emailPovabilo({ imePovabitelja, liga, igrisca, termin, povabiloId: povabilo?.id })
    })

    return NextResponse.json({ ok: true, povabiloId: povabilo?.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}

async function posljiEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  })
}

function emailPovabilo({ imePovabitelja, liga, igrisca, termin, povabiloId }: any) {
  return `
    <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
      <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
          <div style="font-size:48px;">⚔️</div>
          <h1 style="color:white;margin:8px 0 0;">Izziv na tekmo!</h1>
          <p style="color:#60a5fa;margin:4px 0 0;">Slovenian Padel League</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#93c5fd;font-size:18px;margin:0 0 24px;">
            <strong style="color:white;">${imePovabitelja}</strong> te izziva v <strong style="color:#60a5fa;text-transform:capitalize;">${liga} Ligi</strong>!
          </p>
          ${igrisca ? `<div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:12px;">
            <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">📍 Igrišče</p>
            <p style="margin:8px 0 0;color:white;font-weight:bold;">${igrisca}</p>
          </div>` : ''}
          ${termin ? `<div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:24px;">
            <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">📅 Termin</p>
            <p style="margin:8px 0 0;color:white;font-weight:bold;">${new Date(termin).toLocaleString('sl-SI')}</p>
          </div>` : ''}
          <a href="https://padel-liga-bay.vercel.app/povabila" 
            style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
            ⚔️ Sprejmi izziv
          </a>
        </div>
      </div>
    </body>`
}