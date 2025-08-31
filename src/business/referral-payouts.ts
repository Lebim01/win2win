// src/lib/referral-payouts.ts
import type { BasePayload, PayloadRequest } from 'payload'

const COMMISSION_PER_LEVEL = 2.0
const MAX_LEVELS = 7
const CURRENCY = 'USD'

/**
 * Paga comisiones de referidos por una activación de membresía.
 * - Idempotente por activationKey (no duplica).
 * - Sube por ancestors (último = padre directo).
 *
 * @param req
 * @param payerId        ID del cliente que activó/renovó
 * @param activationKey  Clave única de activación (p.ej. `${payerId}:${periodStartISO}`)
 */
export async function distributeReferralPayouts(
  payload: BasePayload,
  payerId: number,
  activationKey: string,
) {
  // 0) Idempotencia global: si ya existe al menos un payout para esta activación, no pagues de nuevo
  const already = await payload.find({
    collection: 'referral_payouts',
    where: { activationKey: { equals: activationKey } },
    limit: 1,
    depth: 0,
  })
  if (already.docs.length > 0) {
    return { ok: true, reason: 'ALREADY_PAID' }
  }

  // 1) Cargar payer con ancestors
  const payer = await payload.findByID({
    collection: 'customers',
    id: payerId,
    depth: 0,
    select: { id: true, ancestors: true },
  })

  const ancestors: number[] = (payer.ancestors as number[] | undefined) ?? []
  if (!ancestors.length) {
    // No tiene upline: nada que pagar
    return { ok: true, payouts: 0 }
  }

  // Importante: nuestro buildAncestors guarda [root, ..., parent]
  // Para niveles: level 1 = parent, level 2 = abuelo, etc.
  const upline = ancestors.slice().reverse().slice(0, MAX_LEVELS)

  let created = 0
  for (let i = 0; i < upline.length; i++) {
    const payeeId = upline[i]
    const level = i + 1

    // Crear payout
    await payload.create({
      collection: 'referral_payouts',
      data: {
        activationKey,
        payer: payerId,
        payee: payeeId,
        level,
        amount: COMMISSION_PER_LEVEL,
        currency: CURRENCY,
      },
      depth: 0,
    })

    // Acreditar en el wallet del payee (incremento funcional)
    const payee = await payload.findByID({
      collection: 'customers',
      id: payeeId,
    })
    await payload.update({
      collection: 'customers',
      id: payeeId,
      data: {
        wallet: {
          balance: (payee.wallet?.balance ?? 0) + COMMISSION_PER_LEVEL,
          totalEarned: (payee.wallet?.totalEarned ?? 0) + COMMISSION_PER_LEVEL,
        },
      },
      depth: 0,
    })

    created++
  }

  return { ok: true, payouts: created }
}
