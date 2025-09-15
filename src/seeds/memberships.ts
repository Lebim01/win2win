import { type Payload } from 'payload'
import crypto from 'crypto'

export const seedMemberships = async (payload: Payload) => {
  console.log('🌱 Seeding memberships...')

  await payload.create({
    collection: 'membership',
    data: {
      name: 'Basic',
      currency: 'USD',
      planAmount: 25,
      maxLevels: 3,
    },
  })

  await payload.create({
    collection: 'membership',
    data: {
      name: 'Basic',
      currency: 'USD',
      planAmount: 25,
      maxLevels: 3,
    },
  })

  console.log('✅ Memberships creados.')
}
