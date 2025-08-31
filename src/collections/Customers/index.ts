import { ensureUniqueReferralCode, resolveRootByInviterCode } from '@/business/customers'
import { Customer } from '@/payload-types'
import { CollectionConfig } from 'payload'
import { hookAssignSponsorFromInviterCode } from './hooks'
import { activete } from '@/business/memberships'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Cliente', plural: 'Clientes' },
  auth: {
    verify: true, // Envía email de verificación al registrarse
    maxLoginAttempts: 20,
    tokenExpiration: 60 * 60 * 24 * 10, // 10 días
  },
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => !user || user.collection !== 'admins',
  },
  access: {
    // Un admin puede ver todo; un customer solo se ve a sí mismo
    read: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return {
        id: {
          equals: req.user?.id ?? '___nope___',
        },
      }
    },
    create: () => true,
    update: ({ req }) => {
      if (req.user?.collection === 'admins') return true
      return {
        id: {
          equals: req.user?.id ?? '___nope___',
        },
      }
    },
    delete: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    // Rol fijo para customers (no editable por el propio usuario)
    {
      name: 'role',
      type: 'select',
      defaultValue: 'customer',
      required: true,
      admin: { readOnly: true },
      options: [{ label: 'Customer', value: 'customer' }],
    },

    // === REFERIDOS ===
    // código propio para compartir
    {
      name: 'referralCode',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'Código único para referidos' },
    },
    // código del sponsor que usó al registrarse (query ?ref=)
    {
      name: 'inviterCode',
      type: 'text',
      admin: { description: 'Código del sponsor usado al registrarse' },
    },
    // padre efectivo (antes llamado referredBy)
    {
      name: 'referredBy',
      type: 'relationship',
      relationTo: 'customers',
      index: true,
      admin: { description: 'Nodo padre efectivo (primer hueco BFS)' },
    },
    // raíz del subárbol (el sponsor cuyo código se usó)
    {
      name: 'root',
      type: 'relationship',
      relationTo: 'customers',
      index: true,
    },
    // nivel relativo al root (0..7)
    { name: 'level', type: 'number', min: 0, max: 7, index: true },
    // ruta de ancestros (root -> ... -> parent)
    {
      name: 'ancestors',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
      index: true,
    },
    // hijos directos (máx 5)
    {
      name: 'children',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
    },
    // contador para control rápido / atómico
    { name: 'childrenCount', type: 'number', defaultValue: 0, index: true },
    // se fija a true cuando la asignación quedó confirmada
    { name: 'placementLocked', type: 'checkbox', defaultValue: false },

    {
      name: 'membership',
      type: 'group',
      label: 'Membresía',
      fields: [
        { name: 'isActive', type: 'checkbox', defaultValue: false, index: true },
        { name: 'currentPeriodStart', type: 'date' },
        { name: 'currentPeriodEnd', type: 'date', index: true },
        { name: 'firstActivatedAt', type: 'date' },
        { name: 'planAmount', type: 'number', admin: { readOnly: true } },
        { name: 'currency', type: 'text', defaultValue: 'USD', admin: { readOnly: true } },
      ],
    },

    {
      name: 'membershipHistory',
      type: 'array',
      label: 'Historial de activaciones',
      labels: { singular: 'Activación', plural: 'Activaciones' },
      admin: { description: 'Cada activación/renovación mensual' },
      fields: [
        { name: 'activatedAt', type: 'date', required: true },
        { name: 'periodStart', type: 'date', required: true },
        { name: 'periodEnd', type: 'date', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'currency', type: 'text', defaultValue: 'USD' },
        // opcional: guarda referencia del pago/tx
        { name: 'paymentRef', type: 'text' },
        { name: 'meta', type: 'json' },
      ],
    },

    {
      name: 'wallet',
      type: 'group',
      label: 'Wallet',
      fields: [
        { name: 'balance', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        { name: 'totalEarned', type: 'number', defaultValue: 0, admin: { readOnly: true } },
        // opcional para retiros futuros:
        // { name: 'totalWithdrawn', type: 'number', defaultValue: 0, admin: { readOnly: true } },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation, originalDoc }) => {
        if (operation === 'create') {
          return { ...data, role: 'customer' }
        }
        if (operation === 'update' && req.user?.collection !== 'admins') {
          const { role, ...rest } = data || {}
          return { ...rest, role: originalDoc.role }
        }
        return data
      },

      hookAssignSponsorFromInviterCode,
    ],
  },

  endpoints: [
    {
      path: '/activate-all',
      method: 'post',
      handler: async (req) => {
        if (!req.user) return Response.json({ error: 'forbidden' }, { status: 403 })

        const customers = await req.payload.find({
          collection: 'customers',
          where: {
            'membership.isActive': {
              equals: false,
            },
          },
          sort: 'id',
        })

        for (const c of customers.docs) {
          await activete(req, c.id, 24.99)
        }

        return Response.json({
          ok: true,
          count: customers.totalDocs,
        })
      },
    },
  ],
}
