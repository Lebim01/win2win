import payloadConfig from '@payload-config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({ config: payloadConfig })

  await payload.create({
    collection: 'service-charges',
    data: {
      amount: 25,
      date: new Date().toISOString(),
      service_name: 'Supabase',
      status: 'pending',
    },
  })

  return NextResponse.json({
    ok: true,
  })
}
