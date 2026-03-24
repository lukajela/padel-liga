'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function NovoGeslo() {
  const [geslo, setGeslo] = useState('')
  const [geslo2, setGeslo2] = useState('')
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState('')
  const [uspesno, setUspesno] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const nastaviGeslo = async () => {
    if (!geslo || !geslo2) return
    if (geslo !== geslo2) { setNapaka('Gesli se ne ujemata.'); return }
    if (geslo.length < 6) { setNapaka('Geslo mora biti vsaj 6 znakov.'); return }
    setLoading(true)
    setNapaka('')

    const { error } = await supabase.auth.updateUser({ password: geslo })

    if (error) {
      setNapaka('Napaka pri nastavljanju gesla.')
      setLoading(false)
      return
    }

    setUspesno(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <main className="min-h-screen bg-[#020b18] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-3xl mb-4">
            🎾
          </div>
          <h1 className="text-3xl font-black tracking-wider mb-1">
            PADEL <span className="text-blue-400">LIGA</span>
          </h1>
        </div>

        {uspesno ? (
          <div className="bg-[#051525] border border-green-500/30 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-black text-green-400 mb-2">Geslo nastavljeno!</h2>
            <p className="text-blue-300/50">Preusmerjam na dashboard...</p>
          </div>
        ) : (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8">
            <h2 className="text-2xl font-black mb-2">Novo geslo 🔐</h2>
            <p className="text-blue-300/50 text-sm mb-8">Nastavi novo geslo za tvoj račun</p>

            <div className="mb-4">
              <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Novo geslo</label>
              <input
                type="password"
                placeholder="••••••••"
                value={geslo}
                onChange={e => setGeslo(e.target.value)}
                className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
            </div>

            <div className="mb-6">
              <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Potrdi geslo</label>
              <input
                type="password"
                placeholder="••••••••"
                value={geslo2}
                onChange={e => setGeslo2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && nastaviGeslo()}
                className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
            </div>

            {napaka && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
                ⚠️ {napaka}
              </div>
            )}

            <button
              onClick={nastaviGeslo}
              disabled={!geslo || !geslo2 || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] disabled:opacity-30">
              {loading ? '⏳ Nastavljam...' : '🔐 Nastavi geslo'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}