import type { GlobalConfig } from 'payload'

export const DashboardCarousel: GlobalConfig = {
  slug: 'dashboard',
  access: {
    read: () => true,
  },
  fields: [
    {
      label: 'Carusel de imagenes',
      name: 'images',
      type: 'array',
      fields: [
        {
          type: 'upload',
          name: 'image',
          relationTo: 'media',
        },
      ],
      maxRows: 6,
      minRows: 1,
    },

    {
      name: 'items',
      label: 'Items de popup (secuenciales)',
      type: 'array',
      labels: {
        singular: 'Item',
        plural: 'Items',
      },
      admin: {
        description:
          'Cada item representa una imagen (u opcionalmente un CTA). Se mostrarán en el orden definido por "orden".',
      },
      fields: [
        {
          name: 'active',
          type: 'checkbox',
          label: 'Activo',
          defaultValue: true,
        },
        {
          name: 'title',
          label: 'Título (opcional)',
          type: 'text',
          localized: true,
          admin: { placeholder: 'Título breve del popup' },
        },
        {
          name: 'media',
          label: 'Imagen',
          type: 'upload',
          relationTo: 'media', // Ajusta al slug de tu colección de media
          required: true,
        },
        {
          name: 'link',
          type: 'group',
          label: 'Enlace opcional',
          fields: [
            { name: 'url', type: 'text', label: 'URL', required: false },
            {
              name: 'newTab',
              type: 'checkbox',
              label: 'Abrir en nueva pestaña',
              defaultValue: true,
            },
          ],
        },
        {
          name: 'validity',
          type: 'group',
          label: 'Vigencia específica (opcional)',
          fields: [
            { name: 'startAt', label: 'Desde', type: 'date' },
            { name: 'endAt', label: 'Hasta', type: 'date' },
          ],
        },
      ],
    },
  ],
}
