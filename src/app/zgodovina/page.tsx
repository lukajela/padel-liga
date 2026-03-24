'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

export default function Zgodovina() {
  const [profil, setProfil] = useState<any>(null)
  const [tekme, setTekme] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'vse' | 'zmage' | 'porazi'>('vse')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    nalozi()
  }, [])

  const nalozi = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p) setProfil(p)

    const { data } = await supabase
      .from('povabila')
      .select('*, povabitelj:povabitelj_id(*), povabljenec:povabljenec_id(*), zmagovalec:zmagovalec_id(*)')
      .or(`povabitelj_id.eq.${user.id},povabljenec_id.eq.${user.id}`)
      .eq('status', 'koncano')
      .order('created_at', { ascending: false })
    setTekme(data || [])
    setLoading(false)
  }

  const filtrirane = tekme.filter(t => {
    if (filter === 'zmage') return t.zmagovalec_id === profil?.id
    if (filter === 'porazi') return t.zmagovalec_id !== profil?.id
    return true
  })

  const skupajZmage = tekme.filter(t => t.zmagovalec_id === profil?.id).length
  const skupajPorazi = tekme.filter(t => t.zmagovalec_id !== profil?.id).length
  const winRatio = tekme.length > 0 ? Math.round((skupajZmage / tekme.length) * 100) : 0

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      <nav className="relative z-10 border-b border-blue-800/30 bg-[#020b18]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-sm">🎾</span>
          </div>
          <span className="font-black text-lg tracking-wider">PADEL <span className="text-blue-400">LIGA</span></span>
        </div>
        <Link href="/dashboard" className="text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="text-blue-400/60 text-sm uppercase tracking-widest mb-2">Pretekle tekme</div>
          <h1 className="text-4xl font-black mb-2">📝 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Zgodovina</span></h1>
          <p className="text-blue-300/50">Vse tvoje odigrane tekme</p>
        </div>

        {/* Statistike */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-blue-400">{tekme.length}</div>
            <div className="text-blue-300/50 text-xs mt-1 uppercase tracking-wider">Skupaj</div>
          </div>
          <div className="bg-[#051525] border border-green-800/30 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-green-400">{skupajZmage}</div>
            <div className="text-blue-300/50 text-xs mt-1 uppercase tracking-wider">Zmage</div>
          </div>
          <div className="bg-[#051525] border border-red-800/30 rounded-2xl p-5 text-center">
            <div className="text-3xl font-black text-red-400">{skupajPorazi}</div>
            <div className="text-blue-300/50 text-xs mt-1 uppercase tracking-wider">Porazi</div>
          </div>
        </div>

        {/* Win ratio bar */}
        {tekme.length > 0 && (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-300/60">Win ratio</span>
              <span className="text-sm font-black text-blue-400">{winRatio}%</span>
            </div>
            <div className="h-3 bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all"
                style={{width: `${winRatio}%`}} />
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'vse', label: `📋 Vse (${tekme.length})` },
            { id: 'zmage', label: `🏆 Zmage (${skupajZmage})` },
            { id: 'porazi', label: `😔 Porazi (${skupajPorazi})` },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === f.id ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Tekme */}
        {filtrirane.length === 0 ? (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-blue-300/50 text-lg font-bold">Ni tekem</p>
            <p className="text-blue-400/30 text-sm mt-2">Začni igrati tekme!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrirane.map(t => {
              const jePovabitelj = t.povabitelj_id === profil?.id
              const nasprotnik = jePovabitelj ? t.povabljenec : t.povabitelj
              const zmaga = t.zmagovalec_id === profil?.id
              const rezultat = jePovabitelj ? t.rezultat_povabitelj : t.rezultat_povabljenec

              return (
                <div key={t.id}
                  className={`bg-[#051525] border rounded-2xl p-5 transition-all ${zmaga ? 'border-green-800/40' : 'border-red-800/30'}`}>
                  <div className="flex items-center gap-4">
                    {/* Rezultat indikator */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0 ${zmaga ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {zmaga ? 'W' : 'L'}
                    </div>

                    {/* Nasprotnik */}
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar profil={nasprotnik} velikost="md" />
                      <div>
                        <div className="font-black">{nasprotnik?.ime} {nasprotnik?.priimek}</div>
                        <div className="text-blue-400/40 text-xs capitalize">{nasprotnik?.liga} Liga</div>
                      </div>
                    </div>

                    {/* Rezultat in datum */}
                    <div className="text-right">
                      {rezultat && (
                        <div className={`font-bold text-sm ${zmaga ? 'text-green-400' : 'text-red-400'}`}>
                          {rezultat}
                        </div>
                      )}
                      <div className="text-blue-400/30 text-xs mt-1">
                        {new Date(t.created_at).toLocaleDateString('sl-SI')}
                      </div>
                    </div>
                  </div>

                  {t.igrisca && (
                    <div className="mt-3 pt-3 border-t border-blue-800/20 text-blue-400/40 text-xs">
                      📍 {t.igrisca}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}