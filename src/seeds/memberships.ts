import { type Payload } from 'payload'

export const seedMemberships = async (payload: Payload) => {
  console.log('🌱 Seeding memberships...')

  await payload.create({
    collection: 'membership',
    data: {
      id: 1,
      name: 'Basic',
      currency: 'USD',
      planAmount: 24.99,
      maxLevels: 3,
      bonus_direct_sale: false,
      durationMonths: 1,
    },
  })

  await payload.create({
    collection: 'membership',
    data: {
      id: 2,
      name: 'Pro',
      currency: 'USD',
      planAmount: 150,
      maxLevels: 4,
      bonus_direct_sale: true,
      durationMonths: 1,
    },
  })

  await payload.create({
    collection: 'membership',
    data: {
      id: 3,
      name: 'Embajador',
      currency: 'USD',
      planAmount: 250,
      maxLevels: 4,
      bonus_direct_sale: true,
      durationMonths: 1,
    },
  })

  await payload.create({
    collection: 'membership',
    data: {
      id: 4,
      name: 'VIP',
      currency: 'USD',
      planAmount: 500,
      maxLevels: 5,
      bonus_direct_sale: true,
      durationMonths: 1,
    },
  })

  console.log('✅ Memberships creados.')
}
