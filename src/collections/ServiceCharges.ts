import { CollectionConfig } from 'payload'

const ServiceCharges: CollectionConfig = {
  slug: 'service-charges',
  admin: {
    useAsTitle: 'service_name',
    components: {
      beforeList: ['@/components/ServicesIndicators'],
    },
  },
  access: {
    delete: () => false,
  },
  fields: [
    { name: 'service_name', type: 'text', required: true },
    { name: 'amount', type: 'number', required: true, min: 0, admin: { step: 0.01 } },
    { name: 'date', type: 'date', required: true },
    { name: 'currency', type: 'text', defaultValue: 'USD' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'pending', value: 'pending' },
        { label: 'paid', value: 'paid' },
      ],
    },
  ],
}

export default ServiceCharges
