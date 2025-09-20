import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getLoggedUser } from '../utils'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const url = new URL(req.url)
    const searchParams = url.searchParams

    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const query_response = await payload.find({
      collection: 'withdrawals',
      where: {
        user: {
          equals: user!.id,
        },
      },
      page: searchParams.has('page') ? Number(searchParams.get('page')) : 1,
      limit: 10,
      sort: '-createdAt',
    })

    const query = (await payload.db.drizzle.execute(`
      SELECT sum(amount) as amount FROM public.withdrawals w WHERE w.user_id = ${user!.id} AND w.status = 'pending'
    `)) as any

    return NextResponse.json({
      docs: query_response.docs,
      totalDocs: query_response.totalDocs,
      totalPages: query_response.totalPages,
      pending: query.rows[0].amount,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: payloadConfig })
  const { user, response } = await getLoggedUser(payload, req)
  if (response) return response

  const body = await req.json()

  const pending = await payload.find({
    collection: 'withdrawals',
    where: {
      user: {
        equals: user!.id,
      },
      status: {
        equals: 'pending',
      },
    },
  })

  const total_pending = pending.docs.reduce((a, b) => a + b.amount, 0)
  const available = (user?.wallet?.balance || 0) - total_pending

  if (available >= body.amount) {
    await payload.create({
      collection: 'withdrawals',
      data: {
        user: user!.id,
        status: 'pending',
        amount: body.amount,
        method: body.method,
        reference: body.reference,
      },
    })
    return Response.json({ ok: true })
  }
  return Response.json({ ok: false })
}
