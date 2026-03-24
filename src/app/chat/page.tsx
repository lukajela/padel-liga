'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Avatar from '@/components/Avatar'
import { Suspense } from 'react'

function ChatVsebina() {
  const [profil, setProfil] = useState<any>(null)
  const [pogovori, setPogovori] = useState<any[]>([])
  const [aktivniPogovor, setAktivniPogovor] = useState<any>(null)
  const [sporocila, setSporocila] = useState<any[]>([])
  const [novaSporocilo, setNovaSporocilo] = useState('')
  const [loading, setLoading] = useState(true)
  const [posiljam, setPosiljam] = useState(false)
  const [neprebranih, setNeprebranih] = useState(0)
  const sporocilaRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    nalozi()
  }, [])

  useEffect(() => {
    if (sporocilaRef.current) {
      sporocilaRef.current.scrollTop = sporocilaRef.current.scrollHeight
    }
  }, [sporocila])

  useEffect(() => {
    if (!profil) return

    // Real-time subscription
    const channel = supabase
      .channel('sporocila')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'sporocila',
        filter: `prejemnik_id=eq.${profil.id}`
      }, (payload) => {
        if (aktivniPogovor && payload.new.posiljatelj_id === aktivniPogovor.id) {
          setSporocila(prev => [...prev, { ...payload.new, posiljatelj: aktivniPogovor }])
          oznаciPrebrano(payload.new.id)
        } else {
          setNeprebranih(prev => prev + 1)
          naloziPogovore(profil.id)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [profil, aktivniPogovor])

  const nalozi = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (p) {
      setProfil(p)
      await naloziPogovore(user.id)

      // Preveri ali je direktni link na pogovor
      const userId = searchParams.get('z')
      if (userId) {
        const { data: drug } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (drug) odpriPogovor(drug, user.id)
      }
    }
    setLoading(false)
  }

  const naloziPogovore = async (userId: string) => {
    // Naloži vse edinstvene sogovornike
    const { data: poslana } = await supabase
      .from('sporocila')
      .select('prejemnik_id')
      .eq('posiljatelj_id', userId)

    const { data: prejeta } = await supabase
      .from('sporocila')
      .select('posiljatelj_id, prebrano')
      .eq('prejemnik_id', userId)

    const idji = new Set([
      ...(poslana?.map(s => s.prejemnik_id) || []),
      ...(prejeta?.map(s => s.posiljatelj_id) || [])
    ])

    const pogovoriData = await Promise.all(
      Array.from(idji).map(async (id) => {
        const { data: drug } = await supabase.from('profiles').select('*').eq('id', id).single()
        const { data: zadnje } = await supabase
          .from('sporocila')
          .select('*')
          .or(`and(posiljatelj_id.eq.${userId},prejemnik_id.eq.${id}),and(posiljatelj_id.eq.${id},prejemnik_id.eq.${userId})`)
          .order('created_at', { ascending: false })
          .limit(1)
        const { count } = await supabase
          .from('sporocila')
          .select('*', { count: 'exact', head: true })
          .eq('posiljatelj_id', id)
          .eq('prejemnik_id', userId)
          .eq('prebrano', false)
        return { ...drug, zadnjeSporocilo: zadnje?.[0], neprebrana: count || 0 }
      })
    )

    const skupajNeprebrana = pogovoriData.reduce((a, p) => a + p.neprebrana, 0)
    setNeprebranih(skupajNeprebrana)
    setPogovori(pogovoriData.sort((a, b) =>
      new Date(b.zadnjeSporocilo?.created_at || 0).getTime() -
      new Date(a.zadnjeSporocilo?.created_at || 0).getTime()
    ))
  }

  const odpriPogovor = async (drug: any, userId?: string) => {
    setAktivniPogovor(drug)
    const id = userId || profil.id

    const { data } = await supabase
      .from('sporocila')
      .select('*, posiljatelj:posiljatelj_id(*)')
      .or(`and(posiljatelj_id.eq.${id},prejemnik_id.eq.${drug.id}),and(posiljatelj_id.eq.${drug.id},prejemnik_id.eq.${id})`)
      .order('created_at', { ascending: true })
    setSporocila(data || [])

    // Označi kot prebrano
    await supabase.from('sporocila')
      .update({ prebrano: true })
      .eq('posiljatelj_id', drug.id)
      .eq('prejemnik_id', id)
      .eq('prebrano', false)

    naloziPogovore(id)
  }

  const oznаciPrebrano = async (sporociloId: string) => {
    await supabase.from('sporocila').update({ prebrano: true }).eq('id', sporociloId)
  }

  const posljiSporocilo = async () => {
    if (!novaSporocilo.trim() || !aktivniPogovor || posiljam) return
    setPosiljam(true)

    const { data } = await supabase.from('sporocila').insert({
      posiljatelj_id: profil.id,
      prejemnik_id: aktivniPogovor.id,
      vsebina: novaSporocilo.trim()
    }).select('*, posiljatelj:posiljatelj_id(*)').single()

    if (data) setSporocila(prev => [...prev, data])
    setNovaSporocilo('')
    setPosiljam(false)
  }

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-[#020b18] text-white flex flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)] pointer-events-none" />

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

      <div className="relative z-10 flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-4" style={{height: 'calc(100vh - 73px)'}}>

        {/* Leva stran – pogovori */}
        <div className={`${aktivniPogovor ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-blue-800/30">
            <h2 className="font-black text-lg flex items-center gap-2">
              💬 Sporočila
              {neprebranih > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-black">
                  {neprebranih}
                </span>
              )}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {pogovori.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-blue-300/50 text-sm font-bold">Ni pogovorov</p>
                <p className="text-blue-400/30 text-xs mt-1">Povabi nasprotnika in začni klepetati</p>
              </div>
            ) : pogovori.map(p => (
              <button key={p.id} onClick={() => odpriPogovor(p)}
                className={`w-full flex items-center gap-3 p-4 border-b border-blue-800/10 hover:bg-blue-900/20 transition-all text-left ${aktivniPogovor?.id === p.id ? 'bg-blue-900/30' : ''}`}>
                <div className="relative">
                  <Avatar profil={p} velikost="md" />
                  {p.neprebrana > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-black">
                      {p.neprebrana}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{p.ime} {p.priimek}</div>
                  {p.zadnjeSporocilo && (
                    <div className="text-blue-400/40 text-xs truncate">
                      {p.zadnjeSporocilo.posiljatelj_id === profil.id ? 'Ti: ' : ''}{p.zadnjeSporocilo.vsebina}
                    </div>
                  )}
                </div>
                {p.zadnjeSporocilo && (
                  <div className="text-blue-400/30 text-xs flex-shrink-0">
                    {new Date(p.zadnjeSporocilo.created_at).toLocaleTimeString('sl-SI', {hour: '2-digit', minute: '2-digit'})}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desna stran – chat */}
        {aktivniPogovor ? (
          <div className="flex flex-col flex-1 bg-[#051525] border border-blue-800/30 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-blue-800/30">
              <button onClick={() => setAktivniPogovor(null)} className="md:hidden text-blue-400 mr-1">←</button>
              <Avatar profil={aktivniPogovor} velikost="md" />
              <div>
                <div className="font-black">{aktivniPogovor.ime} {aktivniPogovor.priimek}</div>
                <div className="text-blue-400/40 text-xs capitalize">{aktivniPogovor.liga} Liga</div>
              </div>
              <Link href={`/povabila`} className="ml-auto text-blue-400/60 hover:text-blue-300 text-xs transition-colors">
                ⚔️ Izzivi →
              </Link>
            </div>

            {/* Sporočila */}
            <div ref={sporocilaRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {sporocila.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">👋</div>
                  <p className="text-blue-300/50">Začni pogovor z {aktivniPogovor.ime}!</p>
                </div>
              ) : sporocila.map(s => {
                const jeMoje = s.posiljatelj_id === profil.id
                return (
                  <div key={s.id} className={`flex ${jeMoje ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${jeMoje
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-blue-900/40 border border-blue-800/30 text-white rounded-bl-sm'}`}>
                      <p className="text-sm">{s.vsebina}</p>
                      <p className={`text-xs mt-1 ${jeMoje ? 'text-blue-200/60' : 'text-blue-400/40'}`}>
                        {new Date(s.created_at).toLocaleTimeString('sl-SI', {hour: '2-digit', minute: '2-digit'})}
                        {jeMoje && <span className="ml-1">{s.prebrano ? '✓✓' : '✓'}</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-blue-800/30 flex gap-3">
              <input
                value={novaSporocilo}
                onChange={e => setNovaSporocilo(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && posljiSporocilo()}
                placeholder={`Sporoči ${aktivniPogovor.ime}...`}
                className="flex-1 bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"
              />
              <button onClick={posljiSporocilo} disabled={!novaSporocilo.trim() || posiljam}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-30">
                {posiljam ? '...' : '➤'}
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 bg-[#051525] border border-blue-800/30 rounded-2xl items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-blue-300/50 text-lg font-bold">Izberi pogovor</p>
              <p className="text-blue-400/30 text-sm mt-2">ali povabi nasprotnika na tekmo</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function Chat() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020b18] flex items-center justify-center"><div className="text-blue-400 animate-pulse">Nalagam...</div></div>}>
      <ChatVsebina />
    </Suspense>
  )
}