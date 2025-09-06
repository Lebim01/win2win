import { BasePayload } from 'payload'
import { seedCustomers } from './customers'

export const seed = async ({ payload }: { payload: BasePayload }) => {
  console.log('🌱 Iniciando seed...')
  await seedCustomers(payload)
  console.log('✅ Seed completado')

  process.exit(0)
}
