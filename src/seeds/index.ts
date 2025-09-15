import { BasePayload } from 'payload'
import { seedCustomers } from './customers'
import { ensureRootAdmin } from '@/scripts/create-initial-admin'
import { seedMemberships } from './memberships'

export const seed = async ({ payload }: { payload: BasePayload }) => {
  console.log('🌱 Iniciando seed...')
  await ensureRootAdmin(payload)
  await seedCustomers(payload)
  await seedMemberships(payload)
  console.log('✅ Seed completado')
}
