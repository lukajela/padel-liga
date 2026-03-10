'use client'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

function VerifyForm() {
  const [koda, setKoda] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') || ''
  const supabase = createClient()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email, token: koda, type: 'email'
    })
    if (error) { setError('Napačna koda. Poskusi znova.'); setLoading(false) }
    else router.push('/onboarding')
  }

  return (
    <main className="min-h-screen bg-[#020b18] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a2a4a_0%,_#020b18_70%)]" />
      <div className="absolute inset-0 opacity-10"
        style={{backgroundImage: 'linear-gradient(#1a4a7a 1px, transparent 1px), linear-gradient(90deg, #1a4a7a 1px, transparent 1px)', backgroundSize: '50px 50px'}} />
      <div className="relative z-10 bg-[#051525] border border-blue-800/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-2xl font-black text-white mb-2">Vnesi kodo</h2>
          <p className="text-blue-300/70 text-sm">Koda je bila poslana na<br/><strong className="text-blue-300">{email}</strong></p>
        </div>
        <form onSubmit={handleVerify}>
          <input type="text" placeholder="0 0 0 0 0 0" value={koda}
            onChange={e => setKoda(e.target.value)} maxLength={6} required
            className="w-full bg-blue-950/50 border-2 border-blue-700/50 focus:border-blue-400 rounded-xl p-4 text-center text-3xl tracking-[0.5em] text-white outline-none mb-4 transition-all"/>
          {error && <p className="text-red-400 mb-4 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50">
            {loading ? 'Preverjam...' : 'Potrdi kodo →'}
          </button>
        </form>
      </div>
    </main>
  )
}

export default function Verify() {
  return <Suspense><VerifyForm /></Suspense>
}