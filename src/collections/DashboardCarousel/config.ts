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
  ],
}
