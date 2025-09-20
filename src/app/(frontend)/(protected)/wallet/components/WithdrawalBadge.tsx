import { Badge, Chip } from '@heroui/react'
import { WithdrawalRow } from '../types'

export function WithdrawalBadge({ status }: { status: WithdrawalRow['status'] }) {
  const map: Record<WithdrawalRow['status'], { label: string; variant?: any; color: any }> = {
    pending: { label: 'Pendiente', color: 'secondary', variant: 'faded' },
    approved: { label: 'Procesando', color: 'secondary', variant: 'faded' },
    paid: { label: 'Pagado', color: 'secondary', variant: 'solid' },
    rejected: { label: 'Fallido', color: 'danger', variant: 'faded' },
  }
  const item = map[status]
  return (
    <Chip color={item.color} variant={item.variant}>
      {item.label}
    </Chip>
  )
}
