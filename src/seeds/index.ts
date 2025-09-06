import { BasePayload } from 'payload'
import { seedCustomers } from './customers'
import { ensureRootAdmin } from '@/scripts/create-initial-admin'

export const seed = async ({ payload }: { payload: BasePayload }) => {
  console.log('🌱 Iniciando seed...')
  await ensureRootAdmin(payload)
  await seedCustomers(payload)
  console.log('✅ Seed completado')

  process.exit(0)
}
