'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Tekma() {
  const [profil, setProfil] = useState<any>(null)
  const [korak, setKorak] = useState<'zacni' | 'vnos' | 'rezultat'>('zacni')
  const [nasprotnik, setNasprotnik] = useState('')
  const [set1moj, setSet1moj] = useState('')
  const [set1nas, setSet1nas] = useState('')
  const [set2moj, setSet2moj] = useState('')
  const [set2nas, setSet2nas] = useState('')
  const [set3moj, setSet3moj] = useState('')
  const [set3nas, setSet3nas] = useState('')
  const [loading, setLoading] = useState(false)
  const [shranjeno, setShranjeno] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfil(data)
    }
    nalozi()
  }, [])

  const izracunajZmagovalca = () => {
    let mojeSete = 0
    let nasSete = 0
    if (set1moj && set1nas) { parseInt(set1moj) > parseInt(set1nas) ? mojeSete++ : nasSete++ }
    if (set2moj && set2nas) { parseInt(set2moj) > parseInt(set2nas) ? mojeSete++ : nasSete++ }
    if (set3moj && set3nas) { parseInt(set3moj) > parseInt(set3nas) ? mojeSete++ : nasSete++ }
    return { mojeSete, nasSete, zmaga: mojeSete > nasSete }
  }

  const shraniTekmo = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { zmaga, mojeSete, nasSete } = izracunajZmagovalca()

    const novoZmage = zmaga ? (profil.zmage + 1) : profil.zmage
    const novoPorazi = !zmaga ? (profil.porazi + 1) : profil.porazi

    const LIGA_ZMAGE: Record<string, number> = {
      starter: 5, challenger: 8, competitor: 10, pro: 12
    }
    const NASLEDNJA_LIGA: Record<string, string> = {
      starter: 'challenger', challenger: 'competitor', competitor: 'pro', pro: 'elite'
    }

    let novaLiga = profil.liga
    const potrebno = LIGA_ZMAGE[profil.liga]
    if (potrebno && novoZmage >= potrebno && NASLEDNJA_LIGA[profil.liga]) {
      novaLiga = NASLEDNJA_LIGA[profil.liga]
    }

    await supabase.from('profiles').update({
      zmage: novoZmage,
      porazi: novoPorazi,
      liga: novaLiga,
    }).eq('id', user.id)

    // Preveri značke
    const novaZnacka: string[] = []

    // Prva tekma
    if (profil.zmage + profil.porazi === 0) {
      await fetch('/api/dodaj-znacko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igralecId: user.id, tip: 'prva_tekma' })
      })
      novaZnacka.push('🎾 Prva tekma')
    }

    // Prva zmaga
    if (zmaga && profil.zmage === 0) {
      await fetch('/api/dodaj-znacko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igralecId: user.id, tip: 'prva_zmaga' })
      })
      novaZnacka.push('🏆 Prva zmaga')
    }

    // 5 zmag zapored - preveri zadnjih 5 tekem
    if (zmaga) {
      const { data: zadnjeTekme } = await supabase
        .from('povabila')
        .select('zmagovalec_id')
        .or(`povabitelj_id.eq.${user.id},povabljenec_id.eq.${user.id}`)
        .eq('status', 'koncano')
        .order('created_at', { ascending: false })
        .limit(4)

      const vsaZmage = zadnjeTekme?.every(t => t.zmagovalec_id === user.id)
      if (vsaZmage && (zadnjeTekme?.length || 0) >= 4) {
        await fetch('/api/dodaj-znacko', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ igralecId: user.id, tip: 'pet_zmag_zapored' })
        })
        novaZnacka.push('🔥 5 zmag zapored')
      }
    }

    // Napredovanje v ligo
    if (novaLiga !== profil.liga) {
      await fetch('/api/dodaj-znacko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igralecId: user.id, tip: 'napredovanje' })
      })
      novaZnacka.push('⚡ Napredovanje')
    }

    // Elite liga
    if (novaLiga === 'elite') {
      await fetch('/api/dodaj-znacko', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ igralecId: user.id, tip: 'elite_liga' })
      })
      novaZnacka.push('👑 Elite liga')
    }

    setShranjeno({ zmaga, mojeSete, nasSete, novaLiga, napredoval: novaLiga !== profil.liga, novaZnacka })
    setKorak('rezultat')
    setLoading(false)
  }

  if (!profil) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse">Nalagam...</div>
    </main>
  )

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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10">

        {/* KORAK 1 - Začni tekmo */}
        {korak === 'zacni' && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⚔️</div>
              <h1 className="text-3xl font-black mb-2">Začni <span className="text-blue-400">Tekmo</span></h1>
              <p className="text-blue-300/50">Vnesi nasprotnika in začni igrati</p>
            </div>

            {/* Tvoj profil */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6 mb-4">
              <p className="text-blue-400/60 text-xs uppercase tracking-wider mb-3">Ti igraš kot</p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <div className="font-black text-lg">{profil.ime} {profil.priimek}</div>
                  <div className="text-blue-400/60 text-sm capitalize">{profil.liga} Liga</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-green-400 font-bold">{profil.zmage}W</div>
                  <div className="text-red-400 font-bold">{profil.porazi}L</div>
                </div>
              </div>
            </div>

            <div className="text-center text-blue-400/40 text-2xl my-3">VS</div>

            {/* Nasprotnik */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6 mb-8">
              <p className="text-blue-400/60 text-xs uppercase tracking-wider mb-3">Nasprotnik</p>
              <input
                placeholder="Ime nasprotnika..."
                value={nasprotnik}
                onChange={e => setNasprotnik(e.target.value)}
                className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
            </div>

            <button
              onClick={() => nasprotnik && setKorak('vnos')}
              disabled={!nasprotnik}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] disabled:opacity-30">
              ⚔️ Začni Tekmo
            </button>
          </div>
        )}

        {/* KORAK 2 - Vnos rezultatov */}
        {korak === 'vnos' && (
          <div>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📊</div>
              <h1 className="text-3xl font-black mb-2">Vnesi <span className="text-blue-400">Rezultat</span></h1>
              <p className="text-blue-300/50">{profil.ime} vs {nasprotnik}</p>
            </div>

            {/* Set tabela */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden mb-6">
              {/* Header */}
              <div className="grid grid-cols-3 bg-blue-900/20 px-6 py-3 text-xs uppercase tracking-wider text-blue-400/60 font-bold">
                <div>{profil.ime}</div>
                <div className="text-center">Set</div>
                <div className="text-right">{nasprotnik}</div>
              </div>

              {/* Set 1 */}
              {[
                { label: '1', moj: set1moj, setMoj: setSet1moj, nas: set1nas, setNas: setSet1nas },
                { label: '2', moj: set2moj, setMoj: setSet2moj, nas: set2nas, setNas: setSet2nas },
                { label: '3', moj: set3moj, setMoj: setSet3moj, nas: set3nas, setNas: setSet3nas, opcijsko: true },
              ].map((set) => (
                <div key={set.label} className="grid grid-cols-3 items-center px-6 py-4 border-t border-blue-800/20">
                  <input
                    type="number" min="0" max="7"
                    placeholder="0"
                    value={set.moj}
                    onChange={e => set.setMoj(e.target.value)}
                    className="w-16 bg-blue-950/50 border border-blue-700/30 focus:border-blue-400 rounded-xl p-2 text-center text-xl font-black text-white outline-none transition-all"
                  />
                  <div className="text-center">
                    <span className="bg-blue-900/30 text-blue-300/60 text-xs px-3 py-1 rounded-full font-bold">
                      SET {set.label}{(set as any).opcijsko ? ' 🔸' : ''}
                    </span>
                  </div>
                  <input
                    type="number" min="0" max="7"
                    placeholder="0"
                    value={set.nas}
                    onChange={e => set.setNas(e.target.value)}
                    className="w-16 ml-auto bg-blue-950/50 border border-blue-700/30 focus:border-blue-400 rounded-xl p-2 text-center text-xl font-black text-white outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Preview rezultata */}
            {set1moj && set1nas && set2moj && set2nas && (
              <div className={`rounded-2xl p-4 mb-6 text-center border ${izracunajZmagovalca().zmaga ? 'bg-green-900/20 border-green-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                <div className="text-2xl mb-1">{izracunajZmagovalca().zmaga ? '🏆' : '😔'}</div>
                <div className={`font-black text-lg ${izracunajZmagovalca().zmaga ? 'text-green-400' : 'text-red-400'}`}>
                  {izracunajZmagovalca().zmaga ? 'ZMAGA!' : 'PORAZ'}
                </div>
                <div className="text-blue-300/60 text-sm mt-1">
                  {izracunajZmagovalca().mojeSete} : {izracunajZmagovalca().nasSete} v setih
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setKorak('zacni')}
                className="flex-1 border-2 border-blue-700 text-blue-300 py-4 rounded-2xl font-bold transition-all hover:bg-blue-900/30">
                ← Nazaj
              </button>
              <button
                onClick={shraniTekmo}
                disabled={!set1moj || !set1nas || !set2moj || !set2nas || loading}
                className="flex-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-[0_4px_20px_rgba(59,130,246,0.4)] disabled:opacity-30">
                {loading ? 'Shranjujem...' : '✅ Potrdi Rezultat'}
              </button>
            </div>
          </div>
        )}

        {/* KORAK 3 - Rezultat shranjen */}
        {korak === 'rezultat' && shranjeno && (
          <div className="text-center">
            <div className={`text-8xl mb-6 ${shranjeno.zmaga ? 'animate-bounce' : ''}`}>
              {shranjeno.zmaga ? '🏆' : '😔'}
            </div>

            <h1 className={`text-4xl font-black mb-2 ${shranjeno.zmaga ? 'text-green-400' : 'text-red-400'}`}>
              {shranjeno.zmaga ? 'ZMAGA!' : 'PORAZ'}
            </h1>
            <p className="text-blue-300/60 mb-8">
              {shranjeno.mojeSete} : {shranjeno.nasSete} v setih proti {nasprotnik}
            </p>

            {/* Napredovanje */}
            {shranjeno.napredoval && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8 animate-pulse">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-yellow-400 font-black text-xl">NAPREDOVAL SI!</div>
                <div className="text-yellow-300/70 mt-1 capitalize">
                  Dobrodošel v <strong>{shranjeno.novaLiga} Ligi</strong>!
                </div>
              </div>
            )}

            {/* Nove značke */}
            {shranjeno.novaZnacka?.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6 mb-6">
                <div className="text-center mb-3">
                  <div className="text-3xl mb-1">🏅</div>
                  <div className="text-purple-400 font-black">Nova značka!</div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {shranjeno.novaZnacka.map((z: string) => (
                    <span key={z} className="bg-purple-900/30 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-sm font-bold">
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nova statistika */}
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6 mb-8">
              <p className="text-blue-400/60 text-xs uppercase tracking-wider mb-4">Tvoja statistika</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-black text-green-400">{profil.zmage + (shranjeno.zmaga ? 1 : 0)}</div>
                  <div className="text-xs text-blue-300/50 mt-1">Zmage</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-red-400">{profil.porazi + (!shranjeno.zmaga ? 1 : 0)}</div>
                  <div className="text-xs text-blue-300/50 mt-1">Porazi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-blue-400 capitalize">{shranjeno.novaLiga}</div>
                  <div className="text-xs text-blue-300/50 mt-1">Liga</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setKorak('zacni'); setNasprotnik(''); setSet1moj(''); setSet1nas(''); setSet2moj(''); setSet2nas(''); setSet3moj(''); setSet3nas('') }}
                className="flex-1 border-2 border-blue-700 text-blue-300 py-4 rounded-2xl font-bold transition-all hover:bg-blue-900/30">
                🎾 Nova Tekma
              </button>
              <Link href="/dashboard"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-2xl font-black transition-all text-center shadow-[0_4px_20px_rgba(59,130,246,0.4)]">
                Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}