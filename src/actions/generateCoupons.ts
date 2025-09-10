'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function createMassCoupons(data: { quantity: number; owner: number }) {
  const payload = await getPayload({ config })
  const created = []

  console.log({ data })

  try {
    for (let i = 1; i <= data.quantity; i++) {
      const coupon = await payload.create({
        collection: 'coupons',
        data: {
          owner: data.owner,
        },
      })
      created.push({
        id: coupon.id as number,
        code: coupon.code as string,
      })
    }
    return created
  } catch (error) {
    throw new Error(`Error creating coupons: ${(error as any).message}`)
  }
}
