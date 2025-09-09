import { CollectionConfig } from 'payload'

export const Withdrawals: CollectionConfig = {
  slug: 'withdrawals',
  labels: {
    singular: 'Withdrawal',
    plural: 'Withdrawals',
  },
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['user', 'amount', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      // Los admins pueden ver todos
      if (user?.collection == 'admins') return true
      // Los usuarios solo ven sus propios retiros
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => !!user, // cualquier usuario logueado puede solicitar retiro
    update: ({ req: { user } }) => user?.collection == 'admins',
    delete: ({ req: { user } }) => user?.collection == 'admins',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pendiente', value: 'pending' },
        { label: 'Aprobado', value: 'approved' },
        { label: 'Rechazado', value: 'rejected' },
        { label: 'Pagado', value: 'paid' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'method',
      type: 'select',
      options: [
        { label: 'Transferencia Bancaria', value: 'bank' },
        { label: 'PayPal', value: 'paypal' },
        { label: 'Crypto (USDT)', value: 'crypto' },
      ],
      required: true,
    },
    {
      name: 'reference',
      type: 'text',
      label: 'Detalles del método (ej. cuenta, wallet, correo)',
    },
  ],
}
