import payloadConfig from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({ config: payloadConfig })

  await payload.create({
    collection: 'service-charges',
    data: {
      amount: 15,
      date: new Date().toISOString(),
      service_name: 'Vercel',
      status: 'pending',
    },
  })

  return NextResponse.json({
    ok: true,
  })
}
