import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { getLoggedUser } from '../../utils'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    const body = await req.json()

    await payload.update({
      collection: 'customers',
      id: user!.id,
      data: {
        password: body.password,
      },
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
