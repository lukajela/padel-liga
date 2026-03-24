import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020b18] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)]" />
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />

      {/* Glavna vsebina */}
      <div className="relative z-10 flex-1 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-900/50 border-2 border-blue-400 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
              <span className="text-4xl">🎾</span>
            </div>
          </div>

          <div className="mb-2 text-blue-400 uppercase tracking-[0.3em] text-sm font-bold">Slovenian</div>
          <h1 className="text-7xl md:text-9xl font-black text-white mb-2 tracking-tight"
            style={{textShadow: '0 0 40px rgba(59,130,246,0.8)'}}>
            PADEL
          </h1>
          <div className="text-3xl font-bold text-blue-300 mb-8 tracking-[0.2em] uppercase">League</div>

          <div className="flex gap-2 justify-center mb-12 text-blue-200/60 text-sm uppercase tracking-widest">
            <span>Tekmovanje</span><span>•</span><span>Strast</span><span>•</span><span>Skupnost</span>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/register"
              className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.7)]">
              Registracija
            </Link>
            <Link href="/auth/login"
              className="border-2 border-blue-500 text-blue-300 hover:bg-blue-900/50 px-10 py-4 rounded-lg font-bold text-lg transition-all">
              Prijava
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              ['🏆','5 Lig','Starter → Elite'],
              ['🎾','Igrišča','Po vsej Sloveniji'],
              ['👥','Ekipe','Igraj s partnerjem']
            ].map(([icon,title,sub])=>(
              <div key={title} className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{icon}</div>
                <div className="text-white font-bold text-sm">{title}</div>
                <div className="text-blue-400/70 text-xs mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-blue-800/30 py-6 text-center">
        <div className="flex items-center justify-center gap-6 text-blue-400/30 text-sm">
          <Link href="/pogoji" className="hover:text-blue-400 transition-colors">Pogoji uporabe</Link>
          <span>·</span>
          <Link href="/zasebnost" className="hover:text-blue-400 transition-colors">Zasebnost</Link>
          <span>·</span>
          <span>© 2026 Slovenian Padel League</span>
        </div>
      </footer>
    </main>
  )
}