import { ensureUniqueReferralCode } from '@/business/customers'
import { Customer } from '@/payload-types'
import { BeforeChangeHook } from 'node_modules/payload/dist/collections/config/types'

export const hookAssignSponsorFromInviterCode: BeforeChangeHook<Customer> = async ({
  req,
  data,
  operation,
}) => {
  if (operation !== 'create') return data

  const d = { ...(data as Partial<Customer>) }

  // referralCode único
  if (!d.referralCode || !d.referralCode.trim()) {
    d.referralCode = await ensureUniqueReferralCode(req)
  }

  return d
}
