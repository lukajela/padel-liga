'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Povabila() {
  const [profil, setProfil] = useState<any>(null)
  const [prejeta, setPrejeta] = useState<any[]>([])
  const [poslana, setPoslana] = useState<any[]>([])
  const [aktivne, setAktivne] = useState<any[]>([])
  const [zavihek, setZavihek] = useState<'prejeta' | 'poslana' | 'aktivne'>('prejeta')
  const [loading, setLoading] = useState(true)
  const [rezultatModal, setRezultatModal] = useState<any>(null)
  const [set1moj, setSet1moj] = useState('')
  const [set1nas, setSet1nas] = useState('')
  const [set2moj, setSet2moj] = useState('')
  const [set2nas, setSet2nas] = useState('')
  const [set3moj, setSet3moj] = useState('')
  const [set3nas, setSet3nas] = useState('')
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

    // Prejeta povabila
    const { data: prej } = await supabase
      .from('povabila')
      .select('*, povabitelj:povabitelj_id(*)')
      .eq('povabljenec_id', user.id)
      .eq('status', 'caka')
      .order('created_at', { ascending: false })
    setPrejeta(prej || [])

    // Poslana povabila
    const { data: posl } = await supabase
      .from('povabila')
      .select('*, povabljenec:povabljenec_id(*)')
      .eq('povabitelj_id', user.id)
      .eq('status', 'caka')
      .order('created_at', { ascending: false })
    setPoslana(posl || [])

    // Aktivne tekme (sprejete)
    const { data: akt } = await supabase
      .from('povabila')
      .select('*, povabitelj:povabitelj_id(*), povabljenec:povabljenec_id(*)')
      .or(`povabitelj_id.eq.${user.id},povabljenec_id.eq.${user.id}`)
      .eq('status', 'sprejeto')
      .order('created_at', { ascending: false })
    setAktivne(akt || [])

    setLoading(false)
  }

  const sprejmiPovabilo = async (povabilo: any) => {
    await supabase.from('povabila').update({ status: 'sprejeto' }).eq('id', povabilo.id)

    // Pošlji email povabitelju
    await fetch('/api/sprejmi-povabilo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        povabiloId: povabilo.id,
        emailPovabitelja: povabilo.povabitelj.email,
        imePovabljeneca: `${profil.ime} ${profil.priimek}`
      })
    })

    nalozi()
  }

  const zavrniPovabilo = async (id: string) => {
    await supabase.from('povabila').update({ status: 'zavrnjeno' }).eq('id', id)
    nalozi()
  }

  const vnesiRezultat = async (povabilo: any) => {
    const jePovabitelj = povabilo.povabitelj_id === profil.id
    const mojeSete = [
      parseInt(jePovabitelj ? set1moj : set1nas) > parseInt(jePovabitelj ? set1nas : set1moj) ? 1 : 0,
      parseInt(jePovabitelj ? set2moj : set2nas) > parseInt(jePovabitelj ? set2nas : set2moj) ? 1 : 0,
      set3moj && set3nas ? (parseInt(jePovabitelj ? set3moj : set3nas) > parseInt(jePovabitelj ? set3nas : set3moj) ? 1 : 0) : 0,
    ].reduce((a, b) => a + b, 0)
    const nasSeti = (set3moj && set3nas ? 3 : 2) - mojeSete

    const rezultat = `${set1moj}-${set1nas}, ${set2moj}-${set2nas}${set3moj ? `, ${set3moj}-${set3nas}` : ''}`
    const zmaga = mojeSete > nasSeti

    const updateData = jePovabitelj
      ? { rezultat_povabitelj: rezultat, potrjeno_povabitelj: true }
      : { rezultat_povabljenec: rezultat, potrjeno_povabljenec: true }

    await supabase.from('povabila').update(updateData).eq('id', povabilo.id)

    // Preveri če oba potrdila
    const { data: posodobljeno } = await supabase.from('povabila').select('*').eq('id', povabilo.id).single()

    if (posodobljeno?.potrjeno_povabitelj && posodobljeno?.potrjeno_povabljenec) {
      // Oba sta potrdila – zaključi tekmo
      const zmagovalecId = zmaga ? profil.id : (jePovabitelj ? povabilo.povabljenec_id : povabilo.povabitelj_id)
      await supabase.from('povabila').update({ status: 'koncano', zmagovalec_id: zmagovalecId }).eq('id', povabilo.id)

      // Posodobi statistiko
      await supabase.from('profiles').update({ zmage: profil.zmage + (zmaga ? 1 : 0), porazi: profil.porazi + (zmaga ? 0 : 1) }).eq('id', profil.id)

      const nasprotnik = jePovabitelj ? povabilo.povabljenec : povabilo.povabitelj
      await supabase.from('profiles').update({
        zmage: nasprotnik.zmage + (zmaga ? 0 : 1),
        porazi: nasprotnik.porazi + (zmaga ? 1 : 0)
      }).eq('id', nasprotnik.id)

      // Pošlji email obema
      await fetch('/api/potrdi-rezultat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email1: povabilo.povabitelj.email,
          email2: povabilo.povabljenec.email,
          ime1: `${povabilo.povabitelj.ime} ${povabilo.povabitelj.priimek}`,
          ime2: `${povabilo.povabljenec.ime} ${povabilo.povabljenec.priimek}`,
          rezultat,
          zmagovalec: zmaga ? `${profil.ime} ${profil.priimek}` : `${nasprotnik.ime} ${nasprotnik.priimek}`
        })
      })
    }

    setRezultatModal(null)
    setSet1moj(''); setSet1nas(''); setSet2moj(''); setSet2nas(''); setSet3moj(''); setSet3nas('')
    nalozi()
  }

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

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
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2">📬 Povabila & <span className="text-blue-400">Tekme</span></h1>
          <p className="text-blue-300/50">Sprejmi izzive in potrdi rezultate</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'prejeta', label: `📥 Prejeta (${prejeta.length})` },
            { id: 'poslana', label: `📤 Poslana (${poslana.length})` },
            { id: 'aktivne', label: `⚔️ Aktivne (${aktivne.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setZavihek(t.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === t.id ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* PREJETA */}
        {zavihek === 'prejeta' && (
          <div className="space-y-4">
            {prejeta.length === 0 ? (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-blue-300/50">Ni prejetih povabil</p>
              </div>
            ) : prejeta.map(p => (
              <div key={p.id} className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-black">
                    {p.povabitelj?.ime?.[0]}{p.povabitelj?.priimek?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-lg">{p.povabitelj?.ime} {p.povabitelj?.priimek}</div>
                    <div className="text-blue-400/50 text-sm">te izziva na tekmo!</div>
                  </div>
                  <div className="text-blue-400/30 text-xs">{new Date(p.created_at).toLocaleDateString('sl-SI')}</div>
                </div>
                {p.igrisca && <div className="bg-blue-900/20 rounded-xl p-3 mb-2 text-sm">📍 {p.igrisca}</div>}
                {p.termin && <div className="bg-blue-900/20 rounded-xl p-3 mb-4 text-sm">📅 {new Date(p.termin).toLocaleString('sl-SI')}</div>}
                <div className="flex gap-3">
                  <button onClick={() => zavrniPovabilo(p.id)}
                    className="flex-1 border border-red-700/50 text-red-400 py-3 rounded-xl font-bold transition-all hover:bg-red-900/20">
                    ❌ Zavrni
                  </button>
                  <button onClick={() => sprejmiPovabilo(p)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold transition-all">
                    ✅ Sprejmi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POSLANA */}
        {zavihek === 'poslana' && (
          <div className="space-y-4">
            {poslana.length === 0 ? (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">📤</div>
                <p className="text-blue-300/50">Ni poslanih povabil</p>
              </div>
            ) : poslana.map(p => (
              <div key={p.id} className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center font-black">
                    {p.povabljenec?.ime?.[0]}{p.povabljenec?.priimek?.[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-black">{p.povabljenec?.ime} {p.povabljenec?.priimek}</div>
                    <div className="text-yellow-400/70 text-sm">⏳ Čaka na odgovor</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AKTIVNE TEKME */}
        {zavihek === 'aktivne' && (
          <div className="space-y-4">
            {aktivne.length === 0 ? (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">⚔️</div>
                <p className="text-blue-300/50">Ni aktivnih tekem</p>
              </div>
            ) : aktivne.map(p => {
              const jePovabitelj = p.povabitelj_id === profil.id
              const nasprotnik = jePovabitelj ? p.povabljenec : p.povabitelj
              const jazPotrdil = jePovabitelj ? p.potrjeno_povabitelj : p.potrjeno_povabljenec
              return (
                <div key={p.id} className="bg-[#051525] border border-green-800/30 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-600/20 border border-green-500/40 flex items-center justify-center font-black">
                      {nasprotnik?.ime?.[0]}{nasprotnik?.priimek?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-black">{nasprotnik?.ime} {nasprotnik?.priimek}</div>
                      <div className="text-green-400/70 text-sm">✅ Tekma sprejeta!</div>
                    </div>
                  </div>
                  {p.igrisca && <div className="bg-blue-900/20 rounded-xl p-3 mb-2 text-sm">📍 {p.igrisca}</div>}

                  {jazPotrdil ? (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center text-yellow-400 font-bold">
                      ⏳ Čakam na potrditev nasprotnika...
                    </div>
                  ) : (
                    <button onClick={() => setRezultatModal(p)}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-3 rounded-xl font-bold transition-all">
                      📊 Vnesi rezultat
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* REZULTAT MODAL */}
      {rezultatModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 w-full max-w-md">
            <h3 className="font-black text-xl mb-2">📊 Vnesi rezultat</h3>
            {(() => {
              const jePovabitelj = rezultatModal.povabitelj_id === profil.id
              const nasprotnik = jePovabitelj ? rezultatModal.povabljenec : rezultatModal.povabitelj
              return <p className="text-blue-300/50 mb-6">vs {nasprotnik?.ime} {nasprotnik?.priimek}</p>
            })()}

            <div className="bg-[#020b18] border border-blue-800/30 rounded-2xl overflow-hidden mb-6">
              <div className="grid grid-cols-3 px-4 py-2 bg-blue-900/20 text-xs uppercase text-blue-400/60 font-bold">
                <div>Jaz</div>
                <div className="text-center">Set</div>
                <div className="text-right">Nasprotnik</div>
              </div>
              {[
                { label: '1', moj: set1moj, setMoj: setSet1moj, nas: set1nas, setNas: setSet1nas },
                { label: '2', moj: set2moj, setMoj: setSet2moj, nas: set2nas, setNas: setSet2nas },
                { label: '3 🔸', moj: set3moj, setMoj: setSet3moj, nas: set3nas, setNas: setSet3nas },
              ].map(s => (
                <div key={s.label} className="grid grid-cols-3 items-center px-4 py-3 border-t border-blue-800/20">
                  <input type="number" min="0" max="7" placeholder="0" value={s.moj}
                    onChange={e => s.setMoj(e.target.value)}
                    className="w-14 bg-blue-950/50 border border-blue-700/30 rounded-xl p-2 text-center text-lg font-black text-white outline-none" />
                  <div className="text-center text-blue-400/40 text-xs font-bold">SET {s.label}</div>
                  <input type="number" min="0" max="7" placeholder="0" value={s.nas}
                    onChange={e => s.setNas(e.target.value)}
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
                disabled={!set1moj || !set1nas || !set2moj || !set2nas}
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