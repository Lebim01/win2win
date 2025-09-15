import { CollectionConfig } from 'payload'

const Membership: CollectionConfig = {
  slug: 'membership',
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'planAmount', type: 'number', required: true },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      admin: { readOnly: true },
      required: true,
    },
    { name: 'maxLevels', type: 'number', max: 7, min: 3, defaultValue: 3, required: true },
  ],
}

export default Membership
