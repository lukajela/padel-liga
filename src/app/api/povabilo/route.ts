import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { emailNasprotnika, imePovabitelja, liga, igrisca, termin } = await req.json()

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
        to: [{ email: emailNasprotnika }],
        subject: `⚔️ ${imePovabitelja} te izziva na padel tekmo!`,
        htmlContent: `
          <!DOCTYPE html>
          <html>
          <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
            <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
              
              <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
                <div style="font-size:48px;margin-bottom:12px;">⚔️</div>
                <h1 style="color:white;margin:0;font-size:24px;">Izziv na tekmo!</h1>
                <p style="color:#60a5fa;margin:8px 0 0;">Slovenian Padel League</p>
              </div>

              <div style="padding:32px;">
                <p style="color:#93c5fd;font-size:18px;margin:0 0 24px;">
                  <strong style="color:white;">${imePovabitelja}</strong> te izziva na padel tekmo v 
                  <strong style="color:#60a5fa;text-transform:capitalize;">${liga} Ligi</strong>!
                </p>

                ${igrisca ? `
                <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:12px;">
                  <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">📍 Igrišče</p>
                  <p style="margin:8px 0 0;color:white;font-weight:bold;">${igrisca}</p>
                </div>` : ''}

                ${termin ? `
                <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:24px;">
                  <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;letter-spacing:1px;">📅 Predlagan termin</p>
                  <p style="margin:8px 0 0;color:white;font-weight:bold;">${new Date(termin).toLocaleString('sl-SI')}</p>
                </div>` : ''}

                <a href="https://padel-liga-bay.vercel.app/iskanje-tekme" 
                  style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:16px;">
                  ⚔️ Sprejmi izziv
                </a>

                <a href="https://padel-liga-bay.vercel.app/tekma"
                  style="display:block;background:transparent;color:#60a5fa;text-align:center;padding:12px;border-radius:12px;text-decoration:none;font-size:14px;border:1px solid #1e3a5f;">
                  Pojdi na tekmo →
                </a>
              </div>

              <div style="padding:20px 32px;border-top:1px solid #1e3a5f;text-align:center;">
                <p style="color:#1e3a5f;font-size:12px;margin:0;">Slovenian Padel League · Tekmovanje · Strast · Skupnost</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('Brevo error:', err)
      return NextResponse.json({ error: 'Napaka pri pošiljanju' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}