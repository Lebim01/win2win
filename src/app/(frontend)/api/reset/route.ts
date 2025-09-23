// app/api/auth/reset-password/route.ts
import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { z } from 'zod'

// --- Opcional: reCAPTCHA ---
// Si usas turnstile/recaptcha, define RECAPTCHA_SECRET y manda recaptchaToken en el body.
// const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET

// --- Rate limit simple (en memoria) ---
// Nota: en serverless múltiples instancias no comparten memoria.
// Úsalo como “freno suave”; para producción, usa Redis.
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minuto
const RATE_LIMIT_MAX = 8 // 8 intentos/min
const ipHits = new Map<string, number[]>()

function rateLimit(ip: string) {
  const now = Date.now()
  const hits = ipHits.get(ip) ?? []
  const fresh = hits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  fresh.push(now)
  ipHits.set(ip, fresh)
  return fresh.length <= RATE_LIMIT_MAX
}

// --- Validación con Zod ---
const ResetSchema = z.object({
  token: z.string().min(10, 'Token inválido o expirado.'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .refine((v) => /[a-z]/.test(v), 'Debe incluir minúsculas.')
    .refine((v) => /[A-Z]/.test(v), 'Debe incluir mayúsculas.')
    .refine((v) => /\d/.test(v), 'Debe incluir números.')
    .refine((v) => /[^A-Za-z0-9]/.test(v), 'Debe incluir un símbolo.'),
  // recaptchaToken: z.string().optional(), // si activas reCAPTCHA
})

type ResetInput = z.infer<typeof ResetSchema>

// --- Helper de respuesta ---
function json(data: any, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

// --- (Opcional) Verificar reCAPTCHA ---
// async function verifyRecaptcha(token?: string) {
//   if (!RECAPTCHA_SECRET) return true
//   if (!token) return false
//   const params = new URLSearchParams()
//   params.set('secret', RECAPTCHA_SECRET)
//   params.set('response', token)
//   const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: params.toString(),
//     cache: 'no-store',
//   })
//   const data = await res.json()
//   return !!data.success
// }

// --- POST /api/auth/reset-password ---
export const POST = async (req: NextRequest) => {
  try {
    // Rate limit por IP
    // const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown'
    // if (!rateLimit(ip)) {
    //   return json(
    //     { ok: false, message: 'Demasiados intentos. Intenta en un minuto.' },
    //     { status: 429 },
    //   )
    // }

    // Parse/validación
    let body: ResetInput
    try {
      const raw = await req.json()
      body = ResetSchema.parse(raw)
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors
        return json({ ok: false, message: 'Datos inválidos', fieldErrors }, { status: 400 })
      }
      return json({ ok: false, message: 'Body inválido' }, { status: 400 })
    }

    // (Opcional) reCAPTCHA
    // const captchaOk = await verifyRecaptcha(body.recaptchaToken)
    // if (!captchaOk) {
    //   return json({ ok: false, message: 'Verificación fallida. Intenta de nuevo.' }, { status: 400 })
    // }

    const payload = await getPayload({ config: payloadConfig })

    // Ejecuta el reset en Payload
    const res = await payload.resetPassword({
      collection: 'customers',
      data: {
        password: body.password,
        token: body.token,
      },
      // Si tu endpoint es público para el reset, suele usarse overrideAccess
      overrideAccess: true,
    })

    // Nota: `payload.resetPassword` normalmente lanza si el token es inválido/expirado.
    // Si llega aquí, lo consideramos éxito.
    // (Opcional) Podrías invalidar sesiones previas aquí si usas sesiones personalizadas.

    return json({ ok: true, message: 'Contraseña actualizada correctamente.' }, { status: 200 })
  } catch (error: any) {
    console.log(error)
    // Normaliza mensajes comunes
    const msg = String(error?.message || '').toLowerCase()
    if (msg.includes('token') && (msg.includes('invalid') || msg.includes('expired'))) {
      return json(
        { ok: false, message: 'El enlace de recuperación es inválido o ha expirado.' },
        { status: 400 },
      )
    }

    return json(
      { ok: false, message: 'No se pudo restablecer la contraseña. Intenta de nuevo.' },
      { status: 500 },
    )
  }
}

// --- (Opcional) Habilitar CORS si llamas desde otro dominio ---
export const dynamic = 'force-dynamic' // evita caching en algunas plataformas

export async function OPTIONS() {
  // Ajusta orígenes permitidos si lo necesitas
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
