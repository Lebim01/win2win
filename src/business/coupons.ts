import { Coupon } from '@/payload-types'
import type { PayloadRequest } from 'payload'

export async function redeemCouponAtomically(
  req: PayloadRequest,
  code: string,
  payerId: number,
): Promise<{ ok: boolean; coupon?: Partial<Coupon>; reason?: string }> {
  const nowISO = new Date().toISOString()

  // Intento de update condicional: code coincide, NO redimido, no expirado
  const updated = await req.payload.update({
    collection: 'coupons',
    where: {
      and: [
        { code: { equals: code } },
        { redeemed: { equals: false } },
        {
          or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than: nowISO } }],
        },
      ],
    },
    data: {
      redeemed: true,
      redeemedBy: payerId,
      redeemedAt: nowISO,
    },
    depth: 0,
  })

  const doc = updated?.docs?.[0]
  if (!doc) {
    // Puede que no exista, esté ya usado o expirado
    // Revisemos si existe para responder motivo más claro
    const find = await req.payload.find({
      collection: 'coupons',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
    })
    const found = find.docs[0]
    if (!found) return { ok: false, reason: 'NOT_FOUND' }
    if (found.redeemed) return { ok: false, reason: 'ALREADY_REDEEMED' }
    if (found.expiresAt && new Date(found.expiresAt) <= new Date())
      return { ok: false, reason: 'EXPIRED' }
    return { ok: false, reason: 'CONFLICT' }
  }

  return {
    ok: true,
    coupon: {
      id: doc.id,
      code: doc.code,
      amountOff: doc.amountOff,
      currency: doc.currency,
      owner: (doc.owner as number) ?? (doc.owner as any)?.id,
      payoutEligible: !!doc.payoutEligible,
    },
  }
}
