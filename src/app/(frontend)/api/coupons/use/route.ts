import { activete } from '@/business/memberships'
import { Coupon, Customer } from '@/payload-types'
import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { createPayloadRequest, getPayload } from 'payload'
import { getLoggedUser } from '../../utils'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const body = await req.json()
    const { user, response } = await getLoggedUser(payload, req)
    if (response) return response

    let coupon: Coupon | undefined
    if (body.coupon) {
      /**
       * verificar que existe el cupon
       */
      const couponDocs = await payload.find({
        collection: 'coupons',
        limit: 1,
        where: {
          code: body.coupon,
        },
      })

      if (couponDocs.totalDocs > 0) {
        /**
         * el cupon solo se puede usar para inscribirse con el dueño del cupon
         */
        if (couponDocs.docs[0].owner == user!.root) {
          coupon = couponDocs.docs[0]
        } else {
          return NextResponse.json(
            { error: 'Fallo inesperado', details: 'Cupón invalidó' },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Fallo inesperado', details: 'Cupón invalidó' },
          { status: 500 },
        )
      }
    }

    /**
     * activar despues de crear
     */
    if (coupon) {
      try {
        const payloadr = await createPayloadRequest({
          request: req,
          config: payloadConfig,
        })
        payloadr.user = { ...(user as any), collection: 'customers' }

        await activete(payloadr, user!.id, 24.99, {
          coupon: body.coupon,
        })
        await payload.update({
          collection: 'coupons',
          id: coupon.id,
          data: {
            redeemed: true,
            redeemedBy: user!.id,
            redeemedAt: new Date().toISOString(),
          },
        })
      } catch (err) {
        console.error('Error usar cupon', err)
      }
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (e: any) {
    console.log(e)
    return NextResponse.json({ error: 'Fallo inesperado' }, { status: 500 })
  }
}
