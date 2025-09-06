import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getLoggedUser } from '../../utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { user, response } = await getLoggedUser(payload, req)

    if (response) {
      return response
    }

    const { id: idUser } = await params

    const res = await payload
      .find({
        collection: 'customers',
        where: {
          id: {
            equals: Number(idUser),
          },
          ancestors: {
            in: user?.id,
          },
        },
        select: {
          id: true,
          name: true,
          referredBy: true,
          children: true,
          membership: true,
          childrenCount: true,
        },
        limit: 1,
      })
      .then((r) => (r.totalDocs > 0 ? r.docs[0] : null))

    return NextResponse.json(res)
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
