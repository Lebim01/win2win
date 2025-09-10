import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const { code: refCode } = await params

    const user = await payload.find({
      collection: 'customers',
      limit: 1,
      where: {
        referralCode: {
          equals: refCode,
        },
      },
    })

    if (user.totalDocs > 0) {
      return NextResponse.json({
        name: user.docs[0].name,
      })
    }
  } catch (e: any) {
    console.log(e)
    return NextResponse.json(
      { error: 'Fallo inesperado', details: String(e?.message || e) },
      { status: 500 },
    )
  }
}
