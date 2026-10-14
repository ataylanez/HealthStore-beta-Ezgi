import { NextRequest, NextResponse } from 'next/server'
import { GATE_COOKIE, GATE_TOKEN } from '@/lib/siteGate'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Site-wide password gate — runs before everything.
  const gateUnlocked = req.cookies.get(GATE_COOKIE)?.value === GATE_TOKEN
  if (pathname === '/gate' || pathname === '/api/gate') {
    if (pathname === '/gate' && gateUnlocked) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }
  if (!gateUnlocked) {
    const gateUrl = new URL('/gate', req.url)
    if (pathname !== '/') gateUrl.searchParams.set('next', pathname + req.nextUrl.search)
    return NextResponse.redirect(gateUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude api/ai, api/ai-advisor and api/express-interest so APIs return JSON instead of redirecting for fetch clients.
    // `DS` and `templates` are standalone, static reference sites under public/ — kept publicly reachable and outside auth (not linked from the product).
    '/((?!api/ai|api/ai-advisor|api/express-interest|DS|sitemap|templates|_next/static|_next/image|logos|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
}
