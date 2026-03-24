import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ZNACKE = {
  prva_tekma: { ime: 'Prva tekma', emoji: '🎾', opis: 'Odigral si svojo prvo tekmo!' },
  prva_zmaga: { ime: 'Prva zmaga', emoji: '🏆', opis: 'Zmagal si svojo prvo tekmo!' },
  pet_zmag_zapored: { ime: '5 zmag zapored', emoji: '🔥', opis: 'Zmagal si 5 tekem zapored!' },
  napredovanje: { ime: 'Napredovanje', emoji: '⚡', opis: 'Napredoval si v višjo ligo!' },
  elite_liga: { ime: 'Elite liga', emoji: '👑', opis: 'Dosegel si Elite ligo!' },
  turnirski_zmagovalec: { ime: 'Turnirski zmagovalec', emoji: '🏅', opis: 'Zmagal si turnir!' },
}

export async function POST(req: Request) {
  const { igralecId, tip } = await req.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { error } = await supabase.from('znacke').insert({
      igralec_id: igralecId,
      tip,
    })

    if (error && error.code !== '23505') {
      // 23505 = unique violation = že ima značko
      console.error(error)
      return NextResponse.json({ error: 'Napaka' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, znacka: ZNACKE[tip as keyof typeof ZNACKE] })
  } catch (error) {
    return NextResponse.json({ error: 'Napaka' }, { status: 500 })
  }
}