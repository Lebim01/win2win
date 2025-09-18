import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })

    const query_response = await payload.find({
      collection: 'membership',
      where: {
        visible: {
          equals: true,
        },
      },
      depth: 3,
      limit: 10,
      sort: '-createdAt',
    })

    return NextResponse.json(query_response.docs)
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
