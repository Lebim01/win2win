import payload, { BasePayload, PayloadRequest } from 'payload'
import { seedCustomers } from './customers'
import payloadConfig from '@payload-config'

export const seed = async ({
  payload,
  req: payloadReq,
}: {
  payload: BasePayload
  req: PayloadRequest
}) => {
  await payload.init({
    config: payloadConfig,
  })

  console.log('🌱 Iniciando seed...')
  await seedCustomers(payload)
  console.log('✅ Seed completado')

  process.exit(0)
}
