'use client'
import { useState } from 'react'
import Link from 'next/link'

const IGRISCA = [
  {
    id: 1,
    ime: 'Ludus Beach Park',
    mesto: 'Ljubljana',
    naslov: 'Šlandrova ul. 11, Ljubljana - Črnuče',
    cena: null,
    cena_opis: 'Paketi od €60',
    najem_loparja: null,
    ocena: 4.8,
    opis: 'Prva padel igrišča v Sloveniji! 4 premium igrišča v največjem beach parku v LJ.',
    rezervacija: 'https://ludusd.sportifiq.com/guests/location',
    igrisca: 4,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/ludus.jpg',
  },
  {
    id: 2,
    ime: 'Šport park Krsnik',
    mesto: 'Pesnica pri Mariboru',
    naslov: 'Dolnja Počehova 34b, Pesnica pri Mariboru',
    cena: null,
    cena_opis: 'Cena po poizvedbi',
    najem_loparja: null,
    ocena: 4.6,
    opis: 'Športni park v naravi, le 5 km iz Maribora. 2 padel igrišči s tenisom in squashem.',
    rezervacija: 'https://courtiplay.com/krsnik?sport=Padel',
    igrisca: 2,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/krsnik.jpg',
  },
  {
    id: 3,
    ime: 'Pin Padel',
    mesto: 'Maribor',
    naslov: 'Preradovičeva ulica 20D, Maribor',
    cena: null,
    cena_opis: 'Cena po poizvedbi',
    najem_loparja: true,
    ocena: 4.7,
    opis: 'Moderno pokrito igrišče v Studencih, Maribor. LED osvetlitev za večerno igro.',
    rezervacija: 'https://courtiplay.com/pinpadel',
    igrisca: 1,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/pinpadel.webp',
  },
  {
    id: 4,
    ime: 'Padel Tivoli',
    mesto: 'Ljubljana',
    naslov: 'Celovška cesta 25, Ljubljana',
    cena: 10,
    cena_opis: '€10 / uro (zimska cena)',
    najem_loparja: true,
    ocena: 4.9,
    opis: '3 premium igrišča na platoju pod Halo Tivoli. Odlična lokacija, parking, garderoba.',
    rezervacija: 'https://padel-tivoli.sportifiq.com/guests/location',
    igrisca: 3,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/tivoli.jpeg',
  },
  {
    id: 5,
    ime: 'Vogu Center',
    mesto: 'Spodnja Besnica (Kranj)',
    naslov: 'Vogel 10, Spodnja Besnica',
    cena: 20,
    cena_opis: '€20 / uro',
    najem_loparja: true,
    ocena: 4.5,
    opis: 'Športni center 4 km od Kranja. 2 padel igrišči. Najem loparja €3. Odprt vsak dan 8–24.',
    rezervacija: 'https://vogu.si/rezervacija.html',
    igrisca: 2,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/vogu.jpg',
  },
  {
    id: 6,
    ime: 'Harmonija Padel',
    mesto: 'Mengeš',
    naslov: 'Linhartova cesta 33, Mengeš',
    cena: null,
    cena_opis: 'Cena po poizvedbi',
    najem_loparja: null,
    ocena: 4.7,
    opis: '6 vrhunskih igrišč pri Hotel Harmonija. Wellness, savna in restavracija v sklopu.',
    rezervacija: 'https://courtiplay.com/harmonijamenges?sport=Padel',
    igrisca: 6,
    parkiranje: true,
    garderoba: true,
    slika: '/igrisca/harmonija.webp',
  },
]

function Zvezde({ ocena }: { ocena: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= Math.round(ocena) ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>
      ))}
    </div>
  )
}

