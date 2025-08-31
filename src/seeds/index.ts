import payload from 'payload'
import { seedCustomers } from './customers'
import payloadConfig from '@payload-config'

const run = async () => {
  await payload.init({
    config: payloadConfig,
  })

  console.log('🌱 Iniciando seed...')
  await seedCustomers(payload)
  console.log('✅ Seed completado')

  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
