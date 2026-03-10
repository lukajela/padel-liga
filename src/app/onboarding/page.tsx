'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const LOPARI = [
  'Babolat Viper', 'Head Delta', 'Adidas Adipower', 'Wilson Bela', 'Bullpadel Hack', 'Nimam loparja'
]

export default function Onboarding() {
  const [korak, setKorak] = useState(1)
  const [ime, setIme] = useState('')
  const [priimek, setPriimek] = useState('')
  const [nivo, setNivo] = useState('')
  const [imaLopar, setImaLopar] = useState<boolean | null>(null)
  const [lopar, setLopar] = useState('')
  const [imaPartnerja, setImaPartnerja] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const shrani = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/register'); return }

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      ime, priimek,
      nivo,
      ima_lopar: imaLopar,
      lopar_model: lopar,
      ima_partnerja: imaPartnerja,
      liga: 'challenger'
    })
    router.push('/dashboard')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)]" />
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      <div className="relative z-10 max-w-lg w-full mx-4">
        {/* Progress */}
        <div className="flex gap-2 mb-8 justify-center">
          {[1,2,3,4].map(k => (
            <div key={k} className={`h-1 w-16 rounded-full transition-all ${k <= korak ? 'bg-blue-500' : 'bg-blue-900/50'}`} />
          ))}
        </div>

        <div className="bg-[#051525] border border-blue-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)]">

          {/* Korak 1 - Ime */}
          {korak === 1 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">👤</div>
                <h2 className="text-2xl font-black text-white mb-1">Kako ti je ime?</h2>
                <p className="text-blue-300/70 text-sm">Tvoje ime bo vidno ostalim igralcem</p>
              </div>
              <input placeholder="Ime" value={ime} onChange={e => setIme(e.target.value)}
                className="w-full bg-blue-950/50 border-2 border-blue-700/50 focus:border-blue-400 rounded-xl p-4 text-white outline-none mb-4 transition-all placeholder:text-blue-400/40"/>
              <input placeholder="Priimek" value={priimek} onChange={e => setPriimek(e.target.value)}
                className="w-full bg-blue-950/50 border-2 border-blue-700/50 focus:border-blue-400 rounded-xl p-4 text-white outline-none mb-6 transition-all placeholder:text-blue-400/40"/>
              <button onClick={() => ime && priimek && setKorak(2)} disabled={!ime || !priimek}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-30">
                Naprej →
              </button>
            </div>
          )}

          {/* Korak 2 - Nivo */}
          {korak === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🏆</div>
                <h2 className="text-2xl font-black text-white mb-1">Na katerem nivoju igraš?</h2>
                <p className="text-blue-300/70 text-sm">Izberi svojo trenutno raven igre</p>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {[
                  {id:'starter', label:'Starter', opis:'Popoln začetnik', emoji:'🌱'},
                  {id:'challenger', label:'Challenger', opis:'Začetnik / rekreativec', emoji:'⚡'},
                  {id:'competitor', label:'Competitor', opis:'Srednji nivo', emoji:'🔥'},
                  {id:'pro', label:'Pro', opis:'Zelo dober igralec', emoji:'💎'},
                  {id:'elite', label:'Elite', opis:'Najboljši igralci', emoji:'👑'},
                ].map(n => (
                  <button key={n.id} onClick={() => setNivo(n.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${nivo === n.id ? 'border-blue-400 bg-blue-600/20' : 'border-blue-800/50 hover:border-blue-600/50'}`}>
                    <span className="text-2xl">{n.emoji}</span>
                    <div>
                      <div className="text-white font-bold">{n.label}</div>
                      <div className="text-blue-400/70 text-sm">{n.opis}</div>
                    </div>
                    {nivo === n.id && <span className="ml-auto text-blue-400">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setKorak(1)} className="flex-1 border-2 border-blue-700 text-blue-300 py-4 rounded-xl font-bold transition-all hover:bg-blue-900/30">← Nazaj</button>
                <button onClick={() => nivo && setKorak(3)} disabled={!nivo}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-30">Naprej →</button>
              </div>
            </div>
          )}

          {/* Korak 3 - Lopar */}
          {korak === 3 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🎾</div>
                <h2 className="text-2xl font-black text-white mb-1">Imaš svoj lopar?</h2>
                <p className="text-blue-300/70 text-sm">Poved nam o tvojem opremi</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button onClick={() => setImaLopar(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${imaLopar === true ? 'border-blue-400 bg-blue-600/20' : 'border-blue-800/50 hover:border-blue-600/50'}`}>
                  <div className="text-2xl mb-2">✅</div>
                  <div className="text-white font-bold">Imam lopar</div>
                </button>
                <button onClick={() => { setImaLopar(false); setLopar('') }}
                  className={`p-4 rounded-xl border-2 transition-all ${imaLopar === false ? 'border-blue-400 bg-blue-600/20' : 'border-blue-800/50 hover:border-blue-600/50'}`}>
                  <div className="text-2xl mb-2">❌</div>
                  <div className="text-white font-bold">Nimam loparja</div>
                </button>
              </div>
              {imaLopar && (
                <div className="mb-6">
                  <p className="text-blue-300/70 text-sm mb-3">Kateri model?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LOPARI.filter(l => l !== 'Nimam loparja').map(l => (
                      <button key={l} onClick={() => setLopar(l)}
                        className={`p-3 rounded-lg border text-sm transition-all ${lopar === l ? 'border-blue-400 bg-blue-600/20 text-white' : 'border-blue-800/50 text-blue-300/70 hover:border-blue-600/50'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setKorak(2)} className="flex-1 border-2 border-blue-700 text-blue-300 py-4 rounded-xl font-bold transition-all hover:bg-blue-900/30">← Nazaj</button>
                <button onClick={() => imaLopar !== null && setKorak(4)} disabled={imaLopar === null}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-30">Naprej →</button>
              </div>
            </div>
          )}

          {/* Korak 4 - Partner */}
          {korak === 4 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-2xl font-black text-white mb-1">Imaš partnerja?</h2>
                <p className="text-blue-300/70 text-sm">Padel se igra v parih – imaš že soigralca?</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button onClick={() => setImaPartnerja(true)}
                  className={`p-6 rounded-xl border-2 transition-all ${imaPartnerja === true ? 'border-blue-400 bg-blue-600/20' : 'border-blue-800/50 hover:border-blue-600/50'}`}>
                  <div className="text-3xl mb-2">👫</div>
                  <div className="text-white font-bold">Imam partnerja</div>
                </button>
                <button onClick={() => setImaPartnerja(false)}
                  className={`p-6 rounded-xl border-2 transition-all ${imaPartnerja === false ? 'border-blue-400 bg-blue-600/20' : 'border-blue-800/50 hover:border-blue-600/50'}`}>
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="text-white font-bold">Iščem partnerja</div>
                </button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setKorak(3)} className="flex-1 border-2 border-blue-700 text-blue-300 py-4 rounded-xl font-bold transition-all hover:bg-blue-900/30">← Nazaj</button>
                <button onClick={shrani} disabled={imaPartnerja === null || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all disabled:opacity-30">
                  {loading ? 'Shranjujem...' : 'Začni igrati! 🎾'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}