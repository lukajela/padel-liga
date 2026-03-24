import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { turnirId, turnirIme, turnirDatum, turnirLokacija } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Naloži vse prijavljene
    const { data: prijave } = await supabase
      .from('turnir_prijave')
      .select('*, igralec:igralec_id(*)')
      .eq('turnir_id', turnirId)

    if (!prijave || prijave.length === 0) {
      return NextResponse.json({ ok: true })
    }

    // Pošlji email vsem prijavljenim
    await Promise.all(prijave.map(async (p) => {
      if (!p.igralec?.email) return

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
        },
        body: JSON.stringify({
          sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
          to: [{ email: p.igralec.email }],
          subject: `⚡ Turnir "${turnirIme}" se je začel!`,
          htmlContent: `
            <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
              <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
                  <div style="font-size:48px;">🏆</div>
                  <h1 style="color:white;margin:8px 0 0;">Turnir se je začel!</h1>
                  <p style="color:#60a5fa;margin:4px 0 0;">Slovenian Padel League</p>
                </div>
                <div style="padding:32px;">
                  <p style="color:#93c5fd;font-size:18px;margin:0 0 24px;">
                    Turnir <strong style="color:white;">${turnirIme}</strong> se je uradno začel! 🎾
                  </p>
                  ${turnirLokacija ? `
                  <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:12px;">
                    <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">📍 Lokacija</p>
                    <p style="margin:8px 0 0;color:white;font-weight:bold;">${turnirLokacija}</p>
                  </div>` : ''}
                  ${turnirDatum ? `
                  <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:24px;">
                    <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">📅 Datum</p>
                    <p style="margin:8px 0 0;color:white;font-weight:bold;">${new Date(turnirDatum).toLocaleString('sl-SI')}</p>
                  </div>` : ''}
                  <p style="color:#93c5fd;margin:0 0 24px;">Poglej bracket in se pripravi na svojo tekmo!</p>
                  <a href="https://padel-liga-bay.vercel.app/turnirji/${turnirId}"
                    style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
                    🏆 Poglej bracket
                  </a>
                </div>
                <div style="padding:20px 32px;border-top:1px solid #1e3a5f;text-align:center;">
                  <p style="color:#1e3a5f;font-size:12px;margin:0;">Slovenian Padel League · Tekmovanje · Strast · Skupnost</p>
                </div>
              </div>
            </body>`
        })
      })
    }))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}