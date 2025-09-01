import type { CollectionConfig, PayloadRequest } from 'payload'
import crypto from 'crypto'
import dayjs from 'dayjs'

function genCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase() // 6 chars
}

async function genUniqueCode(req: PayloadRequest) {
  for (let i = 0; i < 8; i++) {
    const code = genCode()
    const clash = await req.payload.find({
      collection: 'coupons',
      where: { code: { equals: code } },
      limit: 1,
      depth: 0,
    })
    if (!clash.docs.length) return code
  }
  // fallback (extiende longitud si hubo colisiones raras)
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  labels: { singular: 'Cupón', plural: 'Cupones' },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'owner', 'redeemed', 'redeemedBy', 'expiresAt'],
  },
  access: {
    read: ({ req }) => {
      // Admin ve todo. Un customer ve los cupones que le pertenecen (owner)
      if (req.user?.collection === 'admins') return true
      return { owner: { equals: req.user?.id ?? '___' } }
    },
    create: ({ req }) => req.user?.collection === 'admins', // crea solo admin (o cámbialo si quieres que los users creen)
    update: ({ req }) => req.user?.collection === 'admins',
    delete: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    // Código único del cupón (string corto)
    {
      name: 'code',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Random generate',
      },
    },

    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      unique: true,
      label: 'Dueño',
      admin: {
        description: 'Dueño del cupón: el usuario que lo puede "dar" a sus referidos',
        allowCreate: false,
        allowEdit: false,
      },
    },

    // Descuento (por defecto full $24.99). Puedes cambiarlo si algún cupón es parcial.
    {
      name: 'amountOff',
      type: 'number',
      defaultValue: 24.99,
      label: 'Valor del cupón',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      admin: { readOnly: true },
    },

    // Un solo uso
    {
      name: 'singleUse',
      type: 'checkbox',
      defaultValue: true,
      label: 'Se usa una sola vez?',
      admin: { readOnly: true },
    },

    // Estado de redención
    {
      name: 'redeemed',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      label: 'Ya está usado?',
      admin: { readOnly: true },
    },
    {
      name: 'redeemedBy',
      type: 'relationship',
      relationTo: 'customers',
      label: 'Usado por',

      admin: { readOnly: true, allowCreate: false, allowEdit: false },
    },
    { name: 'redeemedAt', type: 'date', label: 'Fecha usado', admin: { readOnly: true } },

    // Elegible para pagar comisiones a la upline (por defecto SÍ)
    {
      name: 'payoutEligible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Va pagar comisiones',
      admin: { readOnly: true },
    },

    // Expiración opcional
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Fecha de expiración',
      admin: { readOnly: true, description: 'Si el cupón no es usado antes de' },
    },

    // Metadatos o tracking (ej: campaña)
    { name: 'meta', type: 'json', admin: { readOnly: true, hidden: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation == 'create') {
          return {
            ...data,
            code: await genUniqueCode(req),
            expiresAt: dayjs().add(6, 'months').toISOString(),
          }
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/bulk-generate',
      method: 'post',
      handler: async (req) => {
        try {
          if (req.user?.collection !== 'admins') {
            return Response.json({ error: 'forbidden' }, { status: 403 })
          }

          const { ownerId, count } = (await req.json!()) as {
            ownerId: number
            count: number
          }

          if (!ownerId) return Response.json({ error: 'ownerId requerido' }, { status: 400 })

          const created: Array<{ id: number; code: string }> = []

          for (let i = 0; i < count; i++) {
            const doc = await req.payload.create({
              collection: 'coupons',
              data: {
                owner: ownerId,
              },
              depth: 0,
            })
            created.push({ id: doc.id, code: doc.code as string })
          }

          return Response.json({ ok: true, count: created.length, coupons: created })
        } catch (e) {
          console.error(e)
          return Response.json({ error: 'Bulk generate failed' }, { status: 500 })
        }
      },
    },
  ],
}
