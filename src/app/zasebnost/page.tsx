import Link from 'next/link'

export default function Zasebnost() {
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
        <h1 className="text-4xl font-black mb-2">🔒 Politika <span className="text-blue-400">zasebnosti</span></h1>
        <p className="text-blue-300/50 mb-12">Zadnja posodobitev: {new Date().toLocaleDateString('sl-SI')}</p>

        <div className="space-y-8">
          {[
            {
              naslov: '1. Katere podatke zbiramo',
              vsebina: 'Zbiramo naslednje podatke: email naslov, ime in priimek, username, profilno sliko, statistike tekem (zmage, porazi), in liga nivo. Vsi podatki so potrebni za delovanje aplikacije.'
            },
            {
              naslov: '2. Kako uporabljamo podatke',
              vsebina: 'Vaše podatke uporabljamo izključno za: delovanje aplikacije, prikaz na lestvici, pošiljanje obvestil o tekmo in povabilih, in organizacijo turnirjev. Vaših podatkov ne prodajamo tretjim osebam.'
            },
            {
              naslov: '3. Email obvestila',
              vsebina: 'Pošiljamo email obvestila za: prijavo v aplikacijo, povabila na tekme, potrditev rezultatov, in turnirska obvestila. Od obvestil se lahko odjavite z kontaktiranjem administratorja.'
            },
            {
              naslov: '4. Shranjevanje podatkov',
              vsebina: 'Vaši podatki so shranjeni na Supabase strežnikih (EU regija). Profilne slike so shranjene na Supabase Storage. Vsi podatki so zaščiteni z SSL enkripcijo.'
            },
            {
              naslov: '5. Vaše pravice (GDPR)',
              vsebina: 'Imate pravico do: vpogleda v vaše podatke, popravka napačnih podatkov, izbrisa vašega računa in vseh podatkov, in prenosa vaših podatkov. Za uveljavljanje pravic kontaktirajte: jelicluka13@gmail.com'
            },
            {
              naslov: '6. Piškotki',
              vsebina: 'Aplikacija uporablja samo nujne piškotke za avtentikacijo (Supabase session). Ne uporabljamo sledilnih ali oglaševalskih piškotkov.'
            },
            {
              naslov: '7. Izbris računa',
              vsebina: 'Kadar koli lahko zahtevate izbris svojega računa in vseh povezanih podatkov. Za izbris pišite na: jelicluka13@gmail.com. Vaši podatki bodo izbrisani v 30 dneh.'
            },
            {
              naslov: '8. Kontakt',
              vsebina: 'Za vsa vprašanja glede zasebnosti nas kontaktirajte na: jelicluka13@gmail.com'
            },
          ].map(s => (
            <div key={s.naslov} className="bg-[#051525] border border-blue-800/30 rounded-2xl p-6">
              <h2 className="font-black text-lg text-blue-400 mb-3">{s.naslov}</h2>
              <p className="text-blue-300/70 leading-relaxed">{s.vsebina}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/pogoji" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            ← Pogoji uporabe
          </Link>
        </div>
      </div>
    </main>
  )
}