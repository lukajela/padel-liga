'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UstvariTurnir() {
  const [profil, setProfil] = useState<any>(null)
  const [ime, setIme] = useState('')
  const [opis, setOpis] = useState('')
  const [lokacija, setLokacija] = useState('')
  const [datum, setDatum] = useState('')
  const [maxIgralcev, setMaxIgralcev] = useState('8')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p?.is_admin) { router.push('/turnirji'); return }
      setProfil(p)
    }
    nalozi()
  }, [])

  const ustvari = async () => {
    if (!ime) return
    setLoading(true)

    const { data } = await supabase.from('turnirji').insert({
      ime,
      opis: opis || null,
      lokacija: lokacija || null,
      datum: datum || null,
      max_igralcev: parseInt(maxIgralcev),
      created_by: profil.id,
      status: 'prijavovanje'
    }).select().single()

    router.push(`/turnirji/${data?.id}`)
  }

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />

      <nav className="relative z-10 border-b border-blue-800/30 bg-[#020b18]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-sm">🎾</span>
          </div>
          <span className="font-black text-lg tracking-wider">PADEL <span className="text-blue-400">LIGA</span></span>
        </div>
        <Link href="/turnirji" className="text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
          ← Turnirji
        </Link>
      </nav>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8">🏆 Nov <span className="text-blue-400">Turnir</span></h1>

        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 space-y-5">
          <div>
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Ime turnirja *</label>
            <input value={ime} onChange={e => setIme(e.target.value)}
              placeholder="npr. Ljubljanski Open 2026"
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"/>
          </div>

          <div>
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">Opis</label>
            <textarea value={opis} onChange={e => setOpis(e.target.value)}
              placeholder="Kratek opis turnirja..."
              rows={3}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30 resize-none"/>
          </div>

          <div>
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">📍 Lokacija</label>
            <input value={lokacija} onChange={e => setLokacija(e.target.value)}
              placeholder="npr. Padel Tivoli, Ljubljana"
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"/>
          </div>

          <div>
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">📅 Datum</label>
            <input type="datetime-local" value={datum} onChange={e => setDatum(e.target.value)}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all [color-scheme:dark]"/>
          </div>

          <div>
            <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block font-bold">👥 Max igralcev</label>
            <select value={maxIgralcev} onChange={e => setMaxIgralcev(e.target.value)}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all cursor-pointer">
              <option value="4">4 igralci</option>
              <option value="8">8 igralcev</option>
              <option value="16">16 igralcev</option>
              <option value="32">32 igralcev</option>
            </select>
          </div>

          <button onClick={ustvari} disabled={!ime || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)] disabled:opacity-30">
            {loading ? 'Ustvarjam...' : '🏆 Ustvari Turnir'}
          </button>
        </div>
      </div>
    </main>
  )
}