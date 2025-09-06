import { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: { singular: 'Admin', plural: 'Admins' },
  auth: {
    verify: false,
    maxLoginAttempts: 10,
    tokenExpiration: 60 * 60 * 24 * 7, // 7 días
  },
  admin: { useAsTitle: 'email' },
  access: {
    // Solo un admin autenticado puede listar/leer/crear/editar/eliminar admins
    read: ({ req }) => !!req.user,
    create: ({ req }) => req.user?.collection === 'admins',
    update: ({ req }) => req.user?.collection === 'admins',
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
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Soporte', value: 'support' },
      ],
    },
  ],
  hooks: {
    // Evita que un admin “de segunda” cambie su propio rol a algo no permitido, etc.
    beforeChange: [
      ({ req, data, originalDoc, operation }) => {
        // Solo admins (colección admins) pueden crear/editar admins
        if (req.user?.collection !== 'admins') {
          throw new Error('No autorizado')
        }
        // (Opcional) Evita degradar el último super admin, etc.
        return data
      },
    ],
  },
}
