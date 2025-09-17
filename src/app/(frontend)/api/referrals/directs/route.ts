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

    if (searchParams.has('status') && searchParams.get('status')) {
      addWhere['membership.isActive'] = {
        equals: searchParams.get('status') == 'active',
      }
    }

    if (searchParams.has('search') && searchParams.get('search')) {
      addWhere.OR = [
        {
          name: {
            contains: searchParams.get('search'),
          },
        },
        {
          email: {
            contains: searchParams.get('search'),
          },
        },
      ]
    }

    const query = await payload.find({
      collection: 'customers',
      where: {
        root: {
          equals: user!.id,
        },
        ...addWhere,
      },
      depth: 0,
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: 10,
      sort: '-createdAt',
      select: {
        id: true,
        name: true,
        email: true,
        membership: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      docs: query.docs,
      totalDocs: query.totalDocs,
      totalPages: query.totalPages,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
