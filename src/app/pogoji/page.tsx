import Link from 'next/link'

export default function Pogoji() {
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
        <Link href="/" className="text-blue-400/70 hover:text-blue-300 text-sm transition-colors">
          ← Domov
        </Link>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-2">📝 Pogoji <span className="text-blue-400">uporabe</span></h1>
        <p className="text-blue-300/50 mb-12">Zadnja posodobitev: {new Date().toLocaleDateString('sl-SI')}</p>

        <div className="space-y-8">
          {[
            {
              naslov: '1. Splošno',
              vsebina: 'Slovenian Padel League (v nadaljevanju "aplikacija") je platforma za organizacijo padel tekem in turnirjev v Sloveniji. Z uporabo aplikacije se strinjate s temi pogoji uporabe.'
            },
            {
              naslov: '2. Registracija',
              vsebina: 'Za uporabo aplikacije je potrebna registracija z veljavnim email naslovom. Odgovorni ste za varnost svojega gesla in vseh aktivnosti na vašem računu. Lažni podatki so prepovedani.'
            },
            {
              naslov: '3. Pravila tekmovanja',
              vsebina: 'Rezultate tekem morajo potrditi vsi udeleženci. Lažno vnašanje rezultatov je prepovedano in lahko vodi do izbrisa računa. Admin si pridržuje pravico do popravka rezultatov.'
            },
            {
              naslov: '4. Obnašanje',
              vsebina: 'Pričakujemo spoštljivo obnašanje do vseh uporabnikov. Žaljivo sporočanje, nadlegovanje ali kakršnakoli oblika diskriminacije je strogo prepovedana in vodi do takojšnjega izbrisa računa.'
            },
            {
              naslov: '5. Vsebina',
              vsebina: 'Profilne slike morajo biti primerne. Prepovedane so slike ki vsebujejo nasilje, sovražni govor ali neprimerno vsebino. Admin si pridržuje pravico do odstranitve neprimerne vsebine.'
            },
            {
              naslov: '6. Omejitev odgovornosti',
              vsebina: 'Aplikacija ne prevzema odgovornosti za poškodbe nastale med igranjem padla. Rezervacija igrišč je odgovornost posameznih uporabnikov. Aplikacija služi samo kot organizacijska platforma.'
            },
            {
              naslov: '7. Spremembe pogojev',
              vsebina: 'Pridržujemo si pravico do spremembe teh pogojev kadar koli. Uporabniki bodo obveščeni o pomembnih spremembah po emailu.'
            },
            {
              naslov: '8. Kontakt',
              vsebina: 'Za vprašanja glede pogojev uporabe nas kontaktirajte na: jelicluka13@gmail.com'
            },
          ].map(s => (
            <div key={s.naslov} className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
              <h2 className="font-black text-lg text-blue-400 mb-3">{s.naslov}</h2>
              <p className="text-blue-300/70 leading-relaxed">{s.vsebina}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/zasebnost" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            Politika zasebnosti →
          </Link>
        </div>
      </div>
    </main>
  )
}