export default function Igrisca() {
  const [iskanje, setIskanje] = useState('')
  const [izbranoMesto, setIzbranoMesto] = useState('Vsa mesta')
  const [sortiranje, setSortiranje] = useState('ocena')

  const mesta = ['Vsa mesta', ...Array.from(new Set(IGRISCA.map(i => i.mesto)))]

  const filtrirano = IGRISCA
    .filter(i => {
      const ujemaMesto = izbranoMesto === 'Vsa mesta' || i.mesto === izbranoMesto
      const ujemaIskanje = i.ime.toLowerCase().includes(iskanje.toLowerCase()) ||
        i.mesto.toLowerCase().includes(iskanje.toLowerCase())
      return ujemaMesto && ujemaIskanje
    })
    .sort((a, b) => sortiranje === 'ocena' ? b.ocena - a.ocena : (a.cena ?? 999) - (b.cena ?? 999))

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

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        {/* Hero header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-blue-400/60 text-sm uppercase tracking-widest mb-2 font-medium">Slovenija</div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">
              📍 Padel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Igrišča</span>
            </h1>
            <p className="text-blue-300/50 text-lg">Vsa padel igrišča v Sloveniji · Rezerviraj z enim klikom</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl px-5 py-3">
              <div className="text-2xl font-black text-blue-400">{IGRISCA.length}</div>
              <div className="text-xs text-blue-300/50">Centrov</div>
            </div>
            <div className="bg-[#051525] border border-blue-800/30 rounded-2xl px-5 py-3">
              <div className="text-2xl font-black text-green-400">{IGRISCA.reduce((a,b) => a + b.igrisca, 0)}</div>
              <div className="text-xs text-blue-300/50">Igrišč</div>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <div className="bg-[#051525]/80 border border-blue-800/30 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/40 text-sm">🔍</span>
            <input
              placeholder="Išči po imenu ali mestu..."
              value={iskanje}
              onChange={e => setIskanje(e.target.value)}
              className="w-full bg-blue-950/40 border border-blue-700/30 focus:border-blue-400 rounded-xl pl-10 pr-4 py-3 text-white outline-none transition-all placeholder:text-blue-400/30 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {mesta.map(m => (
              <button key={m} onClick={() => setIzbranoMesto(m)}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${izbranoMesto === m ? 'border-blue-400 bg-blue-600/20 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-blue-800/40 text-blue-400/50 hover:border-blue-600/50 hover:text-blue-300/70'}`}>
                {m}
              </button>
            ))}
          </div>
          <select value={sortiranje} onChange={e => setSortiranje(e.target.value)}
            className="bg-blue-950/40 border border-blue-700/30 rounded-xl px-4 py-3 text-blue-300 text-sm outline-none cursor-pointer">
            <option value="ocena">Sortiraj: Ocena</option>
            <option value="cena">Sortiraj: Cena</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtrirano.map((igr, idx) => (
            <div key={igr.id}
              className="bg-[#051525] border border-blue-800/20 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 group">

              {/* Slika */}
              <div className="h-48 relative overflow-hidden">
                <img
                  src={igr.slika}
                  alt={igr.ime}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/80 via-transparent to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="bg-[#020b18]/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    {igr.mesto}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-[#020b18]/80 backdrop-blur-sm text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/20">
                    ★ {igr.ocena}
                  </span>
                </div>
                {idx === 0 && (
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full">
                      🏆 Najboljše ocenjen
                    </span>
                  </div>
                )}
                <div className="absolute bottom-3 right-3">
                  <span className="bg-[#020b18]/80 backdrop-blur-sm text-blue-300 text-xs px-2 py-1 rounded-full">
                    🎾 {igr.igrisca} igrišča
                  </span>
                </div>
              </div>

              {/* Vsebina */}
              <div className="p-5">
                <h3 className="font-black text-lg mb-1 group-hover:text-blue-300 transition-colors leading-tight">{igr.ime}</h3>

                <div className="flex items-center gap-2 mb-2">
                  <Zvezde ocena={igr.ocena} />
                  <span className="text-blue-400/50 text-xs">{igr.ocena}/5.0</span>
                </div>

                <p className="text-blue-400/50 text-xs mb-2 flex items-center gap-1">
                  📌 {igr.naslov}
                </p>
                <p className="text-blue-300/60 text-sm mb-4 leading-relaxed">{igr.opis}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {igr.parkiranje && (
                    <span className="bg-blue-900/20 border border-blue-800/30 text-blue-300/70 px-2 py-1 rounded-lg text-xs">🚗 Parking</span>
                  )}
                  {igr.garderoba && (
                    <span className="bg-purple-900/20 border border-purple-800/30 text-purple-300/70 px-2 py-1 rounded-lg text-xs">🚿 Garderoba</span>
                  )}
                  {igr.najem_loparja && (
                    <span className="bg-green-900/20 border border-green-800/30 text-green-300/70 px-2 py-1 rounded-lg text-xs">🎾 Najem loparja</span>
                  )}
                </div>

                {/* Cena + Gumb */}
                <div className="flex items-center justify-between pt-4 border-t border-blue-800/20">
                  <div>
                    {igr.cena ? (
                      <>
                        <span className="text-2xl font-black text-white">€{igr.cena}</span>
                        <span className="text-blue-400/50 text-xs"> / uro</span>
                      </>
                    ) : (
                      <span className="text-sm text-blue-300/60">{igr.cena_opis}</span>
                    )}
                  </div>
                  <a href={igr.rezervacija} target="_blank" rel="noopener noreferrer"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.5)]">
                    Rezerviraj →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtrirano.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-blue-400/40 text-lg">Ni najdenih igrišč</p>
            <button onClick={() => { setIskanje(''); setIzbranoMesto('Vsa mesta') }}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm underline">
              Ponastavi filtre
            </button>
          </div>
        )}
      </div>
    </main>
  )
}