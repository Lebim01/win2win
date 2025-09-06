import { Progress } from '@heroui/react'

function getPasswordScore(pw: string) {
  // 0..4: heurística simple
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(4, score - 1)
}

export function PasswordStrength({ value = '' }: { value?: string }) {
  const score = getPasswordScore(value)
  const label = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte'][score]
  const pct = ((score + 1) / 5) * 100
  return (
    <div className="space-y-1">
      <Progress
        aria-label="Loading..."
        value={pct}
        color={pct < 40 ? 'danger' : pct < 80 ? 'warning' : 'success'}
      />
      <div className="text-xs text-muted-foreground">Seguridad: {label}</div>
    </div>
  )
}
