import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protected_routes = ['/dashboard', '/profile', '/referrals', '/wallet']

const no_authenticated_routes = ['/sign-in']

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (pathname == '/') {
    const signinurl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signinurl)
  }

  if (protected_routes.includes(pathname)) {
    const token = request.cookies.get('payload-token')?.value

    if (!token) {
      const loginUrl = new URL('/sign-in', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (no_authenticated_routes.includes(pathname)) {
    const token = request.cookies.get('payload-token')?.value
    if (token) {
      const dashboardUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// El matcher aplica a TODO lo que no sea /_next ni assets estáticos
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
