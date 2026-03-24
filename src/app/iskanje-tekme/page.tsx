'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const IGRISCA_LISTA = [
  'Ludus Beach Park, Ljubljana',
  'Padel Tivoli, Ljubljana',
  'Pin Padel, Maribor',
  'Šport park Krsnik, Maribor',
  'Vogu Center, Kranj',
  'Harmonija Padel, Mengeš',
]

export default function IskanjeTekcme() {
  const [mojProfil, setMojProfil] = useState<any>(null)
  const [iscem, setIscem] = useState(false)
  const [nasprotniki, setNasprotniki] = useState<any[]>([])
  const [izbIgrisca, setIzbIgrisca] = useState('')
  const [termin, setTermin] = useState('')
  const [loading, setLoading] = useState(true)
  const [poslanoPovabilo, setPoslanoPovabilo] = useState<string | null>(null)
  const [posiljam, setPosiljam] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setMojProfil(data)

        // Preveri ali je timeout potekel
        if (data.isci_tekmo && data.isci_tekmo_cas) {
          const dveUri = new Date(Date.now() - 2 * 60 * 60 * 1000)
          const casOnline = new Date(data.isci_tekmo_cas)
          if (casOnline < dveUri) {
            // Timeout potekel – izklopi
            await supabase.from('profiles').update({
              isci_tekmo: false,
              isci_tekmo_cas: null
            }).eq('id', user.id)
            setIscem(false)
          } else {
            setIscem(data.isci_tekmo)
          }
        } else {
          setIscem(data.isci_tekmo || false)
        }
      }
      setLoading(false)
    }
    nalozi()
  }, [])

  const isciNasprotnike = async () => {
    if (!mojProfil) return

    // Avtomatsko izklopi tiste ki so online več kot 2h
    const dveUri = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    await supabase.from('profiles')
      .update({ isci_tekmo: false, isci_tekmo_cas: null })
      .eq('isci_tekmo', true)
      .lt('isci_tekmo_cas', dveUri)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('liga', mojProfil.liga)
      .eq('isci_tekmo', true)
      .neq('id', mojProfil.id)
      .limit(10)
    setNasprotniki(data || [])
  }

  const toggleIscemTekmo = async () => {
    const nov = !iscem
    setIscem(nov)
    if (nov) {
      await isciNasprotnike()
      await supabase.from('profiles').update({
        isci_tekmo: true,
        isci_tekmo_cas: new Date().toISOString()
      }).eq('id', mojProfil.id)
    } else {
      await supabase.from('profiles').update({
        isci_tekmo: false,
        isci_tekmo_cas: null
      }).eq('id', mojProfil.id)
      setNasprotniki([])
    }
  }

  const posliPovabilo = async (nasprotnik: any) => {
    setPosiljam(nasprotnik.id)
    try {
      await fetch('/api/povabilo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNasprotnika: nasprotnik.email,
          imePovabitelja: `${mojProfil.ime} ${mojProfil.priimek}`,
          liga: mojProfil.liga,
          igrisca: izbIgrisca,
          termin: termin,
          povabiteljaId: mojProfil.id,
          povabljenecId: nasprotnik.id,
        })
      })
      setPoslanoPovabilo(nasprotnik.id)
    } catch (e) {
      console.error(e)
    }
    setPosiljam(null)
  }

  const winRatio = (z: number, p: number) => z + p > 0 ? Math.round((z / (z + p)) * 100) : 0

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
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Dashboard
        </Link>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8">
          <div className="text-blue-400/60 text-sm uppercase tracking-widest mb-2">Matchmaking</div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            🔍 Išči <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Tekmo</span>
          </h1>
          <p className="text-blue-300/50">Vklopi iskanje in sistem ti najde nasprotnike v tvoji ligi</p>
        </div>

        <div className={`rounded-2xl p-6 mb-8 border transition-all duration-500 ${iscem ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]' : 'bg-[#051525] border-blue-800/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600/20 border-2 border-blue-500/50 flex items-center justify-center text-2xl">👤</div>
              <div>
                <div className="font-black text-lg">{mojProfil?.ime} {mojProfil?.priimek}</div>
                <div className={`text-sm capitalize flex items-center gap-1 ${LIGA_BARVA[mojProfil?.liga]?.split(' ')[0]}`}>
                  {LIGA_EMOJI[mojProfil?.liga]} {mojProfil?.liga} Liga
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button onClick={toggleIscemTekmo}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 ${iscem ? 'bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-blue-900/50 border border-blue-800'}`}>
                <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${iscem ? 'left-9 bg-white' : 'left-1 bg-blue-400/50'}`} />
              </button>
              <span className={`text-xs font-bold ${iscem ? 'text-blue-400' : 'text-blue-400/40'}`}>
                {iscem ? '🟢 IŠČEM' : '⚫ NEAKTIVEN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-blue-900/20 rounded-xl p-3">
              <div className="text-xl font-black text-green-400">{mojProfil?.zmage || 0}</div>
              <div className="text-xs text-blue-300/50 mt-1">Zmage</div>
            </div>
            <div className="bg-blue-900/20 rounded-xl p-3">
              <div className="text-xl font-black text-red-400">{mojProfil?.porazi || 0}</div>
              <div className="text-xs text-blue-300/50 mt-1">Porazi</div>
            </div>
            <div className="bg-blue-900/20 rounded-xl p-3">
              <div className="text-xl font-black text-blue-400">{winRatio(mojProfil?.zmage || 0, mojProfil?.porazi || 0)}%</div>
              <div className="text-xs text-blue-300/50 mt-1">Win %</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-5">
            <label className="text-blue-400/60 text-xs uppercase tracking-wider font-bold mb-3 block">📍 Lokacija</label>
            <select value={izbIgrisca} onChange={e => setIzbIgrisca(e.target.value)}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all text-sm cursor-pointer">
              <option value="">Katerokoli igrišče</option>
              {IGRISCA_LISTA.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
            {izbIgrisca && (
              <a href="https://www.courtplay.si" target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-blue-400 hover:text-blue-300 text-xs transition-colors">
                🔗 Rezerviraj igrišče →
              </a>
            )}
          </div>
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-5">
            <label className="text-blue-400/60 text-xs uppercase tracking-wider font-bold mb-3 block">📅 Termin</label>
            <input type="datetime-local" value={termin} onChange={e => setTermin(e.target.value)}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all text-sm [color-scheme:dark]"
            />
          </div>
        </div>

        {iscem && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-xl">Dostopni nasprotniki
                <span className={`ml-2 text-sm font-normal capitalize ${LIGA_BARVA[mojProfil?.liga]?.split(' ')[0]}`}>
                  {LIGA_EMOJI[mojProfil?.liga]} {mojProfil?.liga} Liga
                </span>
              </h2>
              <button onClick={isciNasprotnike}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                🔄 Osveži
              </button>
            </div>

            {nasprotniki.length === 0 ? (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-blue-300/50 text-lg font-bold">Iščem nasprotnike...</p>
                <p className="text-blue-400/30 text-sm mt-2">Ni aktivnih igralcev v tvoji ligi trenutno</p>
                <p className="text-blue-400/30 text-sm">Povabi prijatelja da se registrira!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nasprotniki.map(n => (
                  <div key={n.id}
                    className="bg-[#051525] border border-blue-800/30 hover:border-blue-500/50 rounded-2xl p-5 transition-all hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)] group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center font-black text-lg">
                        {n.ime?.[0]}{n.priimek?.[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-black text-base group-hover:text-blue-300 transition-colors">
                          {n.ime} {n.priimek}
                        </div>
                        <div className={`text-xs capitalize ${LIGA_BARVA[n.liga]?.split(' ')[0]}`}>
                          {LIGA_EMOJI[n.liga]} {n.liga} Liga
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-black ${winRatio(n.zmage, n.porazi) >= 60 ? 'text-green-400' : winRatio(n.zmage, n.porazi) >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {winRatio(n.zmage, n.porazi)}%
                        </div>
                        <div className="text-xs text-blue-400/50">Win ratio</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                      <div className="bg-blue-900/20 rounded-lg py-2">
                        <div className="font-black text-green-400">{n.zmage}</div>
                        <div className="text-blue-400/40 mt-0.5">W</div>
                      </div>
                      <div className="bg-blue-900/20 rounded-lg py-2">
                        <div className="font-black text-red-400">{n.porazi}</div>
                        <div className="text-blue-400/40 mt-0.5">L</div>
                      </div>
                      <div className="bg-blue-900/20 rounded-lg py-2">
                        <div className="font-black text-blue-400">{n.zmage + n.porazi}</div>
                        <div className="text-blue-400/40 mt-0.5">Skupaj</div>
                      </div>
                    </div>

                    {poslanoPovabilo === n.id ? (
                      <div className="w-full bg-green-900/30 border border-green-500/30 text-green-400 py-3 rounded-xl font-bold text-sm text-center">
                        ✅ Povabilo poslano na email!
                      </div>
                    ) : (
                      <button
                        onClick={() => posliPovabilo(n)}
                        disabled={posiljam === n.id}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.2)] disabled:opacity-50">
                        {posiljam === n.id ? '📧 Pošiljam...' : '⚔️ Povabi na tekmo'}
                      </button>
                    )}
                    <Link href={`/chat?z=${n.id}`}
                      className="w-full border border-blue-700/50 text-blue-300 hover:bg-blue-900/20 py-3 rounded-xl font-bold text-sm transition-all text-center mt-2 block">
                      💬 Pošlji sporočilo
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!iscem && (
          <div className="bg-[#051525] border border-blue-800/20 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🎾</div>
            <p className="text-blue-300/50 text-lg font-bold mb-2">Vklopi iskanje tekme</p>
            <p className="text-blue-400/30 text-sm">Sistem bo avtomatsko poiskal nasprotnike v tvoji ligi</p>
          </div>
        )}
      </div>
    </main>
  )
}