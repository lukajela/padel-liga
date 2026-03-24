'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function TurnirDetajl() {
  const [profil, setProfil] = useState<any>(null)
  const [turnir, setTurnir] = useState<any>(null)
  const [prijave, setPrijave] = useState<any[]>([])
  const [tekme, setTekme] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [rezultatModal, setRezultatModal] = useState<any>(null)
  const [set1p1, setSet1p1] = useState('')
  const [set1p2, setSet1p2] = useState('')
  const [set2p1, setSet2p1] = useState('')
  const [set2p2, setSet2p2] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    nalozi()
  }, [])

  const nalozi = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p) setProfil(p)

    const { data: t } = await supabase.from('turnirji').select('*').eq('id', params.id).single()
    if (t) setTurnir(t)

    const { data: pr } = await supabase
      .from('turnir_prijave')
      .select('*, igralec:igralec_id(*)')
      .eq('turnir_id', params.id)
    setPrijave(pr || [])

    const { data: tek } = await supabase
      .from('turnir_tekme')
      .select('*, igralec1:igralec1_id(*), igralec2:igralec2_id(*), zmagovalec:zmagovalec_id(*)')
      .eq('turnir_id', params.id)
      .order('krog', { ascending: true })
      .order('pozicija', { ascending: true })
    setTekme(tek || [])

    setLoading(false)
  }

  const zacniTurnir = async () => {
    if (prijave.length < 2) return

    const premesani = [...prijave].sort(() => Math.random() - 0.5)
    const tekmeZaVstaviti = []

    for (let i = 0; i < premesani.length; i += 2) {
      if (premesani[i + 1]) {
        tekmeZaVstaviti.push({
          turnir_id: params.id,
          krog: 1,
          pozicija: i / 2 + 1,
          igralec1_id: premesani[i].igralec_id,
          igralec2_id: premesani[i + 1].igralec_id,
          status: 'caka'
        })
      }
    }

    await supabase.from('turnir_tekme').insert(tekmeZaVstaviti)
    await supabase.from('turnirji').update({ status: 'aktiven' }).eq('id', params.id)

    // Pošlji email vsem prijavljenim
    await fetch('/api/turnir-zacet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnirId: params.id,
        turnirIme: turnir.ime,
        turnirDatum: turnir.datum,
        turnirLokacija: turnir.lokacija,
      })
    })

    nalozi()
  }

  const vnesiRezultat = async (tekma: any) => {
    const z1 = parseInt(set1p1) > parseInt(set1p2) ? 1 : 0
    const z2 = parseInt(set2p1) > parseInt(set2p2) ? 1 : 0
    const zmaga1 = z1 + z2 >= 2 || (z1 + z2 === 1)
    const zmagovalecId = (parseInt(set1p1) + parseInt(set2p1)) > (parseInt(set1p2) + parseInt(set2p2))
      ? tekma.igralec1_id : tekma.igralec2_id

    await supabase.from('turnir_tekme').update({
      rezultat_igralec1: `${set1p1}-${set1p2}, ${set2p1}-${set2p2}`,
      rezultat_igralec2: `${set1p2}-${set1p1}, ${set2p2}-${set2p1}`,
      zmagovalec_id: zmagovalecId,
      status: 'koncana'
    }).eq('id', tekma.id)

    // Preveri ali so vse tekme v krogu končane
    const { data: kroTekme } = await supabase
      .from('turnir_tekme')
      .select('*')
      .eq('turnir_id', params.id)
      .eq('krog', tekma.krog)

    const vseKoncane = kroTekme?.every(t => t.status === 'koncana' || t.id === tekma.id)

    if (vseKoncane && kroTekme) {
      const zmagovalci = kroTekme.map(t =>
        t.id === tekma.id ? zmagovalecId : t.zmagovalec_id
      ).filter(Boolean)

      if (zmagovalci.length === 1) {
        // Konec turnirja
        await supabase.from('turnirji').update({
          status: 'koncan',
          zmagovalec_id: zmagovalci[0]
        }).eq('id', params.id)
      } else if (zmagovalci.length > 1) {
        // Naslednji krog
        const noveTekme = []
        for (let i = 0; i < zmagovalci.length; i += 2) {
          if (zmagovalci[i + 1]) {
            noveTekme.push({
              turnir_id: params.id,
              krog: tekma.krog + 1,
              pozicija: i / 2 + 1,
              igralec1_id: zmagovalci[i],
              igralec2_id: zmagovalci[i + 1],
              status: 'caka'
            })
          }
        }
        await supabase.from('turnir_tekme').insert(noveTekme)
      }
    }

    setRezultatModal(null)
    setSet1p1(''); setSet1p2(''); setSet2p1(''); setSet2p2('')
    nalozi()
  }

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  const krogi = [...new Set(tekme.map(t => t.krog))].sort()

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

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black mb-2">{turnir?.ime}</h1>
              {turnir?.opis && <p className="text-blue-300/50 mb-3">{turnir.opis}</p>}
              <div className="flex flex-wrap gap-3">
                {turnir?.lokacija && <span className="text-sm text-blue-300/60">📍 {turnir.lokacija}</span>}
                {turnir?.datum && <span className="text-sm text-blue-300/60">📅 {new Date(turnir.datum).toLocaleDateString('sl-SI')}</span>}
                <span className="text-sm text-blue-300/60">👥 {prijave.length}/{turnir?.max_igralcev}</span>
              </div>
            </div>
            {profil?.is_admin && turnir?.status === 'prijavovanje' && prijave.length >= 2 && (
              <button onClick={zacniTurnir}
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl font-black transition-all shadow-[0_4px_20px_rgba(34,197,94,0.3)]">
                ⚡ Začni turnir
              </button>
            )}
          </div>
        </div>

        {/* Zmagovalec */}
        {turnir?.status === 'koncan' && (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-8 mb-6 text-center">
            <div className="text-6xl mb-3">🏆</div>
            <h2 className="text-2xl font-black text-yellow-400 mb-2">Zmagovalec turnirja!</h2>
            <div className="text-3xl font-black text-white">
              {tekme.find(t => t.zmagovalec_id === turnir.zmagovalec_id)?.zmagovalec?.ime}{' '}
              {tekme.find(t => t.zmagovalec_id === turnir.zmagovalec_id)?.zmagovalec?.priimek}
            </div>
          </div>
        )}

        {/* Prijavljeni */}
        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6 mb-6">
          <h3 className="font-black text-lg mb-4">👥 Prijavljeni ({prijave.length})</h3>
          {prijave.length === 0 ? (
            <p className="text-blue-400/30 text-sm">Ni prijavljenih igralcev</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {prijave.map(p => (
                <div key={p.id} className="bg-blue-900/20 rounded-xl p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-black mx-auto mb-2">
                    {p.igralec?.ime?.[0]}{p.igralec?.priimek?.[0]}
                  </div>
                  <div className="font-bold text-sm">{p.igralec?.ime}</div>
                  <div className="text-blue-400/40 text-xs">{p.igralec?.priimek}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bracket */}
        {tekme.length > 0 && (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
            <h3 className="font-black text-lg mb-6">🏆 Bracket</h3>
            <div className="space-y-8">
              {krogi.map(krog => (
                <div key={krog}>
                  <h4 className="text-blue-400/60 text-xs uppercase tracking-wider mb-3 font-bold">
                    {krog === Math.max(...krogi) && turnir?.status === 'koncan' ? '🏆 Final' :
                     krog === Math.max(...krogi) - 1 ? '🥊 Polfinale' :
                     `Krog ${krog}`}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tekme.filter(t => t.krog === krog).map(tekma => (
                      <div key={tekma.id} className={`border rounded-2xl p-4 ${tekma.status === 'koncana' ? 'border-blue-800/30 bg-blue-900/10' : 'border-blue-600/40 bg-blue-900/20'}`}>
                        {/* Igralec 1 */}
                        <div className={`flex items-center justify-between p-3 rounded-xl mb-2 ${tekma.zmagovalec_id === tekma.igralec1_id ? 'bg-green-900/30 border border-green-500/30' : 'bg-blue-950/30'}`}>
                          <div className="flex items-center gap-2">
                            {tekma.zmagovalec_id === tekma.igralec1_id && <span>🏆</span>}
                            <span className="font-bold text-sm">{tekma.igralec1?.ime} {tekma.igralec1?.priimek}</span>
                          </div>
                          {tekma.rezultat_igralec1 && (
                            <span className="text-blue-400/60 text-xs">{tekma.rezultat_igralec1}</span>
                          )}
                        </div>

                        <div className="text-center text-blue-400/30 text-xs my-1">VS</div>

                        {/* Igralec 2 */}
                        <div className={`flex items-center justify-between p-3 rounded-xl mb-3 ${tekma.zmagovalec_id === tekma.igralec2_id ? 'bg-green-900/30 border border-green-500/30' : 'bg-blue-950/30'}`}>
                          <div className="flex items-center gap-2">
                            {tekma.zmagovalec_id === tekma.igralec2_id && <span>🏆</span>}
                            <span className="font-bold text-sm">{tekma.igralec2?.ime} {tekma.igralec2?.priimek}</span>
                          </div>
                          {tekma.rezultat_igralec2 && (
                            <span className="text-blue-400/60 text-xs">{tekma.rezultat_igralec2}</span>
                          )}
                        </div>

                        {tekma.status !== 'koncana' && (
                          tekma.igralec1_id === profil?.id || tekma.igralec2_id === profil?.id || profil?.is_admin
                        ) && (
                          <button onClick={() => setRezultatModal(tekma)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-bold text-sm transition-all">
                            📊 Vnesi rezultat
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rezultat Modal */}
      {rezultatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-black text-xl mb-2">📊 Vnesi rezultat</h3>
            <p className="text-blue-300/50 mb-6">
              {rezultatModal.igralec1?.ime} vs {rezultatModal.igralec2?.ime}
            </p>

            <div className="bg-[#020b18] border border-blue-800/30 rounded-2xl overflow-hidden mb-6">
              <div className="grid grid-cols-3 px-4 py-2 bg-blue-900/20 text-xs uppercase text-blue-400/60 font-bold">
                <div>{rezultatModal.igralec1?.ime}</div>
                <div className="text-center">Set</div>
                <div className="text-right">{rezultatModal.igralec2?.ime}</div>
              </div>
              {[
                { label: '1', p1: set1p1, setP1: setSet1p1, p2: set1p2, setP2: setSet1p2 },
                { label: '2', p1: set2p1, setP1: setSet2p1, p2: set2p2, setP2: setSet2p2 },
              ].map(s => (
                <div key={s.label} className="grid grid-cols-3 items-center px-4 py-3 border-t border-blue-800/20">
                  <input type="number" min="0" max="7" placeholder="0" value={s.p1}
                    onChange={e => s.setP1(e.target.value)}
                    className="w-14 bg-blue-950/50 border border-blue-700/30 rounded-xl p-2 text-center text-lg font-black text-white outline-none" />
                  <div className="text-center text-blue-400/40 text-xs font-bold">SET {s.label}</div>
                  <input type="number" min="0" max="7" placeholder="0" value={s.p2}
                    onChange={e => s.setP2(e.target.value)}
                    className="w-14 ml-auto bg-blue-950/50 border border-blue-700/30 rounded-xl p-2 text-center text-lg font-black text-white outline-none" />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setRezultatModal(null)}
                className="flex-1 border border-blue-700/50 text-blue-300 py-3 rounded-xl font-bold">
                Prekliči
              </button>
              <button
                onClick={() => vnesiRezultat(rezultatModal)}
                disabled={!set1p1 || !set1p2 || !set2p1 || !set2p2}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold disabled:opacity-30">
                ✅ Potrdi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}