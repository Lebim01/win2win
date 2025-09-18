import { activete } from '@/business/memberships'
import { Coupon } from '@/payload-types'
import payloadConfig from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { createPayloadRequest, getPayload } from 'payload'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config: payloadConfig })
    const body = await req.json()

    /**
     * validar el email existente
     */
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

    /**
     * validar el username existente
     */
    const exists2 = await payload.find({
      collection: 'customers',
      where: {
        username: {
          equals: body.username,
        },
      },
      limit: 1,
    })

    if (exists.totalDocs > 0) {
      return NextResponse.json(
        { error: 'Fallo inesperado', details: 'Usuario ya existe' },
        { status: 500 },
      )
    }

    /**
     * El cupón no es requerido, si viene sin cupón entonces cae en el
     * codigo #1 de la empresa y se va al derrame
     */
    const refCode = body.refCode || ''
    const root = await payload
      .find({
        collection: 'customers',
        where: refCode
          ? {
              referralCode: {
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
      .then((r) => (r.totalDocs > 0 ? r.docs[0] : null))

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
        if (couponDocs.docs[0].owner == root!.id) {
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

    const newuser = await payload.create({
      collection: 'customers',
      data: {
        email: body.email,
        role: 'customer',
        name: body.name,
        password: body.password,
        root: root!.id,
        username: body.username,
        inviterCode: body.refCode,
        phone: body.phone,
        _verified: process.env.NODE_ENV == 'development',
      },
      disableVerificationEmail: process.env.NODE_ENV == 'development',
    })

    /**
     * activar despues de crear
     */
    if (coupon) {
      try {
        const payloadr = await createPayloadRequest({
          request: req,
          config: payloadConfig,
        })
        payloadr.user = { ...newuser, collection: 'customers' }

        await activete(payloadr, newuser.id, 1, {
          coupon: body.coupon,
        })
        await payload.update({
          collection: 'coupons',
          id: coupon.id,
          data: {
            redeemed: true,
            redeemedBy: newuser.id,
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
