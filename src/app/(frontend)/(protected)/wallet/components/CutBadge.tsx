import { Chip } from '@heroui/react'
import { CutRow } from '../types'

export function CutBadge({ status }: { status: CutRow['status'] }) {
  const map: Record<CutRow['status'], { label: string; variant?: any; color?: any }> = {
    open: { label: 'Abierto', color: 'secondary', variant: 'faded' },
    closed: { label: 'Cerrado', color: 'secondary', variant: 'bordered' },
    paid: { label: 'Pagado', color: 'secondary', variant: 'solid' },
  }
  const item = map[status]
  return (
    <Chip color={item.color} variant={item.variant}>
      {item.label}
    </Chip>
  )
}
