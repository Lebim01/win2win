import payloadConfig from '@payload-config'
import { getPayload } from 'payload'

export const GET = async () => {
  const payload = await getPayload({ config: payloadConfig })
  const res = await payload.findGlobal({
    slug: 'dashboard',
    select: {
      images: true,
    },
    depth: 2,
  })
  return Response.json(res)
}
