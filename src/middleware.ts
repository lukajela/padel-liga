import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Zaščitene strani – zahtevajo prijavo
  const zasciteneStrani = [
    '/dashboard',
    '/profil',
    '/tekma',
    '/lestvica',
    '/iskanje-tekme',
    '/igrisca',
    '/povabila',
    '/turnirji',
    '/chat',
    '/zgodovina',
    '/admin',
  ]

  const jeZascitena = zasciteneStrani.some(stran =>
    request.nextUrl.pathname.startsWith(stran)
  )

  // Javne strani – prijavljeni ne rabijo videti
  const javneStrani = [
    '/auth/login',
    '/auth/register',
    '/auth/reset-geslo',
  ]

  const jeJavna = javneStrani.some(stran =>
    request.nextUrl.pathname.startsWith(stran)
  )

  // Neprijavljen poskuša dostopati do zaščitene strani
  if (!user && jeZascitena) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Prijavljen poskuša dostopati do login/register
  if (user && jeJavna) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin zaščita
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: profil } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profil?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}