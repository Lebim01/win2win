// src/collections/ReferralPayouts.ts
import { CollectionConfig } from 'payload'

export const ReferralPayouts: CollectionConfig = {
  slug: 'referral_payouts',
  labels: { singular: 'Pago de referido', plural: 'Pagos de referidos' },
  admin: { useAsTitle: 'activationKey' },
  access: {
    read: ({ req }) => req.user?.collection === 'admins',
    create: ({ req }) => req.user?.collection === 'admins', // solo sistema/admin
    update: () => false,
    delete: ({ req }) => req.user?.collection === 'admins',
  },
  fields: [
    { name: 'activationKey', type: 'text', required: true, index: true }, // p.ej. `${payerId}:${periodStartISO}`
    { name: 'payer', type: 'relationship', relationTo: 'customers', required: true, index: true },
    { name: 'payee', type: 'relationship', relationTo: 'customers', required: true, index: true },
    { name: 'level', type: 'number', required: true, min: 1, max: 7, index: true },
    { name: 'amount', type: 'number', required: true }, // 2.00
    { name: 'currency', type: 'text', defaultValue: 'USD' },
    { name: 'description', type: 'text' },
    { name: 'meta', type: 'json' },
  ],
  timestamps: true,
}
