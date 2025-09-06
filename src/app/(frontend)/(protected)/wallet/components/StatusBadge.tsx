import { Chip } from '@heroui/react'
import { CommissionRow } from '../types'

export function StatusBadge({ status }: { status: CommissionRow['status'] }) {
  const map: Record<CommissionRow['status'], { label: string; variant?: any; color?: any }> = {
    accrued: { label: 'Acumulada', color: 'secondary', variant: 'faded' },
    reversed: { label: 'Reversada', color: 'secondary', variant: 'bordered' },
    paid: { label: 'Pagada', color: 'secondary', variant: 'solid' },
  }
  const item = map[status]
  return (
    <Chip color={item.color} variant={item.variant}>
      {item.label}
    </Chip>
  )
}
