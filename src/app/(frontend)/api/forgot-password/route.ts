import payloadConfig from '@payload-config'
import { NextRequest } from 'next/server'
import { getPayload } from 'payload'

export const POST = async (req: NextRequest) => {
  const body = await req.json()
  const payload = await getPayload({ config: payloadConfig })

  await payload.forgotPassword({
    collection: 'customers',
    data: {
      email: body.email,
    },
  })
}
