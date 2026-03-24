import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json()

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: { name: 'Padel Liga Slovenia', email: 'jelicluka13@gmail.com' },
        to: [{ email }],
        subject: '🎾 Dobrodošel v Slovenian Padel League!',
        htmlContent: `
          <body style="background:#020b18;color:white;font-family:Arial,sans-serif;padding:40px;margin:0;">
            <div style="max-width:500px;margin:0 auto;background:#051525;border:1px solid #1e3a5f;border-radius:16px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#1e3a5f,#0a2a4a);padding:32px;text-align:center;">
                <div style="font-size:48px;">🎾</div>
                <h1 style="color:white;margin:8px 0 0;">Dobrodošel!</h1>
                <p style="color:#60a5fa;margin:4px 0 0;">Slovenian Padel League</p>
              </div>
              <div style="padding:32px;">
                <p style="color:#93c5fd;font-size:18px;margin:0 0 24px;">
                  Uspešno si se registriral v <strong style="color:white;">Slovenian Padel League</strong>! 🎉
                </p>
                <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:12px;">
                  <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">📧 Tvoj račun</p>
                  <p style="margin:8px 0 0;color:white;font-weight:bold;">${email}</p>
                </div>
                <div style="background:#0a2a4a;border:1px solid #1e3a5f;border-radius:12px;padding:16px;margin-bottom:24px;">
                  <p style="margin:0;color:#60a5fa;font-size:12px;text-transform:uppercase;">🗓️ Datum registracije</p>
                  <p style="margin:8px 0 0;color:white;font-weight:bold;">${new Date().toLocaleString('sl-SI')}</p>
                </div>
                <p style="color:#93c5fd;margin:0 0 8px;">Kar te čaka:</p>
                <p style="color:#60a5fa;margin:0 0 4px;">⚔️ Izzivi in tekme</p>
                <p style="color:#60a5fa;margin:0 0 4px;">🏆 Lestvica po ligah</p>
                <p style="color:#60a5fa;margin:0 0 24px;">📍 Padel centri v Sloveniji</p>
                <a href="https://padel-liga-bay.vercel.app/onboarding"
                  style="display:block;background:#2563eb;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
                  🚀 Začni z onboardingom
                </a>
              </div>
              <div style="padding:20px 32px;border-top:1px solid #1e3a5f;text-align:center;">
                <p style="color:#1e3a5f;font-size:12px;margin:0;">Slovenian Padel League · Tekmovanje · Strast · Skupnost</p>
              </div>
            </div>
          </body>`
      })
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}