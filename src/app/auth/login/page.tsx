'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [geslo, setGeslo] = useState('')
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const prijava = async () => {
    if (!email || !geslo) return
    setLoading(true)
    setNapaka('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: geslo,
    })

    if (error) {
      setNapaka('Napačen email ali geslo.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#020b18] text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-3xl mb-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            🎾
          </div>
          <h1 className="text-3xl font-black tracking-wider mb-1">
            PADEL <span className="text-blue-400">LIGA</span>
          </h1>
          <p className="text-blue-300/50 text-sm">Slovenian Padel League</p>
        </div>

        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-2xl font-black mb-2">Dobrodošel nazaj 👋</h2>
          <p className="text-blue-300/50 text-sm mb-8">Prijavi se s svojim računom</p>

          <div className="mb-4">
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Email</label>
            <input
              type="email"
              placeholder="tvoj@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && prijava()}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder:text-blue-400/30"
            />
          </div>

          <div className="mb-6">
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Geslo</label>
            <input
              type="password"
              placeholder="••••••••"
              value={geslo}
              onChange={e => setGeslo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && prijava()}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-4 text-white outline-none transition-all placeholder:text-blue-400/30"
            />
          </div>

          {napaka && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
              ⚠️ {napaka}
            </div>
          )}

          <button
            onClick={prijava}
            disabled={!email || !geslo || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] disabled:opacity-30 mb-4">
            {loading ? '⏳ Prijavljam...' : '🔐 Prijava'}
          </button>

          <div className="text-center">
            <span className="text-blue-400/40 text-sm">Nimaš računa? </span>
            <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">
              Registracija →
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-400/30 hover:text-blue-400/60 text-xs transition-colors">
            ← Nazaj na domačo stran
          </Link>
        </div>
      </div>
    </main>
  )
}