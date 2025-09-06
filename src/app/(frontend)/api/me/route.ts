import payloadConfig from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

/**
 * Config
 * - Ajusta PAYLOAD_URL al dominio donde corre tu Payload CMS (mismo origin si está embebido).
 * - Si Next y Payload comparten dominio, bastará con forwardear la cookie.
 */
const PAYLOAD_URL =
  process.env.PAYLOAD_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') ||
  ''

/**
 * Helper: fetch a Payload REST endpoint con credenciales (cookie y/o bearer)
 */
async function payloadFetch(req: NextRequest, path: string, init?: RequestInit) {
  const token = req.cookies.get('payload-token')?.value
  const headers = new Headers(init?.headers || {})
  headers.set('Content-Type', 'application/json')

  // Forward de cookie (útil si Payload y Next comparten dominio)
  const cookieHeader: string[] = []
  if (token) cookieHeader.push(`payload-token=${token}`)

  if (cookieHeader.length) headers.set('Cookie', cookieHeader.join('; '))

  // También Authorization Bearer por compatibilidad
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const url = `${PAYLOAD_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
    cache: 'no-store',
  })

  return res
}

/**
 * GET /api/me
 * Responde con:
 *  - Datos del usuario autenticado (colección customers)
 */
export async function GET(req: NextRequest) {
  try {
    if (!PAYLOAD_URL) {
      return NextResponse.json({ error: 'PAYLOAD_URL no configurado' }, { status: 500 })
    }

    const payload = await getPayload({ config: payloadConfig })

    // ⚡ Autenticación: Payload guarda el JWT en la cookie `payload-token`
    // Aquí parseamos la cookie desde NextRequest
    const token = req.cookies.get('payload-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Obtener al usuario actual con el token
    const { user } = await payload.auth({
      headers: await getHeaders(),
    })

    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Responder con el shape que usa tu dashboard
    return NextResponse.json(user)
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return await res.text()
  }
}
