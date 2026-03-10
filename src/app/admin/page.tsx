'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LIGA_BARVA: Record<string, string> = {
  starter: 'text-gray-400 border-gray-600 bg-gray-900/20',
  challenger: 'text-blue-400 border-blue-600 bg-blue-900/20',
  competitor: 'text-green-400 border-green-600 bg-green-900/20',
  pro: 'text-purple-400 border-purple-600 bg-purple-900/20',
  elite: 'text-yellow-400 border-yellow-600 bg-yellow-900/20',
}

const LIGA_EMOJI: Record<string, string> = {
  starter: '🌱', challenger: '⚡', competitor: '🔥', pro: '💎', elite: '👑'
}

export default function Admin() {
  const [profil, setProfil] = useState<any>(null)
  const [igralci, setIgralci] = useState<any[]>([])
  const [ekipe, setEkipe] = useState<any[]>([])
  const [zavihek, setZavihek] = useState<'igralci' | 'ekipe' | 'statistike'>('igralci')
  const [loading, setLoading] = useState(true)
  const [urejamIgralca, setUrejamIgralca] = useState<any>(null)
  const [iskanje, setIskanje] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p?.is_admin) { router.push('/dashboard'); return }
      setProfil(p)

      const { data: ig } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setIgralci(ig || [])

      const { data: ek } = await supabase.from('ekipe').select('*').order('created_at', { ascending: false })
      setEkipe(ek || [])

      setLoading(false)
    }
    nalozi()
  }, [])

  const posodobiLigo = async (id: string, liga: string) => {
    await supabase.from('profiles').update({ liga }).eq('id', id)
    setIgralci(prev => prev.map(i => i.id === id ? { ...i, liga } : i))
  }

  const posodobiAdmin = async (id: string, is_admin: boolean) => {
    await supabase.from('profiles').update({ is_admin }).eq('id', id)
    setIgralci(prev => prev.map(i => i.id === id ? { ...i, is_admin } : i))
  }

  const izbrisiIgralca = async (id: string) => {
    if (!confirm('Res želiš izbrisati tega igralca?')) return
    await supabase.from('profiles').delete().eq('id', id)
    setIgralci(prev => prev.filter(i => i.id !== id))
  }

  const resetirajStatistiko = async (id: string) => {
    if (!confirm('Resetirati statistiko tega igralca?')) return
    await supabase.from('profiles').update({ zmage: 0, porazi: 0 }).eq('id', id)
    setIgralci(prev => prev.map(i => i.id === id ? { ...i, zmage: 0, porazi: 0 } : i))
  }

  const filtrirani = igralci.filter(i =>
    `${i.ime} ${i.priimek} ${i.email}`.toLowerCase().includes(iskanje.toLowerCase())
  )

  const skupajTekme = igralci.reduce((a, i) => a + i.zmage + i.porazi, 0)
  const skupajZmage = igralci.reduce((a, i) => a + i.zmage, 0)
  const ligaPorazdelitev = ['starter','challenger','competitor','pro','elite'].map(l => ({
    liga: l, stevilo: igralci.filter(i => i.liga === l).length
  }))

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam admin panel...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-red-800/30 bg-[#020b18]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center">
            <span className="text-sm">⚙️</span>
          </div>
          <span className="font-black text-lg tracking-wider">PADEL <span className="text-red-400">ADMIN</span></span>
          <span className="bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-300/50 text-sm">{profil?.ime} {profil?.priimek}</span>
          <Link href="/dashboard" className="text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Skupaj igralcev', value: igralci.length, icon: '👥', barva: 'text-blue-400', bg: 'bg-blue-900/10 border-blue-800/30' },
            { label: 'Skupaj ekip', value: ekipe.length, icon: '🛡️', barva: 'text-purple-400', bg: 'bg-purple-900/10 border-purple-800/30' },
            { label: 'Skupaj tekem', value: skupajTekme, icon: '⚔️', barva: 'text-green-400', bg: 'bg-green-900/10 border-green-800/30' },
            { label: 'Skupaj zmag', value: skupajZmage, icon: '🏆', barva: 'text-yellow-400', bg: 'bg-yellow-900/10 border-yellow-800/30' },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-5 ${s.bg}`}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-3xl font-black ${s.barva}`}>{s.value}</div>
              <div className="text-blue-300/50 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'igralci', label: '👥 Igralci' },
            { id: 'ekipe', label: '🛡️ Ekipe' },
            { id: 'statistike', label: '📊 Statistike' },
          ].map(t => (
            <button key={t.id} onClick={() => setZavihek(t.id as any)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === t.id ? 'bg-red-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* IGRALCI */}
        {zavihek === 'igralci' && (
          <div>
            <div className="flex items-center gap-4 mb-4">
              <input
                placeholder="🔍 Išči po imenu ali emailu..."
                value={iskanje}
                onChange={e => setIskanje(e.target.value)}
                className="flex-1 bg-[#051525] border border-blue-800/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
              <span className="text-blue-400/50 text-sm">{filtrirani.length} / {igralci.length}</span>
            </div>

            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 px-6 py-3 bg-blue-900/20 text-xs uppercase tracking-wider text-blue-400/60 font-bold border-b border-blue-800/30">
                <div className="col-span-3">Igralec</div>
                <div className="col-span-2">Email</div>
                <div className="col-span-2">Liga</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">Admin</div>
                <div className="col-span-2 text-center">Akcije</div>
              </div>

              {filtrirani.map(ig => (
                <div key={ig.id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-blue-800/10 hover:bg-blue-900/10 transition-all">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-800/30 flex items-center justify-center text-xs font-black">
                      {ig.ime?.[0]}{ig.priimek?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{ig.ime} {ig.priimek}</div>
                      <div className="text-blue-400/40 text-xs">{ig.username ? `@${ig.username}` : ''}</div>
                    </div>
                  </div>

                  <div className="col-span-2 text-blue-300/60 text-xs truncate pr-2">{ig.email}</div>

                  <div className="col-span-2">
                    <select
                      value={ig.liga}
                      onChange={e => posodobiLigo(ig.id, e.target.value)}
                      className={`bg-transparent border rounded-lg px-2 py-1 text-xs font-bold cursor-pointer outline-none ${LIGA_BARVA[ig.liga]}`}>
                      {['starter','challenger','competitor','pro','elite'].map(l => (
                        <option key={l} value={l} className="bg-[#051525] text-white">{l}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 text-center text-green-400 font-black">{ig.zmage}</div>
                  <div className="col-span-1 text-center text-red-400 font-black">{ig.porazi}</div>

                  <div className="col-span-1 text-center">
                    <button onClick={() => posodobiAdmin(ig.id, !ig.is_admin)}
                      className={`text-lg transition-all ${ig.is_admin ? 'opacity-100' : 'opacity-20 hover:opacity-60'}`}>
                      ⚙️
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button onClick={() => resetirajStatistiko(ig.id)}
                      title="Resetiraj statistiko"
                      className="text-yellow-400/60 hover:text-yellow-400 transition-colors text-sm">
                      🔄
                    </button>
                    <button onClick={() => izbrisiIgralca(ig.id)}
                      title="Izbriši igralca"
                      className="text-red-400/60 hover:text-red-400 transition-colors text-sm">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EKIPE */}
        {zavihek === 'ekipe' && (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 px-6 py-3 bg-blue-900/20 text-xs uppercase tracking-wider text-blue-400/60 font-bold border-b border-blue-800/30">
              <div className="col-span-4">Ekipa</div>
              <div className="col-span-3">Liga</div>
              <div className="col-span-2 text-center">Zmage</div>
              <div className="col-span-2 text-center">Porazi</div>
              <div className="col-span-1 text-center">Akcije</div>
            </div>
            {ekipe.length === 0 ? (
              <div className="text-center py-12 text-blue-400/30">
                <div className="text-4xl mb-3">🛡️</div>
                <p>Ni še ekip</p>
              </div>
            ) : ekipe.map(ek => (
              <div key={ek.id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-blue-800/10 hover:bg-blue-900/10">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-800/30 flex items-center justify-center text-lg">🛡️</div>
                  <div className="font-bold">{ek.ime}</div>
                </div>
                <div className={`col-span-3 text-sm capitalize flex items-center gap-1 ${LIGA_BARVA[ek.liga]?.split(' ')[0]}`}>
                  {LIGA_EMOJI[ek.liga]} {ek.liga}
                </div>
                <div className="col-span-2 text-center text-green-400 font-black">{ek.zmage}</div>
                <div className="col-span-2 text-center text-red-400 font-black">{ek.porazi}</div>
                <div className="col-span-1 text-center">
                  <button onClick={async () => {
                    if (!confirm('Izbriši ekipo?')) return
                    await supabase.from('ekipe').delete().eq('id', ek.id)
                    setEkipe(prev => prev.filter(e => e.id !== ek.id))
                  }} className="text-red-400/60 hover:text-red-400 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATISTIKE */}
        {zavihek === 'statistike' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Liga porazdelitev */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
              <h3 className="font-black text-lg mb-4">📊 Igralci po ligah</h3>
              <div className="space-y-3">
                {ligaPorazdelitev.map(l => (
                  <div key={l.liga}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm capitalize font-bold flex items-center gap-1 ${LIGA_BARVA[l.liga]?.split(' ')[0]}`}>
                        {LIGA_EMOJI[l.liga]} {l.liga}
                      </span>
                      <span className="text-blue-300/60 text-sm">{l.stevilo} igralcev</span>
                    </div>
                    <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                        style={{width: `${igralci.length > 0 ? (l.stevilo / igralci.length) * 100 : 0}%`}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 igralci */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
              <h3 className="font-black text-lg mb-4">🏆 Top 5 igralcev</h3>
              <div className="space-y-3">
                {[...igralci].sort((a, b) => b.zmage - a.zmage).slice(0, 5).map((ig, idx) => (
                  <div key={ig.id} className="flex items-center gap-3">
                    <div className="text-lg w-6 text-center">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">{ig.ime} {ig.priimek}</div>
                      <div className={`text-xs capitalize ${LIGA_BARVA[ig.liga]?.split(' ')[0]}`}>{LIGA_EMOJI[ig.liga]} {ig.liga}</div>
                    </div>
                    <div className="text-green-400 font-black">{ig.zmage}W</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}