'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { activete } from '@/business/memberships'

const activateMembership = async (data: { userId: number; membershipId: number }) => {
  const payload = await getPayload({
    config,
  })

  try {
    await activete(
      {
        payload,
        user: {
          id: 1,
          role: 'admin',
          collection: 'admins',
        },
      } as any,
      data.userId,
      data.membershipId,
      {
        activation: 'admin-activation',
      },
    )
  } catch (error) {
    throw new Error(`Error creating coupons: ${(error as any).message}`)
  }
}

export default activateMembership
