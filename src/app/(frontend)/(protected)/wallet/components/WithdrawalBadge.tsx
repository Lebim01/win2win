import { Badge, Chip } from '@heroui/react'
import { WithdrawalRow } from '../types'

export function WithdrawalBadge({ status }: { status: WithdrawalRow['status'] }) {
  const map: Record<WithdrawalRow['status'], { label: string; variant?: any; color: any }> = {
    processing: { label: 'Procesando', color: 'secondary', variant: 'faded' },
    paid: { label: 'Pagado', color: 'secondary', variant: 'solid' },
    failed: { label: 'Fallido', color: 'danger', variant: 'faded' },
    canceled: { label: 'Cancelado', color: 'secondary', variant: 'light' },
  }
  const item = map[status]
  return (
    <Chip color={item.color} variant={item.variant}>
      {item.label}
    </Chip>
  )
}
