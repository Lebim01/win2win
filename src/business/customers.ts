import { PayloadRequest } from 'payload'
import crypto from 'crypto'

// ---------- Utilidades de referidos ----------

export function generateReferralCode() {
  // 8 chars hex (suficiente, corto y legible)
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export async function ensureUniqueReferralCode(req: PayloadRequest) {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode()
    const clash = await req.payload.find({
      collection: 'customers',
      where: { referralCode: { equals: code } },
      limit: 1,
      depth: 0,
    })
    if (!clash?.docs?.length) return code
  }
  return generateReferralCode()
}

export async function resolveRootByInviterCode(req: PayloadRequest, inviterCode?: string) {
  if (!inviterCode) return null
  const res = await req.payload.find({
    collection: 'customers',
    where: { referralCode: { equals: inviterCode } },
    limit: 1,
    depth: 0,
    select: { id: true, level: true, childrenCount: true },
  })
  return res?.docs?.[0] ?? null
}
