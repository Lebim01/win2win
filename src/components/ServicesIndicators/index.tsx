import { Gutter } from '@payloadcms/ui'
import { AdminViewServerProps } from 'payload'

const ServicesIndicators = async (props: AdminViewServerProps) => {
  const pending = await props.payload.db.drizzle
    .execute(
      `
    SELECT sum(amount) as total FROM service_charges WHERE status = 'pending'  
  `,
    )
    .then((r: any) => r.rows[0])

  return (
    <Gutter className="grid grid-cols-3 pb-8 gap-4">
      <div className="card flex flex-col gap-1">
        <span className="text-lg">Pendientes</span>
        <span className="font-bold text-xl">{pending.total} USD</span>
      </div>
      <div className="card flex flex-col gap-1">
        <span className="text-lg">Wallet</span>
        <input
          defaultValue="0xa30133ecf7ba204915c5819d342dfa926cc2efaf"
          className="line-clamp-1 overflow-auto"
          readOnly
        />
      </div>
    </Gutter>
  )
}

export default ServicesIndicators
