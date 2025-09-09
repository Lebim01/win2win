import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getLoggedUser } from '../../utils'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const count = await payload.count({
      collection: 'coupons',
      where: {
        owner: {
          equals: user!.id,
        },
      },
    })

    if (count.totalDocs == 0) {
      return NextResponse.json({
        total: 0,
        used: 0,
        expires_at: null,
      })
    }

    const countUsed = await payload.count({
      collection: 'coupons',
      where: {
        owner: {
          equals: user!.id,
        },
        redeemed: {
          equals: true,
        },
      },
    })

    const response_query = await payload.find({
      collection: 'coupons',
      where: {
        owner: {
          equals: user!.id,
        },
        redeemed: {
          equals: false,
        },
      },
      limit: 1,
    })

    return NextResponse.json({
      total: count.totalDocs,
      used: countUsed.totalDocs,
      expires_at: response_query.docs[0].expiresAt,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
