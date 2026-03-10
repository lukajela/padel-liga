'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LIGA_BARVE: Record<string, string> = {
  starter: 'text-gray-400 border-gray-600',
  challenger: 'text-blue-400 border-blue-600',
  competitor: 'text-green-400 border-green-600',
  pro: 'text-purple-400 border-purple-600',
  elite: 'text-yellow-400 border-yellow-600',
}

const LIGA_ZMAGE: Record<string, number> = {
  starter: 5, challenger: 8, competitor: 10, pro: 12, elite: 0
}

const NASLEDNJA_LIGA: Record<string, string> = {
  starter: 'Challenger', challenger: 'Competitor', competitor: 'Pro', pro: 'Elite', elite: 'Vrh!'
}

export default function Dashboard() {
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [novaPovabila, setNovaPovabila] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!data) { router.push('/onboarding'); return }
      setProfil(data)

      // Preveri nova povabila
      const { count } = await supabase
        .from('povabila')
        .select('*', { count: 'exact', head: true })
        .eq('povabljenec_id', user.id)
        .eq('status', 'caka')
      setNovaPovabila(count || 0)

      setLoading(false)
    }
    nalozi()
  }, [])

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 text-xl animate-pulse">Nalagam...</div>
    </main>
  )

  const winRatio = profil.zmage + profil.porazi > 0
    ? Math.round((profil.zmage / (profil.zmage + profil.porazi)) * 100) : 0
  const potrebnoZmag = LIGA_ZMAGE[profil.liga] || 0
  const napredek = potrebnoZmag > 0 ? Math.min((profil.zmage / potrebnoZmag) * 100, 100) : 100

  return (
    <main className="min-h-screen bg-[#020b18] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-blue-800/30 bg-[#020b18]/80 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎾</span>
          <span className="font-black text-lg tracking-wider">PADEL <span className="text-blue-400">LIGA</span></span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className={`border px-3 py-1 rounded-full text-xs font-bold uppercase ${LIGA_BARVE[profil.liga]}`}>
            {profil.liga}
          </div>
          <span className="text-blue-300/70">{profil.ime} {profil.priimek}</span>
          <Link href="/profil" className="text-blue-300/60 hover:text-blue-300 transition-colors ml-2">
            👤 Profil
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        
        {/* Welcome + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
            <h1 className="text-2xl font-black mb-1">Pozdravljeni, <span className="text-blue-400">{profil.ime}!</span></h1>
            <p className="text-blue-300/60 text-sm mb-4">Dobrodošli v Slovenian Padel League</p>
            
            {/* Napredek v ligo */}
            <div className="bg-blue-900/20 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-blue-300/70">Napredek do {NASLEDNJA_LIGA[profil.liga]} Lige</span>
                <span className="text-sm font-bold text-blue-400">{profil.zmage} / {potrebnoZmag} zmag</span>
              </div>
              <div className="h-2 bg-blue-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all"
                  style={{width: `${napredek}%`}} />
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/iskanje-tekme"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                🔍 Išči Tekmo
              </Link>
              <Link href="/povabila"
                className="relative inline-flex items-center gap-2 border border-blue-700 hover:border-blue-500 px-6 py-3 rounded-xl font-bold transition-all">
                📬 Povabila
                {novaPovabila > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                    {novaPovabila}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Statistike */}
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
            <h2 className="font-bold text-blue-300/70 text-sm uppercase tracking-wider mb-4">Moje Statistike</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-blue-900/20 rounded-xl p-3">
                <div className="text-2xl font-black text-green-400">{profil.zmage}</div>
                <div className="text-xs text-blue-300/60 mt-1">Zmage</div>
              </div>
              <div className="bg-blue-900/20 rounded-xl p-3">
                <div className="text-2xl font-black text-red-400">{profil.porazi}</div>
                <div className="text-xs text-blue-300/60 mt-1">Porazi</div>
              </div>
              <div className="bg-blue-900/20 rounded-xl p-3">
                <div className="text-2xl font-black text-blue-400">{winRatio}%</div>
                <div className="text-xs text-blue-300/60 mt-1">Win %</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigacija */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            {href:'/iskanje-tekme', icon:'🔍', title:'Išči Tekmo', opis:'Najdi nasprotnika'},
            {href:'/povabila', icon:'📬', title:'Povabila', opis:'Sprejmi izzive'},
            {href:'/lestvica', icon:'🏆', title:'Lestvica', opis:'Poglej rang listo'},
            {href:'/tekma', icon:'⚔️', title:'Začni Tekmo', opis:'Vnesi rezultat'},
            {href:'/igrisca', icon:'📍', title:'Igrišča', opis:'Padel centri v SLO'},
          ].map(({href, icon, title, opis}) => (
            <Link key={href} href={href}
              className="relative bg-[#051525] border border-blue-800/30 hover:border-blue-600/50 rounded-2xl p-6 text-center transition-all hover:bg-blue-900/20 group">
              <div className="text-3xl mb-3">{icon}</div>
              <div className="font-bold text-white group-hover:text-blue-300 transition-colors">{title}</div>
              <div className="text-blue-400/60 text-xs mt-1">{opis}</div>
              {href === '/povabila' && novaPovabila > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {novaPovabila}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Lige */}
        <div className="mt-6 bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
          <h2 className="font-bold text-blue-300/70 text-sm uppercase tracking-wider mb-4">Lige & Napredovanje</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {['starter','challenger','competitor','pro','elite'].map(l => (
              <div key={l} className={`flex-shrink-0 border-2 rounded-xl p-4 text-center min-w-[120px] transition-all ${profil.liga === l ? LIGA_BARVE[l] + ' bg-blue-900/20' : 'border-blue-800/30 text-blue-300/40'}`}>
                <div className="text-lg mb-1">
                  {l==='starter'?'🌱':l==='challenger'?'⚡':l==='competitor'?'🔥':l==='pro'?'💎':'👑'}
                </div>
                <div className="font-bold text-xs uppercase">{l}</div>
                {profil.liga === l && <div className="text-xs mt-1 opacity-70">Aktivna</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}