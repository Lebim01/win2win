import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const body = await req.json()

    const exists = await payload.find({
      collection: 'customers',
      where: {
        email: {
          equals: body.email,
        },
      },
      limit: 1,
    })

    if (exists.totalDocs > 0) {
      return NextResponse.json(
        { error: 'Fallo inesperado', details: 'Email ya existe' },
        { status: 500 },
      )
    }

    const refCode = body.refCode ?? ''
    const root = await payload.find({
      collection: 'customers',
      where: refCode
        ? {
            refCode: {
              equals: refCode,
            },
          }
        : {
            email: {
              equals: 'root@example.com',
            },
          },
      limit: 1,
    })

    await payload.create({
      collection: 'customers',
      data: {
        email: body.email,
        role: 'customer',
        name: body.name,
        password: body.password,
        root: root.docs[0].id,
      },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: 'Fallo inesperado' }, { status: 500 })
  }
}
