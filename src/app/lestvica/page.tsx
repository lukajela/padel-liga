'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LIGE = [
  { id: 'starter', ime: 'Starter Liga', emoji: '🌱', barva: 'text-gray-400', border: 'border-gray-600', bg: 'bg-gray-900/20', aktivna: 'bg-gray-700/30' },
  { id: 'challenger', ime: 'Challenger Liga', emoji: '⚡', barva: 'text-blue-400', border: 'border-blue-600', bg: 'bg-blue-900/20', aktivna: 'bg-blue-700/30' },
  { id: 'competitor', ime: 'Competitor Liga', emoji: '🔥', barva: 'text-green-400', border: 'border-green-600', bg: 'bg-green-900/20', aktivna: 'bg-green-700/30' },
  { id: 'pro', ime: 'Pro Liga', emoji: '💎', barva: 'text-purple-400', border: 'border-purple-600', bg: 'bg-purple-900/20', aktivna: 'bg-purple-700/30' },
  { id: 'elite', ime: 'Elite Liga', emoji: '👑', barva: 'text-yellow-400', border: 'border-yellow-600', bg: 'bg-yellow-900/20', aktivna: 'bg-yellow-700/30' },
]

export default function Lestvica() {
  const [izbrana, setIzbrana] = useState('challenger')
  const [igralci, setIgralci] = useState<any[]>([])
  const [mojProfil, setMojProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      const { data: profil } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profil) { setMojProfil(profil); setIzbrana(profil.liga) }
      setLoading(false)
    }
    nalozi()
  }, [])

  useEffect(() => {
    const naloziLestvico = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('liga', izbrana)
        .order('zmage', { ascending: false })
      setIgralci(data || [])
    }
    naloziLestvico()
  }, [izbrana])

  const winRatio = (z: number, p: number) => z + p > 0 ? Math.round((z / (z + p)) * 100) : 0
  const liga = LIGE.find(l => l.id === izbrana)!

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  const mojRang = igralci.findIndex(i => i.id === mojProfil?.id) + 1

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-blue-800/30 bg-[#020b18]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-sm">🎾</span>
          </div>
          <span className="font-black text-lg tracking-wider">PADEL <span className="text-blue-400">LIGA</span></span>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="text-blue-400/60 text-sm uppercase tracking-widest mb-2">Ranglista</div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            🏆 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Lestvica</span>
          </h1>
          <p className="text-blue-300/50">Poglej kje si na lestvici in koliko ti manjka do naslednje lige</p>
        </div>

        {/* Moj rang - če je na lestvici */}
        {mojRang > 0 && mojProfil?.liga === izbrana && (
          <div className={`${liga.bg} border ${liga.border} rounded-2xl p-4 mb-6 flex items-center gap-4`}>
            <div className={`text-2xl font-black ${liga.barva} w-10 text-center`}>#{mojRang}</div>
            <div className="flex-1">
              <div className="font-bold text-white">Tvoj rang v {liga.ime}</div>
              <div className="text-sm text-blue-300/60">{mojProfil.zmage}W · {mojProfil.porazi}L · {winRatio(mojProfil.zmage, mojProfil.porazi)}% WR</div>
            </div>
            <div className={`text-2xl`}>{liga.emoji}</div>
          </div>
        )}

        {/* Liga tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {LIGE.map(l => (
            <button key={l.id} onClick={() => setIzbrana(l.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold transition-all ${izbrana === l.id ? `${l.border} ${l.aktivna} ${l.barva}` : 'border-blue-800/30 text-blue-400/40 hover:border-blue-600/40 hover:text-blue-300/60'}`}>
              <span>{l.emoji}</span>
              <span className="hidden sm:inline">{l.ime}</span>
              <span className="sm:hidden">{l.id.charAt(0).toUpperCase() + l.id.slice(1)}</span>
            </button>
          ))}
        </div>

        {/* Lestvica tabela */}
        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-6 py-3 bg-blue-900/20 text-xs uppercase tracking-wider text-blue-400/60 font-bold border-b border-blue-800/30">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Igralec</div>
            <div className="col-span-2 text-center">W</div>
            <div className="col-span-2 text-center">L</div>
            <div className="col-span-2 text-center">WR%</div>
          </div>

          {/* Igralci */}
          {igralci.length === 0 ? (
            <div className="text-center py-16 text-blue-400/30">
              <div className="text-5xl mb-4">{liga.emoji}</div>
              <p className="text-lg">Ni še igralcev v {liga.ime}</p>
              <p className="text-sm mt-2">Bodi prvi! Igraj tekme in napreduj.</p>
            </div>
          ) : (
            igralci.map((ig, idx) => {
              const jeMoj = ig.id === mojProfil?.id
              const rang = idx + 1
              return (
                <div key={ig.id}
                  className={`grid grid-cols-12 items-center px-6 py-4 border-b border-blue-800/10 transition-all ${jeMoj ? `${liga.bg} ${liga.border} border-l-4` : 'hover:bg-blue-900/10'}`}>
                  
                  {/* Rang */}
                  <div className="col-span-1">
                    {rang === 1 ? (
                      <span className="text-xl">🥇</span>
                    ) : rang === 2 ? (
                      <span className="text-xl">🥈</span>
                    ) : rang === 3 ? (
                      <span className="text-xl">🥉</span>
                    ) : (
                      <span className={`font-black text-sm ${jeMoj ? liga.barva : 'text-blue-400/50'}`}>#{rang}</span>
                    )}
                  </div>

                  {/* Ime */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border ${jeMoj ? `${liga.border} ${liga.bg}` : 'border-blue-800/30 bg-blue-900/20'}`}>
                      {ig.ime?.[0]}{ig.priimek?.[0]}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${jeMoj ? 'text-white' : 'text-blue-100/80'}`}>
                        {ig.ime} {ig.priimek}
                        {jeMoj && <span className="ml-2 text-xs text-blue-400 font-normal">(ti)</span>}
                      </div>
                      <div className="text-blue-400/40 text-xs">{ig.username || ig.email?.split('@')[0]}</div>
                    </div>
                  </div>

                  {/* Statistike */}
                  <div className="col-span-2 text-center">
                    <span className="text-green-400 font-black">{ig.zmage}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-red-400 font-black">{ig.porazi}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-black text-sm ${winRatio(ig.zmage, ig.porazi) >= 60 ? 'text-green-400' : winRatio(ig.zmage, ig.porazi) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {winRatio(ig.zmage, ig.porazi)}%
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Legenda */}
        <div className="mt-6 bg-[#051525] border border-blue-800/30 rounded-2xl p-5">
          <p className="text-blue-400/60 text-xs uppercase tracking-wider mb-3 font-bold">Napredovanje</p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {LIGE.map((l, idx) => (
              <div key={l.id} className={`${l.bg} border ${l.border} rounded-xl p-3 text-center ${izbrana === l.id ? 'ring-1 ring-white/20' : ''}`}>
                <div className="text-xl mb-1">{l.emoji}</div>
                <div className={`text-xs font-bold ${l.barva}`}>{l.ime.split(' ')[0]}</div>
                {idx < 4 && <div className="text-blue-400/40 text-xs mt-1">→ {LIGE[idx+1].ime.split(' ')[0]}</div>}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}