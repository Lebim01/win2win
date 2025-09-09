import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload, Where } from 'payload'
import { getLoggedUser } from '../../utils'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const url = new URL(req.url)
    const searchParams = url.searchParams

    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const addWhere: Where = {}

    if (searchParams.has('level') && searchParams.get('level')) {
      addWhere.level = {
        equals: searchParams.get('level'),
      }
    }

    const query = await payload.find({
      collection: 'referral_payouts',
      where: {
        payee: {
          equals: user!.id,
        },
        ...addWhere,
      },
      depth: 1,
      populate: {
        customers: {
          name: true,
        },
      },
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: 10,
      sort: '-createdAt',
    })

    return NextResponse.json({
      docs: query.docs,
      totalDocs: query.totalDocs,
      totalPages: query.totalPages,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
