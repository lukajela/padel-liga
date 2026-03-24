'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Turnirji() {
  const [profil, setProfil] = useState<any>(null)
  const [turnirji, setTurnirji] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [zavihek, setZavihek] = useState<'vsi' | 'moji'>('vsi')
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

    const { data: t } = await supabase
      .from('turnirji')
      .select('*, created_by_profil:created_by(*), prijave:turnir_prijave(count)')
      .order('datum', { ascending: true })
    setTurnirji(t || [])
    setLoading(false)
  }

  const prijaviSe = async (turnirId: string) => {
    await supabase.from('turnir_prijave').insert({
      turnir_id: turnirId,
      igralec_id: profil.id
    })
    nalozi()
  }

  const odjaviSe = async (turnirId: string) => {
    await supabase.from('turnir_prijave').delete()
      .eq('turnir_id', turnirId)
      .eq('igralec_id', profil.id)
    nalozi()
  }

  const STATUS_BARVA: Record<string, string> = {
    prijavovanje: 'text-green-400 border-green-600 bg-green-900/20',
    aktiven: 'text-yellow-400 border-yellow-600 bg-yellow-900/20',
    koncan: 'text-gray-400 border-gray-600 bg-gray-900/20',
  }

  const STATUS_LABEL: Record<string, string> = {
    prijavovanje: '🟢 Prijave odprte',
    aktiven: '⚡ V teku',
    koncan: '🏁 Končan',
  }

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  const mojiTurnirji = turnirji.filter(t =>
    t.prijave?.some((p: any) => p.igralec_id === profil?.id)
  )

  const prikazani = zavihek === 'vsi' ? turnirji : mojiTurnirji

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
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="text-blue-400/60 text-sm uppercase tracking-widest mb-2">Tekmovanja</div>
            <h1 className="text-4xl font-black mb-2">🏆 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Turnirji</span></h1>
            <p className="text-blue-300/50">Prijavi se na turnir in tekmuj za zmago</p>
          </div>
          {profil?.is_admin && (
            <Link href="/turnirji/ustvari"
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
              + Nov turnir
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setZavihek('vsi')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === 'vsi' ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
            🏆 Vsi turnirji ({turnirji.length})
          </button>
          <button onClick={() => setZavihek('moji')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === 'moji' ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
            👤 Moji turnirji ({mojiTurnirji.length})
          </button>
        </div>

        {/* Turnirji */}
        {prikazani.length === 0 ? (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-16 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-blue-300/50 text-xl font-bold mb-2">Ni turnirjev</p>
            <p className="text-blue-400/30 text-sm">
              {zavihek === 'moji' ? 'Še nisi prijavljen na noben turnir' : 'Admin bo kmalu dodal turnirje'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prikazani.map(t => {
              const prijavljen = t.prijave?.some((p: any) => p.igralec_id === profil?.id)
              const steviloPrijav = t.prijave?.length || 0
              const polno = steviloPrijav >= t.max_igralcev

              return (
                <div key={t.id} className="bg-[#051525] border border-blue-800/30 hover:border-blue-600/40 rounded-2xl p-6 transition-all">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-xl font-black">{t.ime}</h3>
                        <span className={`border px-3 py-1 rounded-full text-xs font-bold ${STATUS_BARVA[t.status]}`}>
                          {STATUS_LABEL[t.status]}
                        </span>
                      </div>
                      {t.opis && <p className="text-blue-300/50 text-sm">{t.opis}</p>}
                    </div>
                    <Link href={`/turnirji/${t.id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors">
                      Podrobnosti →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    {t.datum && (
                      <div className="bg-blue-900/20 rounded-xl p-3">
                        <div className="text-blue-400/50 text-xs mb-1">📅 Datum</div>
                        <div className="font-bold text-sm">{new Date(t.datum).toLocaleDateString('sl-SI')}</div>
                      </div>
                    )}
                    {t.lokacija && (
                      <div className="bg-blue-900/20 rounded-xl p-3">
                        <div className="text-blue-400/50 text-xs mb-1">📍 Lokacija</div>
                        <div className="font-bold text-sm">{t.lokacija}</div>
                      </div>
                    )}
                    <div className="bg-blue-900/20 rounded-xl p-3">
                      <div className="text-blue-400/50 text-xs mb-1">👥 Prijave</div>
                      <div className={`font-bold text-sm ${polno ? 'text-red-400' : 'text-green-400'}`}>
                        {steviloPrijav} / {t.max_igralcev}
                      </div>
                    </div>
                    <div className="bg-blue-900/20 rounded-xl p-3">
                      <div className="text-blue-400/50 text-xs mb-1">🏆 Format</div>
                      <div className="font-bold text-sm">Izločilni</div>
                    </div>
                  </div>

                  {/* Progress bar prijav */}
                  <div className="mb-5">
                    <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${polno ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`}
                        style={{width: `${(steviloPrijav / t.max_igralcev) * 100}%`}} />
                    </div>
                  </div>

                  {t.status === 'prijavovanje' && (
                    prijavljen ? (
                      <div className="flex gap-3">
                        <div className="flex-1 bg-green-900/20 border border-green-500/30 text-green-400 py-3 rounded-xl font-bold text-sm text-center">
                          ✅ Prijavljen
                        </div>
                        <button onClick={() => odjaviSe(t.id)}
                          className="border border-red-700/50 text-red-400 hover:bg-red-900/20 px-5 py-3 rounded-xl font-bold text-sm transition-all">
                          Odjava
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => prijaviSe(t.id)}
                        disabled={polno}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-30">
                        {polno ? '❌ Turnir je poln' : '🏆 Prijavi se'}
                      </button>
                    )
                  )}

                  {t.status === 'aktiven' && (
                    <Link href={`/turnirji/${t.id}`}
                      className="block w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-white py-3 rounded-xl font-bold text-center transition-all">
                      ⚡ Poglej bracket
                    </Link>
                  )}

                  {t.status === 'koncan' && t.zmagovalec_id && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                      <span className="text-yellow-400 font-bold">🏆 Zmagovalec: </span>
                      <span className="text-white font-black">proglašen</span>
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