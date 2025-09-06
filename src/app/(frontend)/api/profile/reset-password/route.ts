import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })

    const body = await req.json()

    await payload.resetPassword({
      collection: 'customers',
      data: {
        password: body.newpassword,
        token: body.token,
      },
      overrideAccess: false,
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
