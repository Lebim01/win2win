'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { activete } from '@/business/memberships'
import { NextResponse } from 'next/server'

export const POST = async (req: any) => {
  const payload = await getPayload({ config })

  const body = await req.json()

  const user = await payload.auth({
    headers: req.headers,
  })

  req.payload = payload
  req.user = user.user

  console.log(body)

  try {
    await activete(req, Number(body.userId), Number(body.membershipId), {
      activation: 'admin-activation',
    })

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    throw new Error(`Error activate user: ${(error as any).message}`)
  }
}
