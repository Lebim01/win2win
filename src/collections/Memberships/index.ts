import { CollectionConfig } from 'payload'

const Membership: CollectionConfig = {
  slug: 'membership',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'planAmount', 'currency', 'maxLevels', 'bonus_direct_sale'],
    description:
      'Las membresias no se pueden eliminar por seguridad, pero si se pueden crear y modificar',
  },
  access: {
    delete: () => false,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { label: 'Precio', name: 'planAmount', type: 'number', required: true },
    {
      label: 'Moneda',
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      admin: { readOnly: true },
      required: true,
    },
    {
      label: 'Duración en meses',
      name: 'durationMonths',
      type: 'number',
      min: 1,
      defaultValue: 1,
      required: true,
      admin: {
        description:
          'Si cambias este valor solo funciona para las nuevas personas que compren la membresia, las personas que ya tenian una no se ven afectadas',
      },
    },
    {
      label: 'Max levels',
      name: 'maxLevels',
      type: 'number',
      max: 7,
      min: 3,
      defaultValue: 3,
      required: true,
    },
    {
      label: 'Tiene bono directo',
      name: 'bonus_direct_sale',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Bono 10%',
      },
    },
    {
      label: 'Visible',
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'El cliente puede ver esta membresia para comprarla',
      },
    },
    {
      label: 'QR',
      name: 'qr',
      type: 'group',
      fields: [
        {
          name: 'network',
          type: 'text',
          defaultValue: 'ERC20',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'address',
          type: 'text',
        },
        {
          label: 'Correo de soporte',
          name: 'supportEmail',
          type: 'text',
        },
      ],
    },
  ],
}

export default Membership
