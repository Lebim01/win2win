import Indicator from '@/components/ui/indicator'
import { AdminViewServerProps } from 'payload'

const Dashboard = async ({ payload, user, searchParams }: AdminViewServerProps) => {
  const customers = await payload.count({
    collection: 'customers',
  })

  const customers_active = await payload.count({
    collection: 'customers',
    where: {
      'membership.isActive': {
        equals: true,
      },
    },
  })

  const customers_network = await payload.count({
    collection: 'customers',
    where: {
      placementLocked: {
        equals: true,
      },
    },
  })

  const bonus_total = await payload.db.drizzle
    .execute(
      `
    SELECT SUM(amount) as _total FROM public."referral_payouts"
  `,
    )
    .then((r: any) => r.rows[0])

  const used_coupons = await payload.count({
    collection: 'coupons',
    where: {
      redeemed: {
        equals: true,
      },
    },
  })

  return (
    <div className="view-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Indicator title="Usuarios totales" value={customers.totalDocs} />
        <Indicator title="Usuarios activos" value={customers_active.totalDocs} />
        <Indicator title="Usuarios en red" value={customers_network.totalDocs} />

        <Indicator title="Comisiones pagadas" value={bonus_total._total + ' USD'} />
        <Indicator title="Cupones usados" value={used_coupons.totalDocs} />
      </div>
    </div>
  )
}

export default Dashboard
