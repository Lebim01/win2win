import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protected_routes = ['/dashboard', '/profile']

export function middleware(request: NextRequest) {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (protected_routes.includes(pathname)) {
    const token = request.cookies.get('payload-token')?.value

    if (!token) {
      const loginUrl = new URL('/sign-in', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: {
      // Apply new request headers
      headers: requestHeaders,
    },
  })
}

// El matcher aplica a TODO lo que no sea /_next ni assets estáticos
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
