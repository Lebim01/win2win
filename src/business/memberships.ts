import type { Admin, Customer } from '@/payload-types'
import type { BasePayload, PayloadRequest } from 'payload'
import { assign } from './referrals'
import { distributeReferralPayouts } from './referral-payouts'

export const MONTHLY_PRICE = 24.99
export const CURRENCY = 'USD'

/** Suma 1 mes manteniendo día cuando sea posible */
export function addOneMonth(d: Date) {
  const dt = new Date(d)
  const day = dt.getUTCDate()
  dt.setUTCMonth(dt.getUTCMonth() + 1)
  // Si el mes resultante no tiene ese día (p.ej. 31), ajusta al último día del mes
  if (dt.getUTCDate() < day) {
    dt.setUTCDate(0) // último del mes anterior
  }
  return dt
}

/** Devuelve [periodStart, periodEnd] para una activación/renovación:
 * - Si actualmente activo y renueva antes de vencer, el nuevo periodo inicia al final del actual (no pierde días).
 * - Si expirado/no activo, el periodo inicia ahora.
 */
export function computeNextPeriod(now: Date, currentEnd?: string | null) {
  let periodStart = now
  if (currentEnd) {
    const end = new Date(currentEnd)
    if (end.getTime() > now.getTime()) {
      // Renovación temprana: encadena al final del periodo en curso
      periodStart = end
    }
  }
  const periodEnd = addOneMonth(periodStart)
  return { periodStart, periodEnd }
}

/** Marca el estado activo/inactivo según fecha de hoy (útil en login o en cron) */
export async function ensureMembershipFlag(payload: BasePayload, customerId: string) {
  const doc = await payload.findByID({
    collection: 'customers',
    id: customerId,
    depth: 0,
    select: { id: true, membership: true },
  })

  const now = new Date()
  const end = doc?.membership?.currentPeriodEnd ? new Date(doc.membership.currentPeriodEnd) : null
  const isActive = !!(end && end.getTime() > now.getTime())

  await payload.update({
    collection: 'customers',
    id: customerId,
    data: { membership: { ...(doc.membership || {}), isActive } },
    depth: 0,
  })

  return isActive
}

export async function activete(
  req: PayloadRequest,
  customerId: number,
  amount: number,
  paymentRef?: any,
  meta?: any,
) {
  try {
    if (!customerId) throw 'customerId requerido'

    // Autorización básica:
    // - Admins siempre pueden activar a cualquiera
    // - Cliente solo puede activarse a sí mismo
    const isAdmin = (req.user as Admin | Customer).role == 'admin'
    if (!isAdmin && req.user?.id !== customerId) {
      throw 'No autorizado'
    }

    // Cargar el cliente
    const customer = await req.payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 0,
      select: {
        id: true,
        membership: true,
        membershipHistory: true,
        role: true,
        placementLocked: true,
        root: true,
      },
    })

    const now = new Date()

    // Validación de monto/currency (si forzas exacto 24.99 USD)
    const amt = typeof amount === 'number' ? amount : MONTHLY_PRICE
    const curr = CURRENCY
    if (amt !== MONTHLY_PRICE || curr !== CURRENCY) {
      throw `Monto/currency inválidos (esperado ${MONTHLY_PRICE} ${CURRENCY})`
    }

    // Calcular periodo nuevo (o encadenado)
    const currentEnd = customer?.membership?.currentPeriodEnd || null
    const { periodStart, periodEnd } = computeNextPeriod(now, currentEnd)

    // firstActivatedAt si es la primera vez
    const isFirstActivation = !customer?.membership?.firstActivatedAt
    const firstActivatedAt = isFirstActivation
      ? now.toISOString()
      : customer.membership?.firstActivatedAt

    // Actualizamos la membresía + historial
    const updateData: Partial<Customer> = {
      membership: {
        ...(customer.membership || {}),
        isActive: true,
        currentPeriodStart: periodStart.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        firstActivatedAt,
        planAmount: MONTHLY_PRICE,
        currency: CURRENCY,
      },
      membershipHistory: [
        ...(customer.membershipHistory || []),
        {
          activatedAt: now.toISOString(),
          periodStart: periodStart.toISOString(),
          periodEnd: periodEnd.toISOString(),
          amount: MONTHLY_PRICE,
          currency: CURRENCY,
          paymentRef: paymentRef || undefined,
          meta: meta || undefined,
        },
      ],
    }

    const updated = await req.payload.update({
      collection: 'customers',
      id: customerId,
      data: updateData,
      user: req.user,
    })

    // 👉 Disparar assign SOLO en primera activación, con invitación válida y sin estar fijado aún
    if (isFirstActivation && !customer.placementLocked) {
      try {
        if (customer.root) {
          await assign(req, customerId, customer.root as number)
        }
      } catch (e) {
        // No fallamos la activación por un error de colocación; logeamos para revisar
        console.warn('assign() failed on first activation', e)
      }
    }

    // Disparar dispercion de comisiones
    await distributeReferralPayouts(
      req.payload,
      customerId,
      `${customerId}:${periodStart.toISOString()}`,
    )

    return {
      ok: true,
      customerId: updated.id,
      membership: updated.membership,
      latestActivation: updated.membershipHistory?.[updated.membershipHistory.length - 1],
    }
  } catch (e: any) {
    console.error(e)
    if (e?.data) {
      console.error(e.data)
    }
    throw 'Membership activation failed'
  }
}
