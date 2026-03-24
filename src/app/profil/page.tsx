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

const LIGA_ZMAGE: Record<string, number> = {
  starter: 5, challenger: 8, competitor: 10, pro: 12, elite: 0
}

const NASLEDNJA_LIGA: Record<string, string> = {
  starter: 'Challenger', challenger: 'Competitor', competitor: 'Pro', pro: 'Elite', elite: 'Vrh!'
}

export default function Profil() {
  const [profil, setProfil] = useState<any>(null)
  const [urejam, setUrejam] = useState(false)
  const [ime, setIme] = useState('')
  const [priimek, setPriimek] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [shranjujem, setShranjujem] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [zavihek, setZavihek] = useState<'profil' | 'ekipa'>('profil')
  const [znacke, setZnacke] = useState<any[]>([])
  const [ekipaNaziv, setEkipaNaziv] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [mojaEkipa, setMojaEkipa] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const nalozi = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/register'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfil(data)
        setIme(data.ime || '')
        setPriimek(data.priimek || '')
        setUsername(data.username || '')
      }
      // Naloži ekipo
      const { data: ekipa } = await supabase
        .from('ekipe')
        .select('*')
        .or(`igralec1_id.eq.${user.id},igralec2_id.eq.${user.id}`)
        .single()
      if (ekipa) setMojaEkipa(ekipa)

      const { data: zn } = await supabase
        .from('znacke')
        .select('*')
        .eq('igralec_id', user.id)
        .order('created_at', { ascending: true })
      setZnacke(zn || [])
      setLoading(false)
    }
    nalozi()
  }, [])

  const shraniProfil = async () => {
    setShranjujem(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').update({ ime, priimek, username }).eq('id', user!.id)
    setProfil({ ...profil, ime, priimek, username })
    setUrejam(false)
    setShranjujem(false)
  }

  const uploadAvatar = async (file: File) => {
    if (!file) return
    setUploadingAvatar(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar.${fileExt}`

    await supabase.storage.from('avatarji').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.jpeg`, `${user.id}/avatar.webp`])

    const { error } = await supabase.storage.from('avatarji').upload(filePath, file, { upsert: true })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatarji').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setProfil({ ...profil, avatar_url: publicUrl })
    }

    setUploadingAvatar(false)
  }

  const ustvariEkipo = async () => {
    if (!ekipaNaziv) return
    setShranjujem(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('ekipe').insert({
      ime: ekipaNaziv,
      igralec1_id: user!.id,
      liga: profil.liga,
    }).select().single()
    if (data) setMojaEkipa(data)
    setShranjujem(false)
  }

  const odjava = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center">
      <div className="text-blue-400 animate-pulse text-xl">Nalagam...</div>
    </main>
  )

  const winRatio = profil.zmage + profil.porazi > 0
    ? Math.round((profil.zmage / (profil.zmage + profil.porazi)) * 100) : 0
  const potrebnoZmag = LIGA_ZMAGE[profil.liga] || 0
  const napredek = potrebnoZmag > 0 ? Math.min((profil.zmage / potrebnoZmag) * 100, 100) : 100

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
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
            ← Dashboard
          </Link>
          <button onClick={odjava} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">
            Odjava
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* Profil header */}
        <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-32 translate-x-32" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl border-2 border-blue-500/40 overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                {profil.avatar_url ? (
                  <img src={profil.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600/30 to-blue-900/50 flex items-center justify-center text-4xl font-black text-blue-300">
                    {profil.ime?.[0]}{profil.priimek?.[0]}
                  </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all cursor-pointer flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {uploadingAvatar ? '⏳' : '📸'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-3xl font-black">{profil.ime} {profil.priimek}</h1>
                <div className={`border px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${LIGA_BARVA[profil.liga]}`}>
                  {LIGA_EMOJI[profil.liga]} {profil.liga}
                </div>
              </div>
              {profil.username && <p className="text-blue-400/50 text-sm mb-3">@{profil.username}</p>}
              <p className="text-blue-300/50 text-sm">{profil.email}</p>
            </div>

            <button onClick={() => setUrejam(!urejam)}
              className="border border-blue-700/50 hover:border-blue-500 text-blue-300 hover:text-blue-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all">
              ✏️ Uredi profil
            </button>
          </div>

          {/* Napredek */}
          <div className="mt-6 pt-6 border-t border-blue-800/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-300/60">Napredek do {NASLEDNJA_LIGA[profil.liga]} Lige</span>
              <span className="text-sm font-bold text-blue-400">{profil.zmage} / {potrebnoZmag} zmag</span>
            </div>
            <div className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                style={{width: `${napredek}%`}} />
            </div>
          </div>
        </div>

        {/* Uredi profil */}
        {urejam && (
          <div className="bg-[#051525] border border-blue-500/30 rounded-2xl p-6 mb-6">
            <h3 className="font-black text-lg mb-4 text-blue-300">✏️ Uredi profil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block">Ime</label>
                <input value={ime} onChange={e => setIme(e.target.value)}
                  className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all"/>
              </div>
              <div>
                <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block">Priimek</label>
                <input value={priimek} onChange={e => setPriimek(e.target.value)}
                  className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all"/>
              </div>
              <div className="md:col-span-2">
                <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="@username"
                  className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all"/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setUrejam(false)}
                className="flex-1 border border-blue-700/50 text-blue-300 py-3 rounded-xl font-bold transition-all hover:bg-blue-900/20">
                Prekliči
              </button>
              <button onClick={shraniProfil} disabled={shranjujem}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50">
                {shranjujem ? 'Shranjujem...' : '✅ Shrani'}
              </button>
            </div>
          </div>
        )}

        {/* Statistike */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Zmage', value: profil.zmage, barva: 'text-green-400', bg: 'bg-green-900/10 border-green-800/30' },
            { label: 'Porazi', value: profil.porazi, barva: 'text-red-400', bg: 'bg-red-900/10 border-red-800/30' },
            { label: 'Win %', value: `${winRatio}%`, barva: 'text-blue-400', bg: 'bg-blue-900/10 border-blue-800/30' },
            { label: 'Skupaj', value: profil.zmage + profil.porazi, barva: 'text-purple-400', bg: 'bg-purple-900/10 border-purple-800/30' },
          ].map(s => (
            <div key={s.label} className={`border rounded-2xl p-5 text-center ${s.bg}`}>
              <div className={`text-3xl font-black ${s.barva}`}>{s.value}</div>
              <div className="text-blue-300/50 text-xs mt-2 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setZavihek('profil')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === 'profil' ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
            👤 Podatki
          </button>
          <button onClick={() => setZavihek('ekipa')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${zavihek === 'ekipa' ? 'bg-blue-600 text-white' : 'border border-blue-800/30 text-blue-400/60 hover:text-blue-300'}`}>
            👥 Ekipa
          </button>
        </div>

        {/* Profil podatki */}
        {zavihek === 'profil' && (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
            <h3 className="font-black text-lg mb-4">👤 Moji podatki</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Ime', value: profil.ime },
                { label: 'Priimek', value: profil.priimek },
                { label: 'Email', value: profil.email },
                { label: 'Username', value: profil.username ? `@${profil.username}` : 'Ni nastavljeno' },
                { label: 'Liga', value: `${LIGA_EMOJI[profil.liga]} ${profil.liga}` },
                { label: 'Lopar', value: profil.lopar_model || (profil.ima_lopar ? 'Imam lopar' : 'Nimam loparja') },
                { label: 'Partner', value: profil.ima_partnerja ? 'Imam partnerja' : 'Iščem partnerja' },
              ].map(p => (
                <div key={p.label} className="bg-blue-900/10 border border-blue-800/20 rounded-xl p-4">
                  <div className="text-blue-400/50 text-xs uppercase tracking-wider mb-1">{p.label}</div>
                  <div className="text-white font-medium capitalize">{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Značke */}
        {zavihek === 'profil' && (
          <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6 mt-4">
            <h3 className="font-black text-lg mb-4">🏅 Moje značke</h3>
            {znacke.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🎯</div>
                <p className="text-blue-400/30 text-sm">Še nimaš značk – začni igrati!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {znacke.map(z => {
                  const ZNACKE_INFO: Record<string, {emoji: string, ime: string, opis: string}> = {
                    prva_tekma: { emoji: '🎾', ime: 'Prva tekma', opis: 'Odigral si svojo prvo tekmo!' },
                    prva_zmaga: { emoji: '🏆', ime: 'Prva zmaga', opis: 'Zmagal si svojo prvo tekmo!' },
                    pet_zmag_zapored: { emoji: '🔥', ime: '5 zmag zapored', opis: 'Zmagal si 5 tekem zapored!' },
                    napredovanje: { emoji: '⚡', ime: 'Napredovanje', opis: 'Napredoval si v višjo ligo!' },
                    elite_liga: { emoji: '👑', ime: 'Elite liga', opis: 'Dosegel si Elite ligo!' },
                    turnirski_zmagovalec: { emoji: '🏅', ime: 'Turnirski zmagovalec', opis: 'Zmagal si turnir!' },
                  }
                  const info = ZNACKE_INFO[z.tip]
                  return (
                    <div key={z.id} className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">{info?.emoji}</div>
                      <div className="font-bold text-sm text-purple-300">{info?.ime}</div>
                      <div className="text-purple-400/50 text-xs mt-1">{info?.opis}</div>
                      <div className="text-purple-400/30 text-xs mt-2">
                        {new Date(z.created_at).toLocaleDateString('sl-SI')}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Ekipa */}
        {zavihek === 'ekipa' && (
          <div>
            {mojaEkipa ? (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-blue-500/40 flex items-center justify-center text-2xl">
                    🛡️
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{mojaEkipa.ime}</h3>
                    <div className={`text-sm capitalize flex items-center gap-1 mt-1 ${LIGA_BARVA[mojaEkipa.liga]?.split(' ')[0]}`}>
                      {LIGA_EMOJI[mojaEkipa.liga]} {mojaEkipa.liga} Liga
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-900/20 border border-green-800/30 rounded-xl p-4">
                    <div className="text-2xl font-black text-green-400">{mojaEkipa.zmage}</div>
                    <div className="text-xs text-blue-300/50 mt-1">Zmage</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4">
                    <div className="text-2xl font-black text-red-400">{mojaEkipa.porazi}</div>
                    <div className="text-xs text-blue-300/50 mt-1">Porazi</div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4">
                    <div className="text-2xl font-black text-blue-400">
                      {mojaEkipa.zmage + mojaEkipa.porazi > 0
                        ? Math.round((mojaEkipa.zmage / (mojaEkipa.zmage + mojaEkipa.porazi)) * 100) : 0}%
                    </div>
                    <div className="text-xs text-blue-300/50 mt-1">Win %</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#051525] border border-blue-800/30 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-xl font-black mb-2">Ustvari ekipo</h3>
                  <p className="text-blue-300/50 text-sm">Poveži se s partnerjem in tekmujte skupaj</p>
                </div>
                <div className="mb-4">
                  <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block">Ime ekipe</label>
                  <input value={ekipaNaziv} onChange={e => setEkipaNaziv(e.target.value)}
                    placeholder="npr. Thunderbolts"
                    className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30 mb-4"/>
                  <label className="text-blue-400/60 text-xs uppercase tracking-wider mb-2 block">Email partnerja (opcijsko)</label>
                  <input value={partnerEmail} onChange={e => setPartnerEmail(e.target.value)}
                    placeholder="partner@email.com"
                    className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30"/>
                </div>
                <button onClick={ustvariEkipo} disabled={!ekipaNaziv || shranjujem}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-4 rounded-xl font-black text-lg transition-all disabled:opacity-30 shadow-[0_4px_20px_rgba(59,130,246,0.3)]">
                  {shranjujem ? 'Ustvarjam...' : '🛡️ Ustvari Ekipo'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}