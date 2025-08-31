import { ensureUniqueReferralCode, resolveRootByInviterCode } from '@/business/customers'
import { Customer } from '@/payload-types'
import {
  AfterChangeHook,
  BeforeChangeHook,
} from 'node_modules/payload/dist/collections/config/types'

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

  // si no hay inviterCode => usuario raíz de su propio subárbol
  const root = await resolveRootByInviterCode(req, d.inviterCode ?? '')
  if (!root) {
    d.root = undefined
    return d
  }

  d.root = root.id
  return d
}
