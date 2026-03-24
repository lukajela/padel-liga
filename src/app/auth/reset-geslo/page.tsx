'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ResetGeslo() {
  const [email, setEmail] = useState('')
  const [poslano, setPoslano] = useState(false)
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState('')
  const supabase = createClient()

  const posljiReset = async () => {
    if (!email) return
    setLoading(true)
    setNapaka('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://padel-liga-bay.vercel.app/auth/novo-geslo',
    })

    if (error) {
      setNapaka('Napaka pri pošiljanju. Preveri email.')
      setLoading(false)
      return
    }

    setPoslano(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#020b18] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-3xl mb-4">
            🎾
          </div>
          <h1 className="text-3xl font-black tracking-wider mb-1">
            PADEL <span className="text-blue-400">LIGA</span>
          </h1>
        </div>

        {!poslano ? (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-2">Pozabljeno geslo 🔑</h2>
            <p className="text-blue-300/50 text-sm mb-8">Vnesi email in poslali ti bomo link za reset gesla</p>

            <div className="mb-6">
              <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Email</label>
              <input
                type="email"
                placeholder="tvoj@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && posljiReset()}
                className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
            </div>

            {napaka && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
                ⚠️ {napaka}
              </div>
            )}

            <button
              onClick={posljiReset}
              disabled={!email || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] disabled:opacity-30 mb-4">
              {loading ? '📧 Pošiljam...' : '🔑 Pošlji reset link'}
            </button>

            <div className="text-center">
              <Link href="/auth/login" className="text-blue-400/50 hover:text-blue-300 text-sm transition-colors">
                ← Nazaj na prijavo
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#051525] border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📬</div>
            <h2 className="text-2xl font-black mb-3 text-green-400">Email poslan!</h2>
            <p className="text-blue-300/60 mb-2">Reset link smo poslali na:</p>
            <p className="text-white font-bold text-lg mb-6 bg-blue-900/20 rounded-xl px-4 py-3">{email}</p>
            <p className="text-blue-300/50 text-sm mb-8">Klikni na link v emailu in nastavi novo geslo.</p>
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              ← Nazaj na prijavo
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